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
    
    
    
    getMyToken(){
        if (this.token === null || this.token.expired()) {
            return this.oauth2.clientCredentials
            .getToken()
            .then(this.oauth2.accessToken.create)
            .then(t => {
                this.token = t;
                return t.token.access_token;
            });
            }  
        else{
            return Promise.resolve(this.token.token.access_token);
        }
    };

    getToken(){
        return this.getMyToken().then(this.oauth2.accessToken);
    };

    callAPICharacter(character, callback){
        this.getToken().then(accessToken => {
            request('https://us.api.blizzard.com/wow/character/' + character.getRealm() + '/' + character.getName() + '?locale=en_US&access_token=' + accessToken, { json: true }, (err, res, body) => {
            if (err) { return console.log(err); }
            else{
            callback(body);}
            });}); 
        
    };  

    requestCharacter(character){

        return new Promise((resolve, reject) => {
            try{
                this.callAPICharacter(character, body => {
                    character.setLevel(body.level);
                    character.setRace(body.race);
                    character.setClass(body.class);
                    resolve(character);
                })
            } catch(e){
                reject(e);
            }
        })
    }
};

module.exports = Blizzard;