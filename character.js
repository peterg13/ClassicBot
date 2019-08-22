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

    setName(newName){
        this._name = newName;
    }

    setRealm(newRealm){
        this._realm = newRealm;
    }
    setLevel(newLevel){
        this._level = newLevel;
    }
    setRace(newRace){
        this._race = newRace;
    }
    setClass(newClass){
        this._class = newClass;
    }
    clone(){
        return new Character(this._name, this._realm, this._level, this._race, this._class);
    }
};

module.exports = Character;