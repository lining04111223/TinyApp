const express = require("express");
const app = express();
const cookieParser = require('cookie-parser')
//const morgan = require('morgan');
const PORT = 8080;

app.set("view engine", "ejs");

//---------------middleware---------------------
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
//app.use(morgan('dev'));


//--------------function------------------------------
const generateRandomString = function () {
  let outputstring = "";
  let random =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  for (let i = 0; i < 6; i++)
    outputstring += random.charAt(Math.floor(Math.random() * random.length));
  return outputstring;
};

//-------------------database----------------------------------

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//----------------------get requests----------------------------
app.get("/urls",(req, res) => {
const templateVars = {urls: urlDatabase, user: users[req.cookies["user_id"]]};
  res.render("urls_index", templateVars);
})

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]]};
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id ];
  const templateVars = { id: req.params.id, longURL: longURL, user: users[req.cookies["user_id"]]};
  res.render("urls_show", templateVars);
  console.log('longurl1',longURL);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id ];
  const templateVars = { id: req.params.id, longURL: longURL, user: users[req.cookies["user_id"]]};
  res.redirect(longURL);
  console.log('longurl2',longURL);
});



app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World!" , user: users[req.cookies["user_id"]]};
  res.render("hello_world", templateVars);
});

//----------------------post requests--------------------
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const randomString = generateRandomString();
  urlDatabase[randomString] = req.body.longURL;
  res.redirect(`/urls/${randomString}`);
});

app.post("/urls/:id/delete", (req, res) => {
delete urlDatabase[req.params.id];
  res.redirect(`/urls`);
});

app.post("/urls/:id", (req, res) => {

  urlDatabase[req.params.id ] = req.body.longURL
  res.redirect(`/urls`);
});

//--------------------login-register-----------------

app.post("/login", (req, res) => {

  //res.cookie("username", req.body.username);
  //console.log("cookie",req.body.username);

  res.redirect(`/urls`);
});

app.post("/logout", (req, res) => {

  res.clearCookie("user_id");
  res.redirect(`/urls`);
});

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]]};
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const userID = generateRandomString();
  res.cookie("user_id", userID);
  console.log("user_id", req.cookies["user_id"]);
  console.log("userID", userID);
  users[userID]={
    id: userID,
    email: req.body.email,
    password: req.body.password,
  },
  console.log(users);

  res.redirect(`/urls`);
});




//------------------listen-------------------------
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});