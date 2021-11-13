const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 8080; 
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": {longURL:"http://www.lighthouselabs.ca", userID:"userRandomID"},
  "9sm5xK": {longURL:"http://www.google.com", userID:"user2RandomID"}
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
    password: bcrypt.hashSync("123", 10)
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
  if (req.cookies["user_id"]) {
  const templateVars = {user:users[req.cookies["user_id"]]}
  res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});     
app.get("/urls/:shortURL", (req, res) => {
  if (req.cookies["user_id"]) {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL ,user:users[req.cookies["user_id"]]};
  res.render("urls_show", templateVars);
} else {
  res.redirect('/login');
}
});
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});
app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL].longURL = longURL;
  res.redirect("/urls");
});
app.get('/urls/:shortURL/edit',(req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
  res.redirect("/urls");
});
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user:users[req.cookies["user_id"]]};
  res.render("urls_index", templateVars);
});
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
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
  if (req.body.email === '' || req.body.password === '') {
    res.status(400).send("Error: 400 there is no email");
    return res.redirect('/login');
  }
  for (let item in users) {
    console.log(users);
    if (req.body.email === users[item].email) {
      res.status(400).send("Error: 400 The user is already exit");
      return res.redirect('/login')
    }
  }
  users[id] = {id, email:req.body.email, password:bcrypt.hashSync(req.body.password, 10)};
  res.cookie("user_id", id)
  return res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString()
  urlDatabase[shortURL] = {longURL:req.body.longURL, userID:req.cookies.user_id}
    res.redirect("/urls");         // Respond with 'Ok' (we will replace this)
});
const any = function(email) {
  console.log(users);
  for (let elem in users) {
    
    console.log(elem);
    if (email === users[elem].email) {
      return elem;
    }
  }
};
app.post("/login", (req, res) => {
  if (!any(req.body.email)) {
    console.log("One")
  res.status(403).send("Error: 403");
  }
  if (!bcrypt.compareSync(req.body.password, users[any(req.body.email)].password)) {
   console.log("two")
    res.status(403).send ("Error: incorrect password");
  }
  res.cookie("user_id", any(req.body.email));
  res.redirect('/urls');
  
});
app.post("/logout", (req, res) => {
  // res.clearCookie("username");
  res.clearCookie("user_id");
  res.redirect('/login');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});