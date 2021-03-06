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
    //client.channels.find(channel => channel.name === "general-chat").send('Classic Bot Online!');
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
          message.reply("not a valid command. Type !help for a list of available commands");
        }
        break;

      //prints the local database into Discord
      case "!race":
        printLocalDatabase(message);
        break;

      //levels up a character in our database.  If no level entered it ups it by 1, otherwise it changes to the level entered
      case "!ding":
        //dings the authors character if they only have one in the DB
        if(splitMessage.length === 1){
          ding(message);
        }
        //dings given character by 1
        else if(splitMessage.length === 2){
          dingName(message, splitMessage[1]);
        }
        //sets character to level
        else if(splitMessage.length === 3){
          setCharacterLevel(message, splitMessage[1], splitMessage[2]);
        }
        else{
          message.reply("not a valid command. Type !help for a list of available commands");
        }
        break;

      //realm info
      case "!realm":
      case "!thigh":
        highmane(message);
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
  //api version
  //helpMessage = helpMessage + "!add name realm (adds a character to be tracked in the race)\n";
  //helpMessage = helpMessage + "!race (prints the current stats for the race)\n";

  //non api version
  helpMessage = helpMessage + "**!add <CharacterName>**\n-`adds a character to be tracked in the race`\n";
  helpMessage = helpMessage + "**!race**\n-`prints the current stats for the race`\n";
  helpMessage = helpMessage + "**!ding**\n-`if you have only one character it levels it up by 1`\n";
  helpMessage = helpMessage + "**!ding <CharacterName>**\n-`levels up a character by 1`\n";
  helpMessage = helpMessage + "**!ding <CharacterName> <CurrentLevel>**\n-`sets the character to the given level`\n";
  helpMessage = helpMessage + "**!realm**\n-`provides some realm info`\n";
  message.channel.send(helpMessage);
}

//Since there will be no API at launch we need a way to manually add and track characters
//---------------------------------------------------------------------------------------
//---------------        Functions used until the API is available        ---------------
//---------------------------------------------------------------------------------------

//adds a new character to our local database.  The character includes name, level, and author (the user who added the character)
function addCharacterNoAPI(message, characterName){
  var localDatabase = JSON.parse(fs.readFileSync(localDatabaseNoAPIPath));
  if(!isInDatabaseNoAPI(characterName, localDatabase.Characters)){
    localDatabase["Characters"].push({name: characterName, "level": 1, "author":message.author.toString()});
    //prints a message to the console
    console.log("------------------------");
    console.log("Added: " + characterName);
    console.log("------------------------");
    message.reply(characterName + " has been added");
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

//prints a readable version of the local database with no API to Discord
function printLocalDatabase(message){
  var database = JSON.parse(fs.readFileSync(localDatabaseNoAPIPath));
  
  //lets sort the array in descending order based on level
  database.Characters.sort(function(a, b){return b.level-a.level});
  var databaseString = generateDiscordFriendlyDatabaseStringNoAPI(database.Characters);
  message.channel.send(databaseString);
};

//function to get a string that displays the current race in an easy to read form NO API
function generateDiscordFriendlyDatabaseStringNoAPI(characterArray){
  var completedString = "__**RACE TO 60 CURRENT STANDINGS:**__\n```";
  for(let i = 0; i < characterArray.length; i++){
    completedString = completedString + (i+1) + ". (" + characterArray[i].level + ") " + characterArray[i].name + "\n";
  }
  completedString = completedString + "```\n"
  return completedString;
};

//finds all characters in the database given by the author.  if there is only one it will level it up by 1
function ding(message){
  var database = JSON.parse(fs.readFileSync(localDatabaseNoAPIPath));
  var characterIndexs = [];
  for(let i = 0; i < database.Characters.length; i++){
    if(database.Characters[i].author === message.author.toString()){
      characterIndexs.push(i);
    }
  }
  if(characterIndexs.length === 0){
    message.reply("Sorry, I was not able to find any of your characters");
  }
  else if(characterIndexs.length > 1){
    message.reply("Looks like you have more than one character. Please specify the character that has leveled up");
  }
  else{
    if(database.Characters[characterIndexs[0]].level != 60){
      database.Characters[characterIndexs[0]].level++;
      //writes the file
      fs.writeFileSync(localDatabaseNoAPIPath, JSON.stringify(database, null, 2));
      message.channel.send("Gratz " + database.Characters[characterIndexs[0]].name + " on hitting " + database.Characters[characterIndexs[0]].level + "!");
      console.log(database.Characters[characterIndexs[0]].name + " just leveled to " + database.Characters[characterIndexs[0]].level);
    }
  }
}

//levels the given character by 1
function dingName(message, characterName){
  var database = JSON.parse(fs.readFileSync(localDatabaseNoAPIPath));
  //checks if character exists
  if(isInDatabaseNoAPI(characterName, database.Characters)){
    //if so find it and update its level by 1 if it is the same author
    for(let i = 0; i < database.Characters.length; i++){
      if(characterName.toLowerCase() === database.Characters[i].name.toLowerCase()){
        //checks to make sure it is the same author
        if(database.Characters[i].author === message.author.toString()){
          //one final check just to make sure no one goes past 60
          if(database.Characters[i].level != 60){
            database.Characters[i].level++;
            //writes the file
            fs.writeFileSync(localDatabaseNoAPIPath, JSON.stringify(database, null, 2));
            message.channel.send("Gratz on hitting " + database.Characters[i].level + "!");
            console.log(database.Characters[i].name + " just leveled to " + database.Characters[i].level);
          }
        }
        else{
          message.reply("Hey that is NOT your character!");
        }
        break;
      }
    }
  }
  else{
    message.reply("Cannot find: " + characterName + "\n" + "Make sure to add it to the race.");
  }
}

//sets the character level to given level
function setCharacterLevel(message, characterName, newLevel){
  var database = JSON.parse(fs.readFileSync(localDatabaseNoAPIPath));
  //checks if character exists
  if(isInDatabaseNoAPI(characterName, database.Characters)){
    //if so find it and update its level to the new level
    for(let i = 0; i < database.Characters.length; i++){
      if(characterName.toLowerCase() === database.Characters[i].name.toLowerCase()){
        //checks to make sure it is the same author
        if(database.Characters[i].author === message.author.toString()){
          //one final check just to make sure no one goes past 60
          if(newLevel <= 60 && newLevel > 0){
            database.Characters[i].level = Number(newLevel);
            //writes the file
            fs.writeFileSync(localDatabaseNoAPIPath, JSON.stringify(database, null, 2));
            message.channel.send("Gratz on hitting " + database.Characters[i].level + "!");
            console.log(database.Characters[i].name + " just leveled to " + database.Characters[i].level);
          }
          else{
            message.channel.send("Nice try funny guy");
          }
        }
        else{
          message.reply("Hey that is NOT your character!");
        }
        break;
      }
    }
  }
  else{
    message.reply("Cannot find: " + characterName + "\n" + "Make sure to add it to the race.");
  }
}





//---------------------------------------------------------------------------------------
//---------------                 Normal Discord Commands                 ---------------
//---------------------------------------------------------------------------------------

//special function for when people want some realm "info"
function highmane(message){
  //gets a list of all the files in the whitemane folder
  var files = fs.readdirSync('./whitemane');
  //picks a random number between 0 - files.length
  var randNum = Math.floor(Math.random() * (files.length));
  message.channel.send("The Queen: Thighmane", {
    files: ["./whitemane/" + files[randNum]]
  });

};



//logs the client in
client.login(discordAuth.token);