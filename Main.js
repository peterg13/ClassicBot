//documentation: https://discord.js.org/#/docs/main/stable/general/welcome

//the file that contains the bot's Discord token (this file is in gitignore)
var discordAuth = require("./discordAuth.json");

//my character class
let Character = require('./character.js');

const fs = require('fs');

//necessary import needed for DiscordAPI
const Discord = require('discord.js');
//Discord user client used to run commands
const client = new Discord.Client();

//our local databases
const localDatabasePath = "./local_database.json";
const localDatabaseNoAPIPath = "./local_database_no_api.json";

//logs that the bot is logged in
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    //announces on Discord that the bot is online
    client.channels.get('415954951630618633').send('Classic Bot Online!');
});

//what happens when a message is received
client.on('message', message => {
    var splitMessage = message.content.split(" ");
    switch(splitMessage[0]){
      //calls the function which will add a character to our database
      case "!add":
        //this is for when the API becomes available
        /*if(splitMessage.length === 3){
          addCharacter(splitMessage[1], splitMessage[2]);
        }*/

        //this is the non-api version
        if(splitMessage.length === 2){
          addCharacterNoAPI(message, splitMessage[1]);
        }
        else{
          message.reply("make sure to only type in '!add character_name'");
        }
        break;

      //prints the local database into Discord
      case "!race":
        printLocalDatabase(message);
        break;

      //prints the help message
      case "!help":
        helpMessage(message);
        break;
    }
});

//adds a character to the specified file which will be picked up by our server
function addCharacter(characterName, characterRealm){
  var jsonCharactersToAdd = JSON.parse(fs.readFileSync("./charactersToAdd.json"));
  jsonCharactersToAdd["newCharacters"].push({"name": characterName, "realm": characterRealm});
  //prints a message to the console
  addCharacterConsoleMessage(jsonCharactersToAdd);
  //writes the file
  fs.writeFileSync("./charactersToAdd.json", JSON.stringify(jsonCharactersToAdd, null, 2)); 
};

//simply print to the console to keep up with what is being added
function addCharacterConsoleMessage(newJSON){
  console.log("\n----------------------------------------------------");
  console.log("----     New characters waiting to be added     ----");
  console.log("----------------------------------------------------");
  console.log(newJSON);
  console.log("----------------------------------------------------\n");
};

//prints a readable version of the local database
function printLocalDatabase(message){
  var database = JSON.parse(fs.readFileSync(localDatabasePath));
  var databaseCharacters = [];
  for(let i = 0; i < database.Characters.length; i++){
    databaseCharacters.push(new Character(database.Characters[i]._name, database.Characters[i]._realm, database.Characters[i]._level, database.Characters[i]._race, database.Characters[i]._class));
  }
  //databaseCharacters should now be an array of Character classes
  //lets sort the array in descending order based on level
  databaseCharacters.sort(function(a, b){return b.getLevel()-a.getLevel()});
  var databaseString = generateDiscordFriendlyDatabaseString(databaseCharacters, database.LastUpdated);
  message.channel.send(databaseString);
};

//function to get a string that displays the current race in an easy to read form
function generateDiscordFriendlyDatabaseString(characterArray, lastUpdated){
  var completedString = "```";
  for(let i = 0; i < characterArray.length; i++){
    completedString = completedString + (i+1) + ". (" + characterArray[i].getLevel() + ") " + characterArray[i].getName() + "\n";
  }
  completedString = completedString + "```\n"
  return completedString + "*" + lastUpdated + "*";
};

//prints the help message
function helpMessage(message){
  var helpMessage = "__**ClassicBot Commands**__\n";
  helpMessage = helpMessage + "!add name realm (adds a character to be tracked in the race)\n";
  helpMessage = helpMessage + "!race (prints the current stats for the race)\n";
  message.channel.send(helpMessage);
}

//Since there will be no API at launch we need a way to manually add and track characters
//---------------------------------------------------------------------------------------
//---------------        Functions used until the API is available        ---------------
//---------------------------------------------------------------------------------------

//adds a new character to our local database
function addCharacterNoAPI(message, characterName){
  var localDatabase = JSON.parse(fs.readFileSync(localDatabaseNoAPIPath));
  if(!isInDatabaseNoAPI(characterName, localDatabase.Characters)){
    localDatabase["Characters"].push({name: characterName, "level": 1});
    //prints a message to the console
    console.log("------------------------");
    console.log("Added: " + characterName);
    console.log("------------------------");
    //writes the file
    fs.writeFileSync(localDatabaseNoAPIPath, JSON.stringify(localDatabase, null, 2));
  }
  else{
    message.reply(characterName + " is already being tracked");
  }
  
};

//checks if the character is already in our databse.
function isInDatabaseNoAPI(name, databaseCharacters){
  for(let i = 0; i < databaseCharacters.length; i++){
    if(name.toLowerCase() === databaseCharacters[i].name.toLowerCase()){
      return true;
    }
  }
  return false;
}





//---------------------------------------------------------------------------------------

//logs the client in
client.login(discordAuth.token);