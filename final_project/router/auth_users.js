const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
return users.some((user) => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
return users.some((user) => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (!isValid(username)) {
        return res.status(401).json({ message: "Invalid user" });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid password" });
    }

    // 建立 JWT
    const accessToken = jwt.sign({ username: username }, "access", { expiresIn: '1h' });

    // 寫入 session
    req.session.authorization = { accessToken, username };

    return res.status(200).json({ message: "User successfully logged in" });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;

    // 從 session 中抓取登入使用者
    const username = req.session.authorization?.username;

    if (!username) {
        return res.status(401).json({ message: "User not authenticated" });
    }

    // 檢查書是否存在
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // 寫入或更新該使用者的評論
    books[isbn].reviews[username] = review;

    return res.status(200).json({ message: "Review added/updated successfully", reviews: books[isbn].reviews });
});
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;

    // 檢查書籍是否存在
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // 從 session 取得目前登入使用者
    const username = req.session.authorization?.username;

    if (!username) {
        return res.status(403).json({ message: "User not logged in" });
    }

    // 檢查該使用者是否曾經寫過評論
    if (books[isbn].reviews[username]) {
        delete books[isbn].reviews[username]; // 只刪除自己
        return res.status(200).json({ message: "Review deleted successfully" });
    } else {
        return res.status(404).json({ message: "No review found for this user" });
    }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
