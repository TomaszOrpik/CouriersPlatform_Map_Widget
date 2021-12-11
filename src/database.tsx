import { initializeApp } from 'firebase/app';
import "firebase/database";
import { getDatabase } from 'firebase/database';
import { firebaseConfig } from '../src/firebase-config';

const app = initializeApp(firebaseConfig);

const database = getDatabase(app)

export default database;