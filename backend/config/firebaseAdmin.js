import admin from "firebase-admin";
import { readFileSync } from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";
require('dotenv').config();
// Resolve __dirname in ES module
const __dirname = dirname(fileURLToPath(import.meta.url));

const serviceAccount = {
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
  };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
