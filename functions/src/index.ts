import { onSchedule } from "firebase-functions/v2/scheduler";
import { onRequest } from "firebase-functions/v2/https";
import { QueryDocumentSnapshot } from "firebase-admin/firestore";
import admin from "firebase-admin";
admin.initializeApp();

// Run once a day at 04:00 AM PDT.
// updates daily count if it is not zero
exports.channelsDaily = onSchedule("every day 04:00", async (event) => {
  // channels are processed daily around
  // 4:00 AM PDT (least user activity)

  // Processing a channel means updating
  // the statistics of the channel
  // The statistics keep track of the number
  // of interactions (views, posts)
  // The statistics keep track of the different
  // timeframes (day, week, month, year, all)

  // Processing a channel has optimzation logic
  // If no optimization was done,
  // the channel would be processed daily
  // But thanks to the optimization logic
  // the channels can be processed less frequently

  // The optimization logic anticipates
  // the next time the channel will be processed

  // if dailyCount is not zero,
  // the timestamp would reflect that
  // and therefore the channel would be processed daily

  // if the weeklyCount is not zero,
  // the timestamp would reflect that
  // and the channel would still be processed daily
  // that is because untill the weeklyCount is zero,
  // the daily count is subtracted from the weekly count

  // if the daily, weekly count are zero,
  // but the monthly count is not zero,
  // the timestamp would reflect that
  // and the channel would be processed
  // weekly untill the monthly count is zero

  // and so on...

  // types of workloads:
  // - daily processing (dailyCount > 0)
  // - optimized processing (timestampWorkloadNext < Date.now())

  const updateStatistics = (channel: IChannel) => {
    channel.statistics.queueCountPosts.push(
      channel.statistics.countPostsDay
    );
    channel.statistics.countPostsDay = 0;
    channel.statistics.countPostsWeek -=
      channel.statistics.queueCountPosts[8] || 0;
    channel.statistics.countPostsMonth -=
      channel.statistics.queueCountPosts[29] || 0;
    channel.statistics.countPostsYear -=
      channel.statistics.queueCountPosts[364] || 0;

    channel.statistics.queueCountViews.push(
      channel.statistics.countViewsDay
    );
    channel.statistics.countViewsDay = 0;
    channel.statistics.countViewsWeek -=
      channel.statistics.queueCountViews[8] || 0;
    channel.statistics.countViewsMonth -=
      channel.statistics.queueCountViews[29] || 0;
    channel.statistics.countViewsYear -=
      channel.statistics.queueCountViews[364] || 0;

    return channel;
  };
  const getWorkloadTomorrow = (): number => {
    // 4:00 AM
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(4, 0, 0, 0);
    return date.getTime();
  };
  const updateWorkloadNext = (channel: IChannel) => {
    // we know that the values like:
    // - week, month, year - updated on - queue[8], queue[29], queue[364]

    // that means for each day between the target and the day where the value is not zero
    // it is the offset time where no work needs to be done

    if (channel.statistics.queueCountPosts.length < 8) {
      channel.statistics.timestampWorkloadNext = getWorkloadTomorrow();
      channel.statistics.timestampWorkloadLast = Date.now();
      return;
    }

    // count days between weekly update and first non-zero value
    let days = 0;
    for (let i = 7; i >= 0; i--) {
      if (channel.statistics.queueCountPosts[i] > 0) {
        break;
      }
      days++;
    }

    if (days === 0) {
      channel.statistics.timestampWorkloadNext = getWorkloadTomorrow();
      channel.statistics.timestampWorkloadLast = Date.now();
      return;
    } else if (days < 8) {
      channel.statistics.timestampWorkloadNext =
        getWorkloadTomorrow() + days * 24 * 60 * 60 * 1000;
      channel.statistics.timestampWorkloadLast = Date.now();
      return;
    }

    if (channel.statistics.queueCountPosts.length < 29) {
      channel.statistics.timestampWorkloadNext =
        getWorkloadTomorrow() + 7 * 24 * 60 * 60 * 1000;
      channel.statistics.timestampWorkloadLast = Date.now();
      return;
    }

    // count days between monthly update and first non-zero value
    days = 0;
    for (let i = 28; i >= 0; i--) {
      if (channel.statistics.queueCountPosts[i] > 0) {
        break;
      }
      days++;
    }

    if (days === 0) {
      channel.statistics.timestampWorkloadNext =
        getWorkloadTomorrow() + 7 * 24 * 60 * 60 * 1000;
      channel.statistics.timestampWorkloadLast = Date.now();
      return;
    } else if (days < 29) {
      channel.statistics.timestampWorkloadNext =
        getWorkloadTomorrow() + days * 24 * 60 * 60 * 1000;
      channel.statistics.timestampWorkloadLast = Date.now();
      return;
    }
  };

  const processChannelsViews = async () => {
    // daily workload views and others
    let docLastViews: QueryDocumentSnapshot | undefined = undefined;
    const limit = 100;
    const limitWhileLoop = 1000;
    let counterWhileLoop = 0;
    while (counterWhileLoop <= limit) {
      const snapshot: any = docLastViews
        ? await admin
            .firestore()
            .collection("channels")
            .orderBy("statistics.countViewsDay", "desc")
            .where("statistics.countViewsDay", ">", 0)
            .startAfter(docLastViews.id)
            .limit(limit)
            .get()
        : await admin
            .firestore()
            .collection("channels")
            .orderBy("statistics.countViewsDay", "desc")
            .where("statistics.countViewsDay", ">", 0)
            .limit(limit)
            .get();

      if (!snapshot.docs.length) break;

      await snapshot.docs.slice(0, -1).forEach(async (doc: any) => {
        let channel = doc.data() as IChannel;

        updateStatistics(channel);
        updateWorkloadNext(channel);

        // channelsUpdated.push(channel);
        await admin
          .firestore()
          .collection("channels")
          .doc(doc.id)
          .set(channel);
      });

      docLastViews = snapshot.docs[snapshot.docs.length - 1];
      counterWhileLoop++;
      if (counterWhileLoop === limitWhileLoop) break;
      if (snapshot.docs.length == 1) break;
    }

    if (docLastViews) {
      let channel = docLastViews.data() as IChannel;
      updateStatistics(channel);
      updateWorkloadNext(channel);
      // channelsUpdated.push(channel);
      await admin
        .firestore()
        .collection("channels")
        .doc(docLastViews.id)
        .set(channel);
    }
  };
  const processChannelsPosts = async () => {
    // daily workload posts and others
    let docLastPosts: QueryDocumentSnapshot | undefined = undefined;
    const limit = 100;
    const limitWhileLoop = 1000;
    let counterWhileLoop = 0;
    while (counterWhileLoop <= limit) {
      const snapshot: any = docLastPosts
        ? await admin
            .firestore()
            .collection("channels")
            .orderBy("statistics.countPostsDay", "desc")
            .where("statistics.countPostsDay", ">", 0)
            .startAfter(docLastPosts.id)
            .limit(limit)
            .get()
        : await admin
            .firestore()
            .collection("channels")
            .orderBy("statistics.countPostsDay", "desc")
            .where("statistics.countPostsDay", ">", 0)
            .limit(limit)
            .get();

      if (!snapshot.docs.length) break;

      await snapshot.docs.slice(0, -1).forEach(async (doc: any) => {
        let channel = doc.data() as IChannel;

        updateStatistics(channel);
        updateWorkloadNext(channel);

        // channelsUpdated.push(channel);
        await admin
          .firestore()
          .collection("channels")
          .doc(doc.id)
          .set(channel);
      });

      docLastPosts = snapshot.docs[snapshot.docs.length - 1];
      counterWhileLoop++;
      if (counterWhileLoop === limitWhileLoop) break;
      if (snapshot.docs.length == 1) break;
    }

    if (docLastPosts) {
      let channel = docLastPosts.data() as IChannel;
      updateStatistics(channel);
      updateWorkloadNext(channel);
      // channelsUpdated.push(channel);
      await admin
        .firestore()
        .collection("channels")
        .doc(docLastPosts.id)
        .set(channel);
    }
  };

  await processChannelsViews();
  await processChannelsPosts();
});

