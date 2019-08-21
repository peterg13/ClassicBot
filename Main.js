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
//import for my own Blizzard API
//var Blizzard = require('./blizzardAPI.js');
//Referance to our Blizzard API to request from Blizzard
//var armory = new Blizzard(blizzardAuth.ID, blizzardAuth.Secret);


//console.log(armory.requestCharacter());



//logs that the bot is logged in
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    //announces on Discord that the bot is online
    client.channels.get('415954951630618633').send('Classic Bot Online!');
    addCharacter("Profesional", "Darkspear");
});

  //what happens when a message is received
client.on('message', message => {
    /*var splitMessage = message.content.split(" ");
    if (splitMessage[0] === "add"){
      console.log("adding character: " + splitMessage[1] + " - " + splitMessage[2]);
      addCharacter(splitMessage[1], splitMessage[2]);
    }*/
  });

function addCharacter(characterName, characterRealm){
  var jsonCharactersToAdd = JSON.parse(fs.readFileSync("./charactersToAdd.json"));
  console.log(jsonCharactersToAdd);
  jsonCharactersToAdd["newCharacters"].push({"name": characterName, "realm": characterRealm});
  console.log(jsonCharactersToAdd);
  fs.writeFileSync("./charactersToAdd.json", JSON.stringify(jsonCharactersToAdd, null, 2)); 
};

//logs the client in
client.login(discordAuth.token);