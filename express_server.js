const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
app.set("view engine", "ejs");
const PORT = 8080; 
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};
function generateRandomString() {
  return Math.random().toString(36).substr(6);
}
app.get("/", (req, res) => {
  res.redirect("/urls");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/urls/new", (req, res) => {
  const templateVars = {user:users[req.cookies["user_id"]]}
  res.render("urls_new", templateVars);
});
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL],user:users[req.cookies["user_id"]]};
  res.render("urls_show", templateVars);
});
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});
app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
});
app.get('/urls/:shortURL/edit',(req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
});
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user:users[req.cookies["user_id"]]};
  res.render("urls_index", templateVars);
});
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});
app.get("/register", (req, res) => {
  const templateVars= {user:users[req.cookies["user_id"]]}//the actual logged in user
  res.render('registration', templateVars);
});
app.get("/login", (req, res) => {
  const templateVars= {user:users[req.cookies["user_id"]]}//the actual logged in user
  res.render("login", templateVars);
});
app.post("/register", (req, res) => {
  let id = generateRandomString()
  users[id] = {id, email:req.body.email, password:req.body.password};
  if (req.body.email === '' || req.body.password === '') {
    res.status(400).send("Error: 400 there is no email");
    return res.redirect('/url');
  }
  for (let item in users) {
  if (req.body.email === users[item].email) {
    res.status(400).send("Error: 400 The user is already exit");
    return res.redirect('/url')
  }
}
  res.cookie("user_id", id)
  return res.redirect("/urls");
});
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});
app.post("/login", (req, res) => {
  for (let item in users) {
    if (req.body.email === users[item].email && req.body.password === users[item].password) {
      res.cookie("user_id", req.body.user_id);
      res.redirect('/urls');
    }
  }
  res.status(403).send("Error: 403");
  return res.redirect('/url')
});
app.post("/logout", (req, res) => {
  // res.clearCookie("username");
  res.clearCookie("user_id");
  res.redirect('/login');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});