// Run once a day at 04:00 AM PDT.
// updates daily count if it is not zero
exports.channelsScheduled = onSchedule("every day 04:00", async (event) => {
  // channels are processed daily around
  // 4:00 AM PDT (least user activity)

  // Processing a channel means updating
  // the statistics of the channel
  // The statistics keep track of the number
  // of interactions (views, posts)
  // The statistics keep track of the different
  // timeframes (day, week, month, year, all)

  // Processing a channel has optimzation logic
  // If no optimization was done,
  // the channel would be processed daily
  // But thanks to the optimization logic
  // the channels can be processed less frequently

  // The optimization logic anticipates
  // the next time the channel will be processed

  // if dailyCount is not zero,
  // the timestamp would reflect that
  // and therefore the channel would be processed daily

  // if the weeklyCount is not zero,
  // the timestamp would reflect that
  // and the channel would still be processed daily
  // that is because untill the weeklyCount is zero,
  // the daily count is subtracted from the weekly count

  // if the daily, weekly count are zero,
  // but the monthly count is not zero,
  // the timestamp would reflect that
  // and the channel would be processed
  // weekly untill the monthly count is zero

  // and so on...

  // types of workloads:
  // - daily processing (dailyCount > 0)
  // - optimized processing (timestampWorkloadNext < Date.now())

  const updateStatistics = (channel: IChannel) => {
    channel.statistics.queueCountPosts.push(
      channel.statistics.countPostsDay
    );
    channel.statistics.countPostsDay = 0;
    channel.statistics.countPostsWeek -=
      channel.statistics.queueCountPosts[8] || 0;
    channel.statistics.countPostsMonth -=
      channel.statistics.queueCountPosts[29] || 0;
    channel.statistics.countPostsYear -=
      channel.statistics.queueCountPosts[364] || 0;

    channel.statistics.queueCountViews.push(
      channel.statistics.countViewsDay
    );
    channel.statistics.countViewsDay = 0;
    channel.statistics.countViewsWeek -=
      channel.statistics.queueCountViews[8] || 0;
    channel.statistics.countViewsMonth -=
      channel.statistics.queueCountViews[29] || 0;
    channel.statistics.countViewsYear -=
      channel.statistics.queueCountViews[364] || 0;

    return channel;
  };
  const getWorkloadTomorrow = (): number => {
    // 4:00 AM
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(4, 0, 0, 0);
    return date.getTime();
  };
  const updateWorkloadNext = (channel: IChannel) => {
    // we know that the values like:
    // - week, month, year - updated on - queue[8], queue[29], queue[364]

    // that means for each day between the target and the day where the value is not zero
    // it is the offset time where no work needs to be done

    if (channel.statistics.queueCountPosts.length < 8) {
      channel.statistics.timestampWorkloadNext = getWorkloadTomorrow();
      channel.statistics.timestampWorkloadLast = Date.now();
      return;
    }

    // count days between weekly update and first non-zero value
    let days = 0;
    for (let i = 7; i >= 0; i--) {
      if (channel.statistics.queueCountPosts[i] > 0) {
        break;
      }
      days++;
    }

    if (days === 0) {
      channel.statistics.timestampWorkloadNext = getWorkloadTomorrow();
      channel.statistics.timestampWorkloadLast = Date.now();
      return;
    } else if (days < 8) {
      channel.statistics.timestampWorkloadNext =
        getWorkloadTomorrow() + days * 24 * 60 * 60 * 1000;
      channel.statistics.timestampWorkloadLast = Date.now();
      return;
    }

    if (channel.statistics.queueCountPosts.length < 29) {
      channel.statistics.timestampWorkloadNext =
        getWorkloadTomorrow() + 7 * 24 * 60 * 60 * 1000;
      channel.statistics.timestampWorkloadLast = Date.now();
      return;
    }

    // count days between monthly update and first non-zero value
    days = 0;
    for (let i = 28; i >= 0; i--) {
      if (channel.statistics.queueCountPosts[i] > 0) {
        break;
      }
      days++;
    }

    if (days === 0) {
      channel.statistics.timestampWorkloadNext =
        getWorkloadTomorrow() + 7 * 24 * 60 * 60 * 1000;
      channel.statistics.timestampWorkloadLast = Date.now();
      return;
    } else if (days < 29) {
      channel.statistics.timestampWorkloadNext =
        getWorkloadTomorrow() + days * 24 * 60 * 60 * 1000;
      channel.statistics.timestampWorkloadLast = Date.now();
      return;
    }
  };

  const processChannels = async () => {
    // daily workload views and others
    let docLastViews: QueryDocumentSnapshot | undefined = undefined;
    const limit = 100;
    const limitWhileLoop = 1000;
    let counterWhileLoop = 0;
    while (counterWhileLoop <= limit) {
      const snapshot: any = docLastViews
        ? await admin
            .firestore()
            .collection("channels")
            .orderBy("statistics.timestampWorkloadNext", "desc")
            .where("statistics.countViewsDay", "<=", Date.now())
            .startAfter(docLastViews.id)
            .limit(limit)
            .get()
        : await admin
            .firestore()
            .collection("channels")
            .orderBy("statistics.timestampWorkloadNext", "desc")
            .where("statistics.countViewsDay", "<=", Date.now())
            .limit(limit)
            .get();

      if (!snapshot.docs.length) break;

      await snapshot.docs.slice(0, -1).forEach(async (doc: any) => {
        let channel = doc.data() as IChannel;

        updateStatistics(channel);
        updateWorkloadNext(channel);

        // channelsUpdated.push(channel);
        await admin
          .firestore()
          .collection("channels")
          .doc(doc.id)
          .set(channel);
      });

      docLastViews = snapshot.docs[snapshot.docs.length - 1];
      counterWhileLoop++;
      if (counterWhileLoop === limitWhileLoop) break;
      if (snapshot.docs.length == 1) break;
    }

    if (docLastViews) {
      let channel = docLastViews.data() as IChannel;
      updateStatistics(channel);
      updateWorkloadNext(channel);
      // channelsUpdated.push(channel);
      await admin
        .firestore()
        .collection("channels")
        .doc(docLastViews.id)
        .set(channel);
    }
  };

  await processChannels();
});

