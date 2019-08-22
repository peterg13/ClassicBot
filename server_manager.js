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


//get new character- done
//pull database - done
//combine - done
//call blizzard api for each character
//check for updates
//if so then update the database
//write to file for discord bot
getNewCharacters().then(newCharacters => {
  //console.log(newCharacters);
  pullDatabase().then(database =>{
    var addedCharacters = [];
    newCharacters.forEach(newCharacter => {
      if(!doesCharacterExist(newCharacter, database)){
        //adds the character to online database
        writeCharacterToFirebase(newCharacter);
        //adds character to our locally copied database for further evaluation
        addedCharacters.push(newCharacter);
      }
    })
    
    updateCharacters(database).then(promises => {
      //database now contains all the characters new and old
      addedCharacters.forEach(addedCharacter =>{
        database.push(addedCharacter);
      });
      writeDatabaseToFile(database);
      //console.log(database);
    });
    //database now contains all the characters new and old
    //addedCharacters.forEach(addedCharacter =>{
      //database.push(addedCharacter);
    //});
    //writeDatabaseToFile(database);
    //console.log(database);
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
  //clears the file of characters waiting to be added
  fs.writeFileSync("./charactersToAdd.json", JSON.stringify({"newCharacters": []}, null, 2));
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

function doesCharacterExist(checkCharacter, characterArray){
  for(let i = 0; i < characterArray.length; i++){
    var characterInArray = characterArray[i];
    if(characterInArray.getName().toLowerCase() === checkCharacter.getName().toLowerCase() && 
    characterInArray.getRealm().toLowerCase() === checkCharacter.getRealm().toLowerCase()){
      return true;
    }
  }
  return false;
};

function updateCharacters(database){ 
  var updatedCharactersPromises = database.map(dbCharacter => {
    //clone the character so we don't update the database itself
    var characterCopy = dbCharacter.clone();
    return armory.requestCharacter(characterCopy);
  });

  return Promise.all(updatedCharactersPromises).then(updatedCharacters => {  
    for(let i = 0; i < updatedCharacters.length; i++){
      for(let j = 0; j < database.length; j++){
        //first let's make sure we are comparing the correct characters.  if not, moves on to next character in database and checks again
        if(updatedCharacters[i].getName().toLowerCase() === database[j].getName().toLowerCase() &&
        updatedCharacters[i].getRealm().toLowerCase() === database[j].getRealm().toLowerCase()){
          //now we have to check if the level is different (no race changes exist in classic)
          if(updatedCharacters[i].getLevel() != database[j].getLevel()){
            //overwrites the database entry for that character
            writeCharacterToFirebase(updatedCharacters[i]);
          }
        }
      }
    }
  });
};

function writeCharacterToFirebase(character){
  let docRef = db.collection('/Classic').doc(character.getName());
  docRef.set(
    {
      name: character.getName(),
      realm: character.getRealm(),
      level: character.getLevel(),
      race: character.getRace(),
      class: character.getClass()
    }

  ).then(function () {return Promise.resolve()});
}

function writeDatabaseToFile(database){
  fs.writeFileSync("./local_database.json", JSON.stringify({"Characters": database}, null, 2));
}

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






