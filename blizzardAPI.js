const Promise = require("bluebird");
//used to make a request from Blizzards API
const request = require('request');
let Character = require('./character.js');

class Blizzard {
    constructor(ID, secret){
        this.credentials = {
            client: {
                id: '',
                secret: ''
            },
            auth: {
                tokenHost: ""
            }
        };
        this.credentials.client.id = ID;
        this.credentials.client.secret = secret;
        this.credentials.auth.tokenHost = "https://us.battle.net";
        this.oauth2 = require("simple-oauth2").create(this.credentials);
        this.token = null;
    };
    
    //gets the oauth token from Blizzards API.  If we already have one and it is valid we return it, otherwise we need to request a new one
    getMyToken(){
        //gets a new token
        if (this.token === null || this.token.expired()) {
            return this.oauth2.clientCredentials
            .getToken()
            .then(this.oauth2.accessToken.create)
            .then(t => {
                this.token = t;
                return t.token.access_token;
            });
            }  
        //returns active oauth token
        else{
            return Promise.resolve(this.token.token.access_token);
        }
    };

    //getter method for the token
    getToken(){
        return this.getMyToken().then(this.oauth2.accessToken);
    };

    //gets the character from Blizzards API and returns the body of the returned data
    callAPICharacter(character, callback){
        this.getToken().then(accessToken => {
            request('https://us.api.blizzard.com/wow/character/' + character.getRealm() + '/' + character.getName() + '?locale=en_US&access_token=' + accessToken, { json: true }, (err, res, body) => {
                if (err) { return console.log(err); }
                else{
                    //body contains all of the useful data about the requested character
                    callback(body);
                }
            });
        });   
    };  

    //rerturns an updated Character class filled in with what is returned from our API callback
    requestCharacter(character){
        return new Promise((resolve, reject) => {
            try{
                this.callAPICharacter(character, body => {
                    character.setLevel(body.level);
                    character.setRace(body.race);
                    character.setClass(body.class);
                    resolve(character); 
                })
            } catch(e){reject(e);}
        })
    }
};

module.exports = Blizzard;