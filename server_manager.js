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

//----------------------------------------------------------------
//-------------          The program itself          -------------
//----------------------------------------------------------------

//initilizes out connection with Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://world-of-warcraft-51327.firebaseio.com"
});
//reference to out Firebase Database
let db = admin.firestore();


//get new character
//pull database
//combine
//call blizzard api for each character
//check for updates
//if so then update the database
//write to file for discord bot
getNewCharacters().then(newCharacters => {
  //console.log(newCharacters);
  pullDatabase().then(database =>{
    newCharacters.forEach(newCharacter => {
      //does not check if already exists
      database.push(newCharacter);
    })
    console.log(database);
  });
});




//----------------------------------------------------------------
//-------------           Useful functions           -------------
//----------------------------------------------------------------


//grabs the JSON objects of the new characters we need to add to our database
//takes each JSON object and creates a new character class for each, then passes it
//to our Blizzard API which will return a fully updated character
function getNewCharacters(){
  var newCharactersFile = JSON.parse(fs.readFileSync("./charactersToAdd.json"));
  var newCharacters = newCharactersFile.newCharacters;
  var tempCharacterArray = newCharacters.map(character => {
    return new Character(character.name, character.realm);
  });
  var promiseArray = tempCharacterArray.map(tempCharacter => {
    return armory.requestCharacter(tempCharacter);
  });
  //fs.writeFileSync("./charactersToAdd.json", JSON.stringify({"newCharacters": []}, null, 2));
  return Promise.all(promiseArray);
  
};

function pullDatabase(){
  return new Promise((resolve, reject) => {
    try{
      db.collection("Classic").get().then((snapshot) => {
        var characterArray = [];
        snapshot.forEach((doc) => {
          //console.log(doc.id, '=>', doc.data());
          var character = doc.data();
          characterArray.push(new Character(character.name, character.realm, character.level, character.race, character.class));
        });
        resolve(characterArray);
      })
      .catch((err) => {
        console.log('Error getting documents', err);
      });
    } catch (e){
      reject(e);
    }
  }) 
};
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


*/






