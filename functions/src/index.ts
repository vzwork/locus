/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// import {onRequest} from "firebase-functions/v2/https";
// import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// ^^^^^^ default

// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
import { onSchedule } from "firebase-functions/v2/scheduler";
// import { logger } from "firebase-functions";

// The Firebase Admin SDK to access Firestore.
import admin from "firebase-admin";
admin.initializeApp();

// // The es6-promise-pool to limit the concurrency of promises.
// const PromisePool = require("es6-promise-pool").default;
// // Maximum concurrent account deletions.
// const MAX_CONCURRENT = 3;

// Run once a day at 03:00 AM PDT.
exports.counterInteractionsUpdateDaily = onSchedule(
  "every day 03:00",
  async (event) => {
    //
  }
);

// export const deleteInactiveAccounts = onSchedule("0 3 * * *").timeZone("America/Los_Angeles").onRun(async (context) => {
//   // Fetch all user details.
//   const inactiveUsers = await getInactiveUsers();
//   // Use a pool so that we delete maximum `MAX_CONCURRENT` users in parallel.
//   const promisePool = new PromisePool(() => deleteInactiveUser(inactiveUsers), MAX_CONCURRENT);
//   await promisePool.start();
//   logger.log(`Successfully deleted ${inactiveUsers.length} inactive users.`);
// });

import { onRequest } from "firebase-functions/v2/https";

exports.testCounterInteractionsUpdateDaily = onRequest(async (req, res) => {
  // grab the text parameter.
  const original = req.query.text;
  res.json({ result: `Hello ${original}` });
  res.send();
});
