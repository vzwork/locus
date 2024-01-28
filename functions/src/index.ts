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

// Run once a day at 04:00 AM PDT.
exports.counterInteractionsUpdateDaily = onSchedule(
  "every day 04:00",
  async (event) => {
    //
  }
);

import { onRequest } from "firebase-functions/v2/https";
import { QueryDocumentSnapshot } from "firebase-admin/firestore";

exports.testCounterInteractionsUpdateDaily = onRequest(async (req, res) => {
  // Posts are processed daily around 4:00 AM PDT (least user activity)

  // Processing a post means updating the statistics of the post
  // The statistics keep track of the number of interactions (positive, stars, books)
  // The statistics keep track of the different timeframes (day, week, month, year, all)

  // Processing a post has optimzation logic
  // If no optimization was done, the post would be processed daily
  // But thanks to the optimization logic the posts can be processed less frequently

  // The optimization logic anticipates the next time the post will be processed

  // if dailyCount is not zero, the timestamp would reflect that
  // and therefore the post would be processed daily

  // if the weeklyCount is not zero, the timestamp would reflect that
  // and the post would still be processed daily
  // that is because untill the weeklyCount is zero, the daily count is subtracted from the weekly count

  // if the daily, weekly count are zero, but the monthly count is not zero, the timestamp would reflect that
  // and the post would be processed weekly untill the monthly count is zero

  // and so on...

  // types of workloads:
  // - daily processing (dailyCount > 0)
  // - optimized processing (timestampWorkloadNext < Date.now())

  const postsUpdated: any = [];

  const updateDaily = (post: IPost) => {
    post.statistics.queueCountPositive.push(post.statistics.countPositiveDay);
    post.statistics.countPositiveDay = 0;
    post.statistics.countBooksWeek -=
      post.statistics.queueCountPositive[8] || 0;
    post.statistics.countBooksMonth -=
      post.statistics.queueCountPositive[29] || 0;
    post.statistics.countBooksYear -=
      post.statistics.queueCountPositive[364] || 0;

    post.statistics.queueCountStars.push(post.statistics.countStarsDay);
    post.statistics.countStarsDay = 0;
    post.statistics.countStarsWeek -= post.statistics.queueCountStars[8] || 0;
    post.statistics.countStarsMonth -= post.statistics.queueCountStars[29] || 0;
    post.statistics.countStarsYear -= post.statistics.queueCountStars[364] || 0;

    post.statistics.queueCountBooks.push(post.statistics.countBooksDay);
    post.statistics.countBooksDay = 0;
    post.statistics.countBooksWeek -= post.statistics.queueCountBooks[8] || 0;
    post.statistics.countBooksMonth -= post.statistics.queueCountBooks[29] || 0;
    post.statistics.countBooksYear -= post.statistics.queueCountBooks[364] || 0;

    return post;
  };
  const getWorkloadTomorrow = (): number => {
    // 4:00 AM
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(4, 0, 0, 0);
    return date.getTime();
  };
  const updateWorkloadNext = (post: IPost) => {
    // we know that the values like:
    // - week, month, year - updated on - queue[8], queue[29], queue[364]

    // that means for each day between the target and the day where the value is not zero
    // it is the offset time where no work needs to be done

    if (post.statistics.queueCountPositive.length < 8) {
      post.statistics.timestampWorkloadNext = getWorkloadTomorrow();
      post.statistics.timestampWorkloadLast = Date.now();
      return;
    }

    // count days between weekly update and first non-zero value
    let days = 0;
    for (let i = 7; i >= 0; i--) {
      if (post.statistics.queueCountPositive[i] > 0) {
        break;
      }
      days++;
    }

    if (days === 0) {
      post.statistics.timestampWorkloadNext = getWorkloadTomorrow();
      post.statistics.timestampWorkloadLast = Date.now();
      return;
    } else if (days < 8) {
      post.statistics.timestampWorkloadNext =
        getWorkloadTomorrow() + days * 24 * 60 * 60 * 1000;
      post.statistics.timestampWorkloadLast = Date.now();
      return;
    }

    if (post.statistics.queueCountPositive.length < 29) {
      post.statistics.timestampWorkloadNext =
        getWorkloadTomorrow() + 7 * 24 * 60 * 60 * 1000;
      post.statistics.timestampWorkloadLast = Date.now();
      return;
    }

    // count days between monthly update and first non-zero value
    days = 0;
    for (let i = 28; i >= 0; i--) {
      if (post.statistics.queueCountPositive[i] > 0) {
        break;
      }
      days++;
    }

    if (days === 0) {
      post.statistics.timestampWorkloadNext =
        getWorkloadTomorrow() + 7 * 24 * 60 * 60 * 1000;
      post.statistics.timestampWorkloadLast = Date.now();
      return;
    } else if (days < 29) {
      post.statistics.timestampWorkloadNext =
        getWorkloadTomorrow() + days * 24 * 60 * 60 * 1000;
      post.statistics.timestampWorkloadLast = Date.now();
      return;
    }

    if (post.statistics.queueCountPositive.length < 364) {
      post.statistics.timestampWorkloadNext =
        getWorkloadTomorrow() + 28 * 24 * 60 * 60 * 1000;
      post.statistics.timestampWorkloadLast = Date.now();
      return;
    }

    // count days between yearly update and first non-zero value
    days = 0;
    for (let i = 363; i >= 0; i--) {
      if (post.statistics.queueCountPositive[i] > 0) {
        break;
      }
      days++;
    }

    if (days === 0) {
      post.statistics.timestampWorkloadNext =
        getWorkloadTomorrow() + 28 * 24 * 60 * 60 * 1000;
      post.statistics.timestampWorkloadLast = Date.now();
      return;
    } else if (days < 364) {
      post.statistics.timestampWorkloadNext =
        getWorkloadTomorrow() + days * 24 * 60 * 60 * 1000;
      post.statistics.timestampWorkloadLast = Date.now();
      return;
    }

    // if all values are zero, the post will be processed in two years
    post.statistics.timestampWorkloadNext =
      getWorkloadTomorrow() + 364 * 2 * 24 * 60 * 60 * 1000;
  };

  const processDocsPositive = async () => {
    // daily workload positive and others
    let docLastPositive: QueryDocumentSnapshot | undefined = undefined;
    const limit = 100;
    const limitWhileLoop = 2;
    let counterWhileLoop = 0;
    while (true) {
      const snapshot: any = docLastPositive
        ? await admin
            .firestore()
            .collection("posts")
            .orderBy("statistics.countPositiveDay", "desc")
            .where("statistics.countPositiveDay", ">", 0)
            .startAfter(docLastPositive.id)
            .limit(limit)
            .get()
        : await admin
            .firestore()
            .collection("posts")
            .orderBy("statistics.countPositiveDay", "desc")
            .where("statistics.countPositiveDay", ">", 0)
            .limit(limit)
            .get();

      if (!snapshot.docs.length) break;

      snapshot.docs.slice(0, -1).forEach((doc: any) => {
        let post = doc.data() as IPost;

        updateDaily(post);
        updateWorkloadNext(post);

        postsUpdated.push(post);
      });

      docLastPositive = snapshot.docs[snapshot.docs.length - 1];
      counterWhileLoop++;
      if (counterWhileLoop === limitWhileLoop) break;
    }

    if (docLastPositive) {
      let post = docLastPositive.data() as IPost;
      updateDaily(post);
      updateWorkloadNext(post);
      postsUpdated.push(post);
    }
  };
  const processDocsStars = async () => {
    // daily workload stars and others
    let docLastStars: QueryDocumentSnapshot | undefined = undefined;
    const limit = 100;
    const limitWhileLoop = 2;
    let counterWhileLoop = 0;
    while (true) {
      const snapshot: any = docLastStars
        ? await admin
            .firestore()
            .collection("posts")
            .orderBy("statistics.countStarsDay", "desc")
            .where("statistics.countStarsDay", ">", 0)
            .startAfter(docLastStars.id)
            .limit(limit)
            .get()
        : await admin
            .firestore()
            .collection("posts")
            .orderBy("statistics.countStarsDay", "desc")
            .where("statistics.countStarsDay", ">", 0)
            .limit(limit)
            .get();

      if (!snapshot.docs.length) break;

      snapshot.docs.slice(0, -1).forEach((doc: any) => {
        let post = doc.data() as IPost;

        updateDaily(post);
        updateWorkloadNext(post);

        postsUpdated.push(post);
      });

      docLastStars = snapshot.docs[snapshot.docs.length - 1];
      counterWhileLoop++;
      if (counterWhileLoop === limitWhileLoop) break;
    }

    if (docLastStars) {
      let post = docLastStars.data() as IPost;
      updateDaily(post);
      updateWorkloadNext(post);
      postsUpdated.push(post);
    }
  };
  const processDocsBooks = async () => {
    // daily workload books and others
    let docLastBooks: QueryDocumentSnapshot | undefined = undefined;
    const limit = 100;
    const limitWhileLoop = 2;
    let counterWhileLoop = 0;
    while (true) {
      const snapshot: any = docLastBooks
        ? await admin
            .firestore()
            .collection("posts")
            .orderBy("statistics.countBooksDay", "desc")
            .where("statistics.countBooksDay", ">", 0)
            .startAt(docLastBooks.id)
            .limit(limit)
            .get()
        : await admin
            .firestore()
            .collection("posts")
            .orderBy("statistics.countBooksDay", "desc")
            .where("statistics.countBooksDay", ">", 0)
            .limit(limit)
            .get();

      if (!snapshot.docs.length) break;

      snapshot.docs.slice(0, -1).forEach((doc: any) => {
        let post = doc.data() as IPost;

        updateDaily(post);
        updateWorkloadNext(post);

        postsUpdated.push(post);
      });

      docLastBooks = snapshot.docs[snapshot.docs.length - 1];
      counterWhileLoop++;
      if (counterWhileLoop === limitWhileLoop) break;
    }

    if (docLastBooks) {
      let post = docLastBooks.data() as IPost;
      updateDaily(post);
      updateWorkloadNext(post);
      postsUpdated.push(post);
    }
  };

  await processDocsPositive();
  await processDocsStars();
  await processDocsBooks();

  res.send(postsUpdated);
});

