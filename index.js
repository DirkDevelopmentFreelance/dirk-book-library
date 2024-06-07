import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";

const PORT = 3000;
const app = express();

const db = new pg.Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '123456',
    database: 'library'
});

db.connect();

//tbl READ_BOOKS
//id  PRIMARY KEY
//cover_id
//title
//author

//tbl USER_REVIEW
//id
//book_id FOREIGN KEY
//opinion
//rating

//https://openlibrary.org/search.json?q=the+lord+of+the+rings
/*
https://covers.openlibrary.org/b/$key/$value-$size.jpg
https://covers.openlibrary.org/b/isbn/0385472579-S.jpg
*/

let booksReadArr = [];

//let bookCoverIds = [];

const searchApiUrl = 'https://openlibrary.org/search.json';
const getCoverApiUrl = 'https://covers.openlibrary.org/b/isbn/';

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

const getBook = async (book_title) => {
    try {
        const response = await axios.get(searchApiUrl, {
            params: {
                q: book_title,
            }
        });
        const book = response.data;
        return book;
    } catch (err) {
        console.error(err);
    }
};
/*const getBookCoverIds = async () => {
    try {
        const response = await db.query('SELECT cover_code FROM books_read');
        const data = response.rows;
        data.forEach(row => bookCoverIds.push(row));
    } catch (err){
        console.error(err);
    }
    
};*/

const getBooksRead = async () => {
    try {
        const result = await db.query('SELECT * FROM books_read');
        const books = result.rows;
        if (!booksReadArr.length > 0) {
            booksReadArr = books;
        } else {
            books.forEach(book => booksReadArr.push(book));
        }
        return booksReadArr;
    } catch (err) {
        //TODO books_read error handle
    }
    
};

const getBookCoverUrl = async (cover_id) => {
    try {
        const response = await axios.get(`${getCoverApiUrl}${cover_id}-M.jpg`);
        return response.data;
    } catch (err) {
        console.error(err);
        return null; // Return null if cover is not found
    }
};
//FIXME get the right cover for the book
const getBooksReadWithCovers = async () => {
    try {
        const books = await getBooksRead();
        const booksWithCovers = await Promise.all(books.map(async (book) => {
            const coverUrl = await getBookCoverUrl(book.cover_id);
            return { ...book, coverUrl };
        }));
        return booksWithCovers;
    } catch (err) {
        console.error(err);
        return [];
    }
};

app.get("/", async (req, res) => {
    const booksRead = await getBooksReadWithCovers();
    res.render("index.ejs", {
        books: booksRead,
    });
});

app.get("/addbook", (req, res) => {
    res.render("addbook.ejs");
});

//TODO Edit Record
//TODO edit.ejs
app.get("/editbook", (req, res) => {

});

//TODO Delete record
app.get("/deletebook", (req, res) => {
    console.log(req.body);
    res.redirect("/");
});

//TODO add info to database
app.post("/add", async (req, res) => {
    const reqBody = req.body;
    const title = reqBody.btitle;
    const opinion = reqBody.bdescription;
    const rating = Number.parseInt(reqBody.brating);

    const bookReference = await getBook(title);
    const author_name = bookReference.docs[0].author_name[0];
    const cover_code = bookReference.docs[0].cover_edition_key;

    try {
        db.query('INSERT INTO books_read (title, cover_code, author, opinion, rating) VALUES ($1, $2, $3, $4, $5)', 
            [title, cover_code, author_name, opinion, rating]
        );
    } catch (err) {
        console.error(err);
    }
    
    res.redirect("/");
});

app.listen(PORT , () => {
    console.log(`Listening on localhost:${PORT}`)
});