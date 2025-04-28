const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Check if a user with the given username already exists
const doesExist = (username) => {
  // Filter the users array for any user with the same username
  let userswithsamename = users.filter((user) => {
      return user.username === username;
  });
  // Return true if any user with the same username is found, otherwise false
  if (userswithsamename.length > 0) {
      return true;
  } else {
      return false;
  }
}

//Task 6 register a new user
public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if(username && password) {
      if(!doesExist(username)) {
        // If the username doesn't exist, create a new user object and add it to the users array
        let user = {"username": username, "password": password};
        users.push(user);
        return res.status(200).json({message: "User successfully registered. Now you can login"});
      } else {
        // If the username already exists, return an error message
        return res.status(404).json({message: "User already exists! Choose another username"});
      }
  }
  return res.status(300).json({message: "Yet to be implemented"});
});

//Task 1 : Get the book list available in the shop
public_users.get('/',function (req, res) {
  //check if the books object is not empty and has a length greater than 0
  if (books) {
    return res.status(200).send(JSON.stringify(books, null, 4));
  } else {
    return res.status(404).json({ message: "No books found in the shop" });
  }
});

// Task 2 : Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const ISBN = req.params.isbn;

  //check if the book with the given ISBN exists in the books object
  if (books[ISBN]) {
    return res.status(200).send(books[ISBN]);
  } else {
    return res.status(404).json({ message: "Book not found with the provided ISBN" });
  }
});

//Task 3 Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author.toLowerCase(); // change to lowercase for case-insensitive search
  
  // search for books by the author in the books object
  const booksByAuthor = Object.values(books).filter(book => book.author.toLowerCase().includes(author));

  if (booksByAuthor.length > 0) {
    return res.status(200).json(booksByAuthor);
  } else {
    return res.status(404).json({ message: "No books found by this author" });
  }
});

//Task 4 Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title.toLowerCase(); // change to lowercase for case-insensitive search
  
  const booksByTitle = Object.values(books).filter(book => book.title.toLowerCase().includes(title));

  if (booksByTitle.length > 0) {
    return res.status(200).json(booksByTitle);
  } else {
    return res.status(404).json({ message: "No books found with the provided title" });
  }
});

//Task 5  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const ISBN = req.params.isbn; 

  const book = books[ISBN];
  if (!book) {
    return res.status(404).json({ message: "Book not found with the provided ISBN" });
  }

  if (Object.keys(book.reviews).length === 0) {
    return res.status(404).json({ message: "No reviews found for this book" });
  }

  return res.status(200).json({ reviews: book.reviews });
});


async function getAllBooks() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(Object.values(books));
    }, 1000); 
  });
}
// Task 10 Get all books using async callback function
public_users.get('/', async function (req, res) {
  try {
    const booksList = await getAllBooks(); 
    return res.status(200).json(booksList); 
  } catch (error) {
    return res.status(500).json({ message: "Failed to get books", error: error.message });
  }
});

function searchBookByISBN(isbn) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const book = books[isbn];  
      if (book) {
        resolve(book); 
      } else {
        reject(new Error("Book not found")); 
      }
    }, 1000); 
  });
}

// Task 11 Search by ISBN using Promises
public_users.get('/isbn/:isbn', function (req, res) {
  const ISBN = req.params.isbn; 
  searchBookByISBN(ISBN)
    .then(book => {
      if (book) {
        return res.status(200).json(book); 
      } else {
        return res.status(404).json({ message: "Book not found" }); 
      }
    })
    .catch(error => {
      return res.status(500).json({ message: "Error searching for book", error: error.message });
    });
});

async function searchByAuthor(author) {
  try {
    const result = Object.values(books).filter(book => book.author.toLowerCase().includes(author.toLowerCase()));
    
    if (result.length === 0) {
      throw new Error(`No books found for author: ${author}`);
    }

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
}

function searchByTitlePromise(title) {
  return new Promise((resolve, reject) => {
    const result = Object.values(books).filter(book => book.title.toLowerCase().includes(title.toLowerCase()));
    
    if (result.length === 0) {
      reject(`No books found for title: ${title}`);
    } else {
      resolve(result);
    }
  });
}

//Task 12 Get book details based on author using async callback function
public_users.get('/author/:author', async (req, res) => {
  const author = req.params.author;
  try {
    const books = await searchByAuthor(author);
    res.status(200).json(books);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

/// Task 13 Get all books based on title – Using Promises
public_users.get('/title/:title', (req, res) => {
  const title = req.params.title;
  searchByTitlePromise(title)
    .then(books => {
      res.status(200).json(books);
    })
    .catch(error => {
      res.status(404).json({ message: error });
    });
});




module.exports.general = public_users;
