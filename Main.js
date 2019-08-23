//documentation: https://discord.js.org/#/docs/main/stable/general/welcome

//the file that contains the bot's Discord token (this file is in gitignore)
var discordAuth = require("./discordAuth.json");
//the file that contains the bots Blizzard ID and Secret
//var blizzardAuth = require("./blizzardAuth.json");

const fs = require('fs');

//necessary import needed for DiscordAPI
const Discord = require('discord.js');
//Discord user client used to run commands
const client = new Discord.Client();

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
        if(splitMessage.length === 3){
          addCharacter(splitMessage[1], splitMessage[2]);
        }
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
}

//logs the client in
client.login(discordAuth.token);