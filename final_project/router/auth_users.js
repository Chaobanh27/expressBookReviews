const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
  const userMatches = users.filter((user) => user.username === username);
  return userMatches.length > 0; 
}

// Check if the user with the given username and password exists
const authenticatedUser = (username, password) => {
  // Filter the users array for any user with the same username and password
  const validusers = users.filter((user) => {
      return (user.username === username && user.password === password);
  });
  // Return true if any valid user is found, otherwise false
  if (validusers.length > 0) {
      return true;
  } else {
      return false;
  }
}

//Task 7  Login as a Registered user
regd_users.post("/login", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;
  if(!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }

  if(authenticatedUser(username, password)) {
    const accessToken = jwt.sign({ data: username }, 'access', { expiresIn: '1h'})

    req.session.authorization = { accessToken, username };
    return res.status(200).json({message: "User successfully logged in", accessToken});
  }
  else{
    return res.status(401).json({message: "Invalid login. Check username and password"});
  }
});

//Task 8 Add/Modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const ISBN = req.params.isbn;
  const { review } = req.body; 
  
  if (!books[ISBN]) {
    return res.status(404).json({ message: "Book not found with the provided ISBN" });
  }

  if (!review || review.trim() === "") {
    return res.status(400).json({ message: "Review cannot be empty" });
  }

  // save the review to the book's reviews object using the username as the key
  const user = req.session.authorization.username;  // get the username from the session
  books[ISBN].reviews[user] = review;  // save the review using the username as the key

  return res.status(200).json({
    message: "Review successfully added",
    book: books[ISBN]
  });
});

//Task 9 Delete book review added by that particular user
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;
  if (books[isbn]) {
      let book = books[isbn];
      delete book.reviews[username];
      return res.status(200).send("Review successfully deleted");
  }
  else {
      return res.status(404).json({message: `ISBN ${isbn} not found`});
  }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
