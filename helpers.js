//use email to find user in datebase
const getUserByEmail = function (email, users) {
  for (let userID in users) {
    if (users[userID].email === email) {
      return users[userID];
    }
  }
  return null;
}

//To generate a random 6 char String
const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8);
};

// find urls belong to user
const urlsForUser = function (userID, urlDatabase) {
  let obj ={};
  for (let id in urlDatabase){
    if(urlDatabase[id].userID === userID){
    obj[id] = urlDatabase[id].longURL; 
    }
  }
  return obj;
}


module.exports = {getUserByEmail, generateRandomString, urlsForUser};