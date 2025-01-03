import fs from "fs";
import admin from "firebase-admin";
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const serviceAccount = JSON.parse(fs.readFileSync("./key/serviceAccountKeyFirebase.json"));
const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = app.firestore();

// fetch a few files from collection "articles" in Firestore
const articlesRef = db.collection('articles');
const snapshot = await articlesRef.where('sys.isLocated', '==', false).limit(2).get();

if (snapshot.empty) {
  console.log('No matching documents.');
}

snapshot.forEach(async doc => {
  console.log(doc.id, '=>', doc.data());
  // update the document
  // await articlesRef.doc(doc.id).update({
  //   'sys.isLocated': true
  // });
});

// const openai = new OpenAI({
//   apiKey: process.env.apiKey,
// });

// const completion = openai.chat.completions.create({
//   model: "gpt-4-turbo",
//   store: true,
//   messages: [
//     {"role": "user", "content": "write a haiku about ai"},
//   ],
// });

// completion.then((result) => console.log(result.choices[0].message));