// Run once a day at 04:00 AM PDT.
// updates daily count if it is not zero
exports.interactionsDaily = onSchedule("every day 04:00", async (event) => {
  // Posts are processed daily around
  // 4:00 AM PDT (least user activity)

  // Processing a post means updating
  // the statistics of the post
  // The statistics keep track of the number
  // of interactions (positive, stars, books)
  // The statistics keep track of the different
  // timeframes (day, week, month, year, all)

  // Processing a post has optimzation logic
  // If no optimization was done,
  // the post would be processed daily
  // But thanks to the optimization logic
  // the posts can be processed less frequently

  // The optimization logic anticipates
  // the next time the post will be processed

  // if dailyCount is not zero,
  // the timestamp would reflect that
  // and therefore the post would be processed daily

  // if the weeklyCount is not zero,
  // the timestamp would reflect that
  // and the post would still be processed daily
  // that is because untill the weeklyCount is zero,
  // the daily count is subtracted from the weekly count

  // if the daily, weekly count are zero,
  // but the monthly count is not zero,
  // the timestamp would reflect that
  // and the post would be processed
  // weekly untill the monthly count is zero

  // and so on...

  // types of workloads:
  // - daily processing (dailyCount > 0)
  // - optimized processing (timestampWorkloadNext < Date.now())

  // const postsUpdated: any = [];

  const updateStatistics = (post: IPost) => {
    post.statistics.queueCountPositive.push(
      post.statistics.countPositiveDay
    );
    post.statistics.countPositiveDay = 0;
    post.statistics.countBooksWeek -=
      post.statistics.queueCountPositive[8] || 0;
    post.statistics.countBooksMonth -=
      post.statistics.queueCountPositive[29] || 0;
    post.statistics.countBooksYear -=
      post.statistics.queueCountPositive[364] || 0;

    post.statistics.queueCountStars.push(post.statistics.countStarsDay);
    post.statistics.countStarsDay = 0;
    post.statistics.countStarsWeek -=
      post.statistics.queueCountStars[8] || 0;
    post.statistics.countStarsMonth -=
      post.statistics.queueCountStars[29] || 0;
    post.statistics.countStarsYear -=
      post.statistics.queueCountStars[364] || 0;

    post.statistics.queueCountBooks.push(post.statistics.countBooksDay);
    post.statistics.countBooksDay = 0;
    post.statistics.countBooksWeek -=
      post.statistics.queueCountBooks[8] || 0;
    post.statistics.countBooksMonth -=
      post.statistics.queueCountBooks[29] || 0;
    post.statistics.countBooksYear -=
      post.statistics.queueCountBooks[364] || 0;

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
    const limitWhileLoop = 1000;
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

      await snapshot.docs.slice(0, -1).forEach(async (doc: any) => {
        let post = doc.data() as IPost;

        updateStatistics(post);
        updateWorkloadNext(post);

        // postsUpdated.push(post);
        await admin.firestore().collection("posts").doc(doc.id).set(post);
      });

      docLastPositive = snapshot.docs[snapshot.docs.length - 1];
      counterWhileLoop++;
      if (counterWhileLoop === limitWhileLoop) break;
      if (snapshot.docs.length == 1) break;
    }

    if (docLastPositive) {
      let post = docLastPositive.data() as IPost;
      updateStatistics(post);
      updateWorkloadNext(post);
      // postsUpdated.push(post);
      await admin
        .firestore()
        .collection("posts")
        .doc(docLastPositive.id)
        .set(post);
    }
  };
  const processDocsStars = async () => {
    // daily workload stars and others
    let docLastStars: QueryDocumentSnapshot | undefined = undefined;
    const limit = 100;
    const limitWhileLoop = 1000;
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

      await snapshot.docs.slice(0, -1).forEach(async (doc: any) => {
        let post = doc.data() as IPost;

        updateStatistics(post);
        updateWorkloadNext(post);

        // postsUpdated.push(post);
        await admin.firestore().collection("posts").doc(doc.id).set(post);
      });

      docLastStars = snapshot.docs[snapshot.docs.length - 1];
      counterWhileLoop++;
      if (counterWhileLoop === limitWhileLoop) break;
      if (snapshot.docs.length == 1) break;
    }

    if (docLastStars) {
      let post = docLastStars.data() as IPost;
      updateStatistics(post);
      updateWorkloadNext(post);
      // postsUpdated.push(post);
      await admin
        .firestore()
        .collection("posts")
        .doc(docLastStars.id)
        .set(post);
    }
  };
  const processDocsBooks = async () => {
    // daily workload books and others
    let docLastBooks: QueryDocumentSnapshot | undefined = undefined;
    const limit = 100;
    const limitWhileLoop = 1000;
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

      await snapshot.docs.slice(0, -1).forEach(async (doc: any) => {
        let post = doc.data() as IPost;

        updateStatistics(post);
        updateWorkloadNext(post);

        // postsUpdated.push(post);
        await admin.firestore().collection("posts").doc(doc.id).set(post);
      });

      docLastBooks = snapshot.docs[snapshot.docs.length - 1];
      counterWhileLoop++;
      if (counterWhileLoop === limitWhileLoop) break;
      if (snapshot.docs.length == 1) break;
    }

    if (docLastBooks) {
      let post = docLastBooks.data() as IPost;
      updateStatistics(post);
      updateWorkloadNext(post);
      // postsUpdated.push(post);
      await admin
        .firestore()
        .collection("posts")
        .doc(docLastBooks.id)
        .set(post);
    }
  };

  await processDocsPositive();
  await processDocsStars();
  await processDocsBooks();
});

