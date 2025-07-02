const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


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
public_users.get('/',function (req, res) {
  //Write your code here
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  const bookId = parseInt(isbn);

  if (books[bookId]) {
    return res.status(200).json(books[bookId]);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }

 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;
    const matchingBooks = [];
  
    // 取得所有 book key
    const bookIds = Object.keys(books);
  
    // 遍歷所有書
    bookIds.forEach(id => {
      if (books[id].author.toLowerCase() === author.toLowerCase()) {
        matchingBooks.push({ isbn: id, ...books[id] });
      }
    });
  
    if (matchingBooks.length > 0) {
      return res.status(200).json(matchingBooks);
    } else {
      return res.status(404).json({ message: "No books found for this author" });
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  const title = req.params.title;
  const matchingBooks = [];

  for (let key in books){
    if (books[key].title.toLowerCase() === title.toLowerCase()){
        matchingBooks.push({isbn: key, ... books[key]});
    }
    if (matchingBooks.length>0){
        return res.status(200).json(matchingBooks);
    }else{
        return res.status(404).json({ message: "No books found with the given title" });
    }
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
