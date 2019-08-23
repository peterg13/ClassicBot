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

//initilizes our connection with Firebase
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
      if(!doesCharacterExist(newCharacter, database) && isValidCharacter(newCharacter)){
        //adds the character to online database
        writeCharacterToFirebase(newCharacter);
        //adds character to our locally copied database for further evaluation
        addedCharacters.push(newCharacter);
      }
    })
    
    updateCharacters(database).then(promises => {
      addedCharacters.forEach(addedCharacter =>{
        database.push(addedCharacter);
      });
      //database now contains all the characters new and old
      writeDatabaseToFile(database);
      //console.log(database);
    });
    //database now contains all the characters new and old
    addedCharacters.forEach(addedCharacter =>{
      database.push(addedCharacter);
    });
    writeDatabaseToFile(database);
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
  if(isValidCharacter(checkCharacter)){
    for(let i = 0; i < characterArray.length; i++){
      var characterInArray = characterArray[i];
      if(characterInArray.getName().toLowerCase() === checkCharacter.getName().toLowerCase() && 
      characterInArray.getRealm().toLowerCase() === checkCharacter.getRealm().toLowerCase()){
        return true;
      }
    }
  }
  return false;
};

function updateCharacters(database){ 
  //gets the latest armory update for all characters in the online database and saves it in new array
  var updatedCharactersPromises = database.map(dbCharacter => {
    //clone the character so we don't update the database itself
    var characterCopy = dbCharacter.clone();
    return armory.requestCharacter(characterCopy);
  });

  //compares the new armory pull to what was in the database.  If there is an update it will push the update to Firebase
  return Promise.all(updatedCharactersPromises).then(updatedCharacters => {  
    for(let i = 0; i < updatedCharacters.length; i++){
      //first check is it is a valid character (in case something went wrong with the armory pull)
      if(isValidCharacter(updatedCharacters[i])){
        for(let j = 0; j < database.length; j++){
          //let's make sure we are comparing the correct characters.  if not, moves on to next character in database and checks again
          if(updatedCharacters[i].getName().toLowerCase() === database[j].getName().toLowerCase() &&
          updatedCharacters[i].getRealm().toLowerCase() === database[j].getRealm().toLowerCase()){
            //now we have to check if the level is different (no race changes exist in classic)
            if(updatedCharacters[i].getLevel() != database[j].getLevel()){
              //overwrites the database entry for that character
              console.log("Updated " + updatedCharacters[i].getName() + " level from " + database[j].getLevel() + " to " + updatedCharacters[i].getLevel());
              database[j] = updatedCharacters[i];
              writeCharacterToFirebase(updatedCharacters[i]);
              
            }
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
  var lastUpdated = getLastUpdated();
  fs.writeFileSync("./local_database.json", JSON.stringify({"Characters": database, "LastUpdated": lastUpdated}, null, 2));
}

function getLastUpdated(){
  var date = new Date();
  var todaysDate = (date.getMonth()+1) + "/" + date.getDate() + "/" + date.getFullYear();
  var currentHour = "";
  if(date.getHours() > 12 || date.getHours() == 0){
    currentHour = Math.abs(date.getHours() - 12);
  }
  else{
    curentHour = date.getHours();
  }
  if(currentHour < 10){
    currentHour = "0" + currentHour;
  }
  var currentMinute = date.getMinutes() < 10 ? "0"+date.getMinutes() : date.getMinutes();
  var currentTime = currentHour + ":" + currentMinute + (date.getHours()<12 ? "am" : "pm");
  var lastUpdated =  "Last Updated: " + todaysDate + " at " + currentTime + " PST";
  return lastUpdated;
}

function isValidCharacter(character){
  if(character.getName() === undefined || 
    character.getRealm() === undefined || 
    character.getLevel() === undefined ||
    character.getRace() === undefined ||
    character.getClass() === undefined){
    console.log(character.getName() + " : " + character.getRealm() + " is not a valid character");
    return false;
  }
  else {
    return true;
  }
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






