const admin = require('firebase-admin');
let serviceAccount = require("./world-of-warcraft-51327-firebase-adminsdk-18c0w-31ebb1fafd.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://world-of-warcraft-51327.firebaseio.com"
});

let db = admin.firestore();

let docRef = db.collection('/Classic').doc('alovelace');

let setAda = docRef.set(
    {
  first: 'Ada',
  last: 'Lovelace',
  born: 1815
}
).then(function () {return Promise.resolve()});

db.collection("Classic").get()
  .then((snapshot) => {
    snapshot.forEach((doc) => {
      console.log(doc.id, '=>', doc.data());
    });
  })
  .catch((err) => {
    console.log('Error getting documents', err);
  });







