class Character{
    constructor(characterName, characterRealm, characterLevel, characterRace, characterClass){
        this._name = characterName;
        this._realm = characterRealm;
        this._level = characterLevel;
        this._race = characterRace;
        this._class = characterClass;
    }

    getName(){
        return this._name;
    }

    getRealm(){
        return this._realm;
    }

    getLevel(){
        return this._level;
    }

    getRace(){
        return this._race;
    }

    getClass(){
        return this._class;
    }
};

module.exports = Character;