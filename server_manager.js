const fs = require('fs');
let Character = require('./character.js'); 
const admin = require('firebase-admin');
let serviceAccount = require("./world-of-warcraft-51327-firebase-adminsdk-18c0w-31ebb1fafd.json");
//the file that contains the bots Blizzard ID and Secret
var blizzardAuth = require("./blizzardAuth.json");
//import for my own Blizzard API
var Blizzard = require('./blizzardAPI.js');
//Reference to our Blizzard API to request from Blizzard
var armory = new Blizzard(blizzardAuth.ID, blizzardAuth.Secret);

//initilizes out connection with Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://world-of-warcraft-51327.firebaseio.com"
});
//reference to out Firebase Database
let db = admin.firestore();


var newCharactersFile = JSON.parse(fs.readFileSync("./charactersToAdd.json"));
var newCharacters = newCharactersFile.newCharacters;
var newCharacterArray = [];
newCharacters.forEach(function(element){
  var tempCharacter = new Character(element.name, element.realm, 0, 0, 0);
  newCharacterArray.push(tempCharacter);
});
//console.log(newCharacterArray);
//fs.writeFileSync("./charactersToAdd.json", JSON.stringify({"newCharacters": []}, null, 2));
var tankadinn = new Character("Tankadinn", "Darkspear", 120, 30, 2);
//console.log("server: " + armory.requestCharacter(tankadinn));
armory.requestCharacter(tankadinn, response => {
  console.log(response);
});



/*
var tankadinn = new Character("Tankadinn", "Darkspear", 120, 30, 2);

let docRef = db.collection('/Classic').doc(tankadinn.getName());
docRef.set(
  {
    name: tankadinn.getName(),
    realm: tankadinn.getRealm(),
    level: tankadinn.getLevel(),
    race: tankadinn.getRace(),
    class: tankadinn.getClass()
  }

).then(function () {return Promise.resolve()});
*/
/*

db.collection("Classic").get()
  .then((snapshot) => {
    snapshot.forEach((doc) => {
      console.log(doc.id, '=>', doc.data());
    });
  })
  .catch((err) => {
    console.log('Error getting documents', err);
  });
*/