enum TypePost {
  Quote = "quote",
  Article = "article",
  Video = "video",
  Photo = "photo",
}

interface IPost {
  version: string;
  type: TypePost;
  timestampCreation: number;
  id: string;
  idCreator: string;
  nameCreator: string;
  countViews: number;
  countWarnings: number;
  countComments: number;
  data: IDataQuote | IDataArticle | IDataVideo | IDataPhoto;
  navigation: {
    idChannelOrigin: string;
    nameChannelOrigin: string;
    idChannelOriginParent: string;
    nameChannelOriginParent: string;
    idChannelPossibleRebalance: string;
    idsChannelLocationDay: string[];
    timestampUpdatedChannelLocationDay: number;
    idsChannelLocationWeek: string[];
    timestampUpdatedChannelLocationWeek: number;
    idsChannelLocationMonth: string[];
    timestampUpdatedChannelLocationMonth: number;
    idsChannelLocationYear: string[];
    timestampUpdatedChannelLocationYear: number;
    idsChannelLocationAll: string[];
    timestampUpdatedChannelLocationAll: number;
  };
  statistics: {
    timestampWorkloadNext: number;
    timestampWorkloadLast: number;
    countPositiveDay: number;
    countPositiveWeek: number;
    countPositiveMonth: number;
    countPositiveYear: number;
    countPositiveAll: number;
    queueCountPositive: number[];
    countStarsDay: number;
    countStarsWeek: number;
    countStarsMonth: number;
    countStarsYear: number;
    countStarsAll: number;
    queueCountStars: number[];
    countBooksDay: number;
    countBooksWeek: number;
    countBooksMonth: number;
    countBooksYear: number;
    countBooksAll: number;
    queueCountBooks: number[];
  };
}