// Run once a day at 04:00 AM PDT.
// updates if workload is due
exports.interactionsScheduled = onSchedule(
  "every day 04:00",
  async (event) => {
    // Posts are processed daily around
    // 4:00 AM PDT (least user activity)

    // Processing a post means updating
    // the statistics of the post
    // The statistics keep track of the number
    // of interactions (positive, stars, books)
    // The statistics keep track of the different
    // timeframes (day, week, month, year, all)

    // Processing a post has optimzation logic
    // If no optimization was done,
    // the post would be processed daily
    // But thanks to the optimization logic
    // the posts can be processed less frequently

    // The optimization logic anticipates
    // the next time the post will be processed

    // if dailyCount is not zero,
    // the timestamp would reflect that
    // and therefore the post would be processed daily

    // if the weeklyCount is not zero,
    // the timestamp would reflect that
    // and the post would still be processed daily
    // that is because untill the weeklyCount is zero,
    // the daily count is subtracted from the weekly count

    // if the daily, weekly count are zero,
    // but the monthly count is not zero,
    // the timestamp would reflect that
    // and the post would be processed
    // weekly untill the monthly count is zero

    // and so on...

    // types of workloads:
    // - daily processing (dailyCount > 0)
    // - optimized processing (timestampWorkloadNext < Date.now())

    // const postsUpdated: any = [];

    const updateStatisticsWithDayShift = (post: IPost) => {
      // calculate how many days have passed
      // since the last update

      const calculateDaysPassed = (
        timestamp1: number,
        timestamp2: number
      ): number => {
        const millisecondsPerDay = 24 * 60 * 60 * 1000; // Number of milliseconds in a day
        const date1 = new Date(timestamp1);
        const date2 = new Date(timestamp2);
        const timeDifference = Math.abs(date2.getTime() - date1.getTime());
        const daysPassed = Math.floor(timeDifference / millisecondsPerDay);
        return daysPassed;
      };

      const daysPassed = calculateDaysPassed(
        post.statistics.timestampWorkloadLast,
        Date.now()
      );

      for (let i = 0; i < daysPassed; i++) {
        post.statistics.queueCountPositive.push(0);
        post.statistics.queueCountStars.push(0);
        post.statistics.queueCountBooks.push(0);
      }

      post.statistics.queueCountPositive.push(
        post.statistics.countPositiveDay
      );
      post.statistics.countPositiveDay = 0;
      post.statistics.countBooksWeek -=
        post.statistics.queueCountPositive[8] || 0;
      post.statistics.countBooksMonth -=
        post.statistics.queueCountPositive[29] || 0;
      post.statistics.countBooksYear -=
        post.statistics.queueCountPositive[364] || 0;

      post.statistics.queueCountStars.push(post.statistics.countStarsDay);
      post.statistics.countStarsDay = 0;
      post.statistics.countStarsWeek -=
        post.statistics.queueCountStars[8] || 0;
      post.statistics.countStarsMonth -=
        post.statistics.queueCountStars[29] || 0;
      post.statistics.countStarsYear -=
        post.statistics.queueCountStars[364] || 0;

      post.statistics.queueCountBooks.push(post.statistics.countBooksDay);
      post.statistics.countBooksDay = 0;
      post.statistics.countBooksWeek -=
        post.statistics.queueCountBooks[8] || 0;
      post.statistics.countBooksMonth -=
        post.statistics.queueCountBooks[29] || 0;
      post.statistics.countBooksYear -=
        post.statistics.queueCountBooks[364] || 0;

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

    const processDocs = async () => {
      // daily workload positive and others
      let docLastPositive: QueryDocumentSnapshot | undefined = undefined;
      const limit = 100;
      const limitWhileLoop = 1000;
      let counterWhileLoop = 0;
      while (true) {
        const snapshot: any = docLastPositive
          ? await admin
              .firestore()
              .collection("posts")
              .orderBy("statistics.timstampWorkloadNext", "desc")
              .where("statistics.timestampWorkloadNext", "<=", Date.now())
              .startAfter(docLastPositive.id)
              .limit(limit)
              .get()
          : await admin
              .firestore()
              .collection("posts")
              .orderBy("statistics.timstampWorkloadNext", "desc")
              .where("statistics.timestampWorkloadNext", "<=", Date.now())
              .limit(limit)
              .get();

        if (!snapshot.docs.length) break;

        await snapshot.docs.slice(0, -1).forEach(async (doc: any) => {
          let post = doc.data() as IPost;

          updateStatisticsWithDayShift(post);
          updateWorkloadNext(post);

          // postsUpdated.push(post);
          await admin.firestore().collection("posts").doc(doc.id).set(post);
        });

        docLastPositive = snapshot.docs[snapshot.docs.length - 1];
        counterWhileLoop++;
        if (counterWhileLoop === limitWhileLoop) break;
        if (snapshot.docs.length == 1) break;
      }

      if (docLastPositive) {
        let post = docLastPositive.data() as IPost;
        updateStatisticsWithDayShift(post);
        updateWorkloadNext(post);
        // postsUpdated.push(post);
        await admin
          .firestore()
          .collection("posts")
          .doc(docLastPositive.id)
          .set(post);
      }
    };

    await processDocs();
  }
);

exports.testCounterInteractionsupdateStatistics = onRequest(
  async (req, res) => {
    const updateStatistics = (post: IPost) => {
      post.statistics.queueCountPositive.push(
        post.statistics.countPositiveDay
      );
      post.statistics.countPositiveDay = 0;
      post.statistics.countBooksWeek -=
        post.statistics.queueCountPositive[8] || 0;
      post.statistics.countBooksMonth -=
        post.statistics.queueCountPositive[29] || 0;
      post.statistics.countBooksYear -=
        post.statistics.queueCountPositive[364] || 0;

      post.statistics.queueCountStars.push(post.statistics.countStarsDay);
      post.statistics.countStarsDay = 0;
      post.statistics.countStarsWeek -=
        post.statistics.queueCountStars[8] || 0;
      post.statistics.countStarsMonth -=
        post.statistics.queueCountStars[29] || 0;
      post.statistics.countStarsYear -=
        post.statistics.queueCountStars[364] || 0;

      post.statistics.queueCountBooks.push(post.statistics.countBooksDay);
      post.statistics.countBooksDay = 0;
      post.statistics.countBooksWeek -=
        post.statistics.queueCountBooks[8] || 0;
      post.statistics.countBooksMonth -=
        post.statistics.queueCountBooks[29] || 0;
      post.statistics.countBooksYear -=
        post.statistics.queueCountBooks[364] || 0;

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

        await snapshot.docs.slice(0, -1).forEach(async (doc: any) => {
          let post = doc.data() as IPost;

          updateStatistics(post);
          updateWorkloadNext(post);

          // postsUpdated.push(post);
          await admin.firestore().collection("posts").doc(doc.id).set(post);
        });

        docLastPositive = snapshot.docs[snapshot.docs.length - 1];
        counterWhileLoop++;
        if (counterWhileLoop === limitWhileLoop) break;
        if (snapshot.docs.length == 1) break;
      }

      if (docLastPositive) {
        let post = docLastPositive.data() as IPost;
        updateStatistics(post);
        updateWorkloadNext(post);
        // postsUpdated.push(post);
        await admin
          .firestore()
          .collection("posts")
          .doc(docLastPositive.id)
          .set(post);
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

        await snapshot.docs.slice(0, -1).forEach(async (doc: any) => {
          let post = doc.data() as IPost;

          updateStatistics(post);
          updateWorkloadNext(post);

          // postsUpdated.push(post);
          await admin.firestore().collection("posts").doc(doc.id).set(post);
        });

        docLastStars = snapshot.docs[snapshot.docs.length - 1];
        counterWhileLoop++;
        if (counterWhileLoop === limitWhileLoop) break;
        if (snapshot.docs.length == 1) break;
      }

      if (docLastStars) {
        let post = docLastStars.data() as IPost;
        updateStatistics(post);
        updateWorkloadNext(post);
        // postsUpdated.push(post);
        await admin
          .firestore()
          .collection("posts")
          .doc(docLastStars.id)
          .set(post);
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

        await snapshot.docs.slice(0, -1).forEach(async (doc: any) => {
          let post = doc.data() as IPost;

          updateStatistics(post);
          updateWorkloadNext(post);

          // postsUpdated.push(post);
          await admin.firestore().collection("posts").doc(doc.id).set(post);
        });

        docLastBooks = snapshot.docs[snapshot.docs.length - 1];
        counterWhileLoop++;
        if (counterWhileLoop === limitWhileLoop) break;
        if (snapshot.docs.length == 1) break;
      }

      if (docLastBooks) {
        let post = docLastBooks.data() as IPost;
        updateStatistics(post);
        updateWorkloadNext(post);
        // postsUpdated.push(post);
        await admin
          .firestore()
          .collection("posts")
          .doc(docLastBooks.id)
          .set(post);
      }
    };

    await processDocsPositive();
    await processDocsStars();
    await processDocsBooks();

    // res.send(postsUpdated);
  }
);

