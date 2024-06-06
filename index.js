import express from "express";
import bodyParser from "body-parser";

const PORT = 3000;
const app = express();


//https://openlibrary.org/search.json?q=the+lord+of+the+rings
/*
https://covers.openlibrary.org/b/$key/$value-$size.jpg
https://covers.openlibrary.org/b/isbn/0385472579-S.jpg
*/
const searchApiUrl = 'https://openlibrary.org/search.json';
const getCoverApiUrl = 'https://covers.openlibrary.org/b/isbn/';

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.get("/addbook", (req, res) => {
    res.render("addbook.ejs");
});

app.listen(PORT , () => {
    console.log(`Listening on localhost:${PORT}`)
});