interface IDataQuote {
  caption: string;
}

interface IDataArticle {
  caption: string;
  url: string;
}

interface IDataVideo {
  caption: string;
  id: string;
}

interface IDataPhoto {
  caption: string;
  url: string;
}

exports.testRebalanceTreeDaily = onRequest(async (req, res) => {
  const idChannelRoot = "A7mUJTeNaiTmJWk8HKjo";
  // rebalancing content within daily timeframe happens every 15 minutes

  // each rebalance updates the timestamp which validates location of content

  // the rebalance is done in a post order traversal of the tree of channels

  // actions:
  // - traverse up
  // - traverse down

  const outIdsChannel: string[] = [];
  const setIdsChannelTraversedUp: Set<string> = new Set();

  const stackChannels: IChannel[] = [];

  await admin
    .firestore()
    .collection("channels")
    .doc(idChannelRoot)
    .get()
    .then((doc) => {
      const channel = doc.data() as IChannel;
      stackChannels.push(channel);
    });

  while (stackChannels.length > 0) {
    const channel = stackChannels.pop() as IChannel;

    if (setIdsChannelTraversedUp.has(channel.id)) {
      // traverse down (query posts and update location)
      const snapshot = await admin
        .firestore()
        .collection("posts")
        .orderBy("statistics.countPositiveDay", "desc")
        .where("navigation.idsChannelLocationDay", "array-contains", channel.id)
        .limit(3)
        .get();

      snapshot.docs.forEach(async (doc) => {
        await admin
          .firestore()
          .collection("posts")
          .doc(doc.id)
          .update({
            "navigation.idsChannelLocationDay":
              admin.firestore.FieldValue.arrayUnion(channel.idParent),
            "navigation.timestampUpdatedChannelLocationDay": Date.now(),
          });
      });
    } else {
      stackChannels.push(channel);
      setIdsChannelTraversedUp.add(channel.id);

      if (channel.idsChildren.length > 0) {
        channel.idsChildren.forEach(async (idChild) => {
          await admin
            .firestore()
            .collection("channels")
            .doc(idChild)
            .get()
            .then((doc) => {
              const channelChild = doc.data() as IChannel;
              stackChannels.push(channelChild);
            });
        });
        setIdsChannelTraversedUp.add(channel.id);
      }
    }
  }

  res.send(outIdsChannel);
});

interface IChannel {
  version: string;
  depth: number;
  id: string;
  idParent: string;
  idsChildren: string[];
  name: string;
  idCreator: string;
  nameCreator: string;
  timestampCreation: number;
  statistics: {
    countPostsDay: number;
    countPostsWeek: number;
    countPostsMonth: number;
    countPostsYear: number;
    countPostsAll: number;
    queueCountPosts: number[];
    countViewsDay: number;
    countViewsWeek: number;
    countViewsMonth: number;
    countViewsYear: number;
    countViewsAll: number;
    queueCountViews: number[];
  };
}
