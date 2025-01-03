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

// we need a queue of articles to be located
// initially, we fetch all articles that are not located
// then we iterate over each article and ask the AI to locate it
// but since there are nested channels, we need to continue putting 
// the article back into the queue until there are no more children channels
// queue object structure
// - entry channel
// - article

const QUEUE = [];

const articlesRef = db.collection('articles');
const snapshot = await articlesRef.where('sys.isLocated', '==', false).get();

if (snapshot.empty) {
  console.log('No matching documents.');
} else {
  snapshot.forEach(doc => {
    QUEUE.push({
      channelEntry: 'locus',
      article: doc.data()
    });
  });

  while (QUEUE.length > 0) {
    const entry = QUEUE.shift();
    const article = entry.article;
    const channelEntry = entry.channelEntry;

    const description = article.data.description;

    await db.collection('articles').doc(article.id).update({
      'sys.locationChannels': admin.firestore.FieldValue.arrayUnion(channelEntry)
    });

    let channel = (await db.collection('channels').doc(channelEntry).get()).data();
    let channelsOptions = channel.children;

    if (channelsOptions.length === 0) {
      await db.collection('articles').doc(article.id).update({
        'sys.isLocated': true
      })
      continue;
    }

    const openai = new OpenAI({
      apiKey: process.env.apiKey,
    });

    const completion = openai.chat.completions.create({
      model: "gpt-4-turbo",
      store: true,
      messages: [
        {
          "role": "user", "content": `You are given description of an article and news channels to place article into.
          Description - (${description}).
          Channels - (${channelsOptions}).
          Return one or more provided channels that fit, seperated by coma.
          You must only use provided channels!` },
      ],
    });

    await completion.then(async (result) => {
      console.log('\n')
      console.log(description);
      console.log(result.choices[0].message)

      const channels = result.choices[0].message.content.split(',');
      const validChannels = channels.filter(channel => channelsOptions.includes(channel));
      validChannels.forEach(async channel => {
        QUEUE.push({
          channelEntry: channel,
          article: article
        });
      })
    });
  }
}
