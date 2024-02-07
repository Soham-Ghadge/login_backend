require("dotenv").config();
const express = require("express");
const cors= require("cors")
const path = require("path");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const login_credentials = require("/Users/thesohamghadge/INERITANCE01/login_backend/models/loginModel.js");

const port = 3000;
const app = express();

//convert into json format
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

// connect to mongodb
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("listening on port", process.env.PORT);
      console.log("Connected to Mongo-DB");
    });
  })
  .catch((err) => {
    console.log(err);
  });

//using ejs as view engine
app.set("view engine", "ejs");
app.use(express.static("public"));

//landingpage
app.get('/', (req,res)=>{
    res.render("landingpage")
})

app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/signup", (req, res) => {
  res.render("signup");
});
app.get("/cryptocurrencies",(req,res)=>{
  res.render("cryptocurrencies")
})

//register user
//register user
app.post("/signup", async (req, res) => {
    const { username, password } = req.body;
  
    try {
      // Check if the username already exists
      const existingUser = await login_credentials.findOne({ username });
  
      if (existingUser) {
        return res.status(400).send("Username already exists");
      } else {
        // hash the password using bcrypt
        const saltRounds = 10; // Number of salt rounds for bcrypt
        const hashedPassword = await bcrypt.hash(password, saltRounds);
  
        // Create a new user with the hashed password
        const newUser = await login_credentials.create({ username, password: hashedPassword });
  
        // Optionally, you can send a response back to the client
        res.status(201).send("User successfully registered");
  
        console.log("User successfully registered:", newUser);
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  });
  

//login user
app.post("/login", async (req, res) => {
    try {
        const check = await login_credentials.findOne({ username: req.body.username });

        if (!check) {
            return res.send("User cannot be found");
        }

        // Compare the hashed password from the database with the password from the request
        const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);

        if (isPasswordMatch) {
            return res.render('home');
        } else {
            return res.send('Wrong password');
        }
    } catch (error) {
        console.error(error);
        return res.send("Error while processing login");
    }
});