// rebalance tree content for "day" timeframe
exports.rebalanceTreeTimeframeDay = onSchedule(
  "every 15 minutes",
  async (event) => {
    const idChannelRoot = "A7mUJTeNaiTmJWk8HKjo";
    // rebalancing content within daily
    // timeframe happens every 15 minutes

    // each rebalance updates the
    // timestamp which validates location of content

    // the rebalance is done in a post
    // order traversal of the tree of channels

    // actions:
    // - traverse up
    // - traverse down

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
          .where(
            "navigation.idsChannelLocationDay",
            "array-contains",
            channel.id
          )
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
  }
);

// rebalance tree content for "week" timeframe
exports.rebalanceTreeTimeframeWeek = onSchedule(
  "every 4 hours",
  async (event) => {
    const idChannelRoot = "A7mUJTeNaiTmJWk8HKjo";
    // rebalancing content within weekly
    // timeframe happens every 4 hours

    // each rebalance updates the
    // timestamp which validates location of content

    // the rebalance is done in a post
    // order traversal of the tree of channels

    // actions:
    // - traverse up
    // - traverse down

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
          .orderBy("statistics.countPositiveWeek", "desc")
          .where(
            "navigation.idsChannelLocationWeek",
            "array-contains",
            channel.id
          )
          .limit(3)
          .get();

        snapshot.docs.forEach(async (doc) => {
          await admin
            .firestore()
            .collection("posts")
            .doc(doc.id)
            .update({
              "navigation.idsChannelLocationWeek":
                admin.firestore.FieldValue.arrayUnion(channel.idParent),
              "navigation.timestampUpdatedChannelLocationWeek": Date.now(),
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
  }
);

// rebalance tree content for "month" timeframe
exports.rebalanceTreeTimeframeMonth = onSchedule(
  "every day 04:05",
  async (event) => {
    const idChannelRoot = "A7mUJTeNaiTmJWk8HKjo";
    // rebalancing content within monthly
    // timeframe happens every day at 4:05 AM PDT

    // each rebalance updates the
    // timestamp which validates location of content

    // the rebalance is done in a post
    // order traversal of the tree of channels

    // actions:
    // - traverse up
    // - traverse down

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
          .orderBy("statistics.countPositiveMonth", "desc")
          .where(
            "navigation.idsChannelLocationMonth",
            "array-contains",
            channel.id
          )
          .limit(3)
          .get();

        snapshot.docs.forEach(async (doc) => {
          await admin
            .firestore()
            .collection("posts")
            .doc(doc.id)
            .update({
              "navigation.idsChannelLocationMonth":
                admin.firestore.FieldValue.arrayUnion(channel.idParent),
              "navigation.timestampUpdatedChannelLocationMonth": Date.now(),
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
  }
);

// rebalance tree content for "year" timeframe
exports.rebalanceTreeTimeframeYear = onSchedule(
  "5 4 * * 1",
  async (event) => {
    const idChannelRoot = "A7mUJTeNaiTmJWk8HKjo";
    // rebalancing content within yearly
    // timeframe happens every Monday at 4:05 AM PDT

    // each rebalance updates the
    // timestamp which validates location of content

    // the rebalance is done in a post
    // order traversal of the tree of channels

    // actions:
    // - traverse up
    // - traverse down

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
          .orderBy("statistics.countPositiveYear", "desc")
          .where(
            "navigation.idsChannelLocationYear",
            "array-contains",
            channel.id
          )
          .limit(3)
          .get();

        snapshot.docs.forEach(async (doc) => {
          await admin
            .firestore()
            .collection("posts")
            .doc(doc.id)
            .update({
              "navigation.idsChannelLocationYear":
                admin.firestore.FieldValue.arrayUnion(channel.idParent),
              "navigation.timestampUpdatedChannelLocationYear": Date.now(),
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
  }
);

// rebalance tree content for "all" timeframe
exports.rebalanceTreeTimeframeAll = onSchedule(
  "5 4 1 1 *",
  async (event) => {
    const idChannelRoot = "A7mUJTeNaiTmJWk8HKjo";
    // rebalancing content within all
    // timeframe happens every January 1st at 4:05 AM PDT

    // each rebalance updates the
    // timestamp which validates location of content

    // the rebalance is done in a post
    // order traversal of the tree of channels

    // actions:
    // - traverse up
    // - traverse down

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
          .orderBy("statistics.countPositiveAll", "desc")
          .where(
            "navigation.idsChannelLocationAll",
            "array-contains",
            channel.id
          )
          .limit(3)
          .get();

        snapshot.docs.forEach(async (doc) => {
          await admin
            .firestore()
            .collection("posts")
            .doc(doc.id)
            .update({
              "navigation.idsChannelLocationAll":
                admin.firestore.FieldValue.arrayUnion(channel.idParent),
              "navigation.timestampUpdatedChannelLocationAll": Date.now(),
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
  }
);

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
    timestampWorkloadNext: number;
    timestampWorkloadLast: number;
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
