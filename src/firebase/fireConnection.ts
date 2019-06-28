import * as firebase from 'firebase';
import * as dotenv from "dotenv";

dotenv.config();

let config = {
  apiKey: process.env.APIKEY,
  authDomain: process.env.AUTHDOMAIN,
  databaseURL: process.env.DATABASEURL,
  projectId: process.env.PROJECTID,
  storageBucket: process.env.STORAGEBUCKET,
  messagingSenderId:,
  appId:
};

firebase.initializeApp(config);

export default firebase