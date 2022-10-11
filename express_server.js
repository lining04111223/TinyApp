const express = require("express");
const app = express();
const cookieSession = require('cookie-session')
const bcrypt = require("bcryptjs");
const morgan = require('morgan');
const {getUserByEmail} = require('./helpers');
const PORT = 8080;

//--------------------middleware-----------------------
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['secret'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
app.use(morgan('dev'));

//--------------------function-------------------------
//
const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8);
};

const urlsForUser = function (userID) {
  let obj ={};
  for (let id in urlDatabase){
    if(urlDatabase[id].userID === userID){
    obj[id] = urlDatabase[id].longURL; 
    }
  }
  return obj;
}

//--------------------database-------------------------
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
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

//--------------------get requests---------------------
//if user is not logged in,return error!
app.get("/urls",(req, res) => {
  if(!req.session.user_id){
    return res.send('<html><body>Please <a href="/login">Login</a> !</body></html>')};
    
  const templateVars = {urls:urlsForUser(req.session.user_id) , user: users[req.session.user_id]};
  res.render("urls_index", templateVars);
})

//1 if not logged in,redirect to /login; 2 if logged in,redirect to /urls!
app.get("/",(req, res) => {
  if(!req.session.user_id){
    res.redirect(`/login`);};
  res.redirect(`/urls`);
});

//create new tinyurl.
app.get("/urls/new", (req, res) => {
  if(!req.session.user_id){
    return res.redirect("/login")};
  const templateVars = { user: users[req.session.user_id]};
  res.render("urls_new", templateVars);
});

//1 if user is not logged in; 2 if given ID does not exist;3 not own the URL; return relevant error message!
app.get("/urls/:id", (req, res) => {
  if(!req.session.user_id){
    return res.send('<html><body>Please <a href="/login">Login</a> !</body></html>')};
  const urlobj = urlDatabase[req.params.id];
  if(!urlobj){
    return res.send("ID don't exit!");
  }
  const longURL = urlobj.longURL;
  if(urlobj.userID !== req.session.user_id){
    return res.status(400).send("URL does not belong to you!")
  }

  const templateVars = { id: req.params.id, longURL: longURL, user: users[req.session.user_id]};
  res.render("urls_show", templateVars);
});

//if the id does not exist,return error!
app.get("/u/:id", (req, res) => {
  const urlobj = urlDatabase[req.params.id];
  if(!urlobj){
    return res.send("ID don't exit!");
  };
  const longURL = urlobj.longURL;
  res.redirect(longURL);
});

//--------------------first test-----------------------
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World!" , user: users[req.session.user_id]};
  res.render("hello_world", templateVars);
});

//--------------------post requests--------------------
app.post("/urls", (req, res) => {
  if(!req.session.user_id){
   return res.send('<html><body>Please <a href="/login">Login</a> !</body></html>')};
  const randomString = generateRandomString();//create random new id
  urlDatabase[randomString] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
  }
  res.redirect(`/urls/${randomString}`);
});

//1 if user is not logged in; 2 if given ID does not exist;3 not own the URL; return relevant error message!
app.post("/urls/:id/delete", (req, res) => {
  if(!req.session.user_id){
    return res.send('<html><body>Please <a href="/login">Login</a> !</body></html>')};
  const urlobj = urlDatabase[req.params.id]
  if(!urlobj){
    return res.send("ID don't exit!");
  }
  if(urlobj.userID !== req.session.user_id){
    return res.status(400).send("URL does not belong to you!")
  }
  delete urlDatabase[req.params.id];
  res.redirect(`/urls`);
});

app.post("/urls/:id", (req, res) => {
  if(!req.session.user_id){
    return res.send('<html><body>Please <a href="/login">Login</a> !</body></html>')};
  const urlobj = urlDatabase[req.params.id];
  if(!urlobj){
    return res.send("ID don't exit!");
  }
  if(urlobj.userID !== req.session.user_id){
    return res.status(400).send("URL does not belong to you!")
  }
  urlobj.longURL = req.body.longURL;
  res.redirect(`/urls`);
});

//--------------------login-register-------------------
app.get("/login", (req, res) => {
  if(req.session.user_id){
  return res.redirect(`/urls`)};
  const templateVars = { user: users[req.session.user_id]};
  res.render("login", templateVars);
});

//1 No email or password; 2 wrong user; 3 wrong password; return relevant error message!
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;  
  const databaseUser = getUserByEmail(email, users);
  //Login Errors
  if (!email || !password) {
    return res.status(400).send('Please insert email and password!');
  }
  if (!databaseUser) {
    return res.status(403).send('No user registered with the email!');
  }
  const ckeckpassword = bcrypt.compareSync(password, databaseUser.password);
  if (!ckeckpassword) {
    return res.status(403).send('Password is not correct!');
  }
  req.session.user_id = databaseUser.id;
  res.redirect(`/urls`);
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/urls`);
});

app.get("/register", (req, res) => {
  if(req.session.user_id){
    return res.redirect(`/urls`)};
  const templateVars = { user: users[req.session.user_id]};
  res.render("register", templateVars);
});

////1 No email or password; 2 email was used; return relevant error message!
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send('Please insert email and password!');
  }
  const databaseUser = getUserByEmail(email, users);
  if (databaseUser) {
    return res.status(400).send('Email is already used!');
  }
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  const userID = generateRandomString();
  req.session.user_id = userID;
  users[userID]={
    id: userID,
    email: email,
    password: hash,
  },
  res.redirect(`/urls`);
});

//--------------------listen---------------------------
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});