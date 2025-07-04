const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const axios = require('axios');

public_users.post("/register", (req,res) => {
  const{username, password}=req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
}
// 檢查是否已經存在相同 username
const userExists = users.find(user => user.username === username);

if (userExists) {
    return res.status(409).json({ message: "Username already exists" });
}

// 寫入新使用者
users.push({ username, password });

return res.status(200).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get("/", (req, res) => {
    // 以 Promise 取得資料
    const getBooks = new Promise((resolve, reject) => {
      resolve(books);
    });
  
    getBooks
      .then(data => {
        return res.status(200).json(data);
      })
      .catch(err => {
        return res.status(500).json({ message: "Error fetching books" });
      });
  });


// Get book details based on ISBN
public_users.get("/isbn/:isbn", async (req, res) => {
    try {
        const isbn = req.params.isbn;

        // 這裡打自己的 endpoint
        const response = await axios.get(`http://localhost:5000/booksdata/${isbn}`);

        res.status(200).json(response.data);
    } catch (error) {
        res.status(404).json({ message: "Book not found" });
    }
});

public_users.get("/booksdata/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const bookId = parseInt(isbn);
    if (books[bookId]) {
        res.status(200).json(books[bookId]);
    } else {
        res.status(404).json({ message: "Book not found" });
    }
});

  
// Get book details based on author with Promise
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;

    new Promise((resolve, reject) => {
        const matchingBooks = [];
        const bookIds = Object.keys(books);

        bookIds.forEach(id => {
            if (books[id].author.toLowerCase() === author.toLowerCase()) {
                matchingBooks.push({ isbn: id, ...books[id] });
            }
        });

        if (matchingBooks.length > 0) {
            resolve(matchingBooks);
        } else {
            reject("No books found for this author");
        }
    })
    .then(data => {
        return res.status(200).json(data);
    })
    .catch(err => {
        return res.status(404).json({ message: err });
    });

});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    try {
        const title = req.params.title.toLowerCase();

        // 使用 axios 呼叫本地 API (模擬)
        const response = await axios.get('http://localhost:5000/');
        const allBooks = response.data;

        const bookIds = Object.keys(allBooks);

        const matchingBooks = [];
        bookIds.forEach(id => {
            if (allBooks[id].title.toLowerCase() === title) {
                matchingBooks.push({ isbn: id, ...allBooks[id] });
            }
        });

        if (matchingBooks.length > 0) {
            return res.status(200).json(matchingBooks);
        } else {
            return res.status(404).json({ message: "No books found with the given title" });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error retrieving book data" });
    }

});
//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;

    // 檢查是否存在這本書
    if (books[isbn]) {
        const reviews = books[isbn].reviews;
        return res.status(200).json(reviews);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;
