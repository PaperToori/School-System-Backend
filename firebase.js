import admin from 'firebase-admin';

let serviceAccount = require("../desk-17e4d-firebase-adminsdk-xgca0-0de33bf30a.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});