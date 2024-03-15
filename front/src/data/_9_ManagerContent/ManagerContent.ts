import {
  Firestore,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  increment,
  limit,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { QueryOrder, QueryTimeframe } from "../query";
import { stateCollections, stateStorage } from "../db";
import { IChannel } from "../channel";
import ManagerChannels from "../_7_ManagerChannels/ManagerChannels";
import { IPost, TypePost } from "../post";
import {
  FirebaseStorage,
  deleteObject,
  getStorage,
  ref,
  uploadBytes,
} from "firebase/storage";
import ManagerCompetencyUser from "../_6_ManagerCompetencyUser/ManagerCompetencyUser";
import ManagerAccount from "../_1_ManagerAccount/ManagerAccount";
import { IAccount } from "../account";
import ManagerTraceUser from "../_4_ManagerTraceUser/ManagerTraceUser";

function arraysEqual(a: any, b: any) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  // If you don't care about the order of the elements inside
  // the array, you should sort both arrays here.
  // Please note that calling sort on an array will modify that array.
  // you might want to clone your array first.

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

class ManagerContent {
  private static instance: ManagerContent;

  // database
  private managerChannels: typeof ManagerChannels | null = null;
  private channelCurrent: IChannel | null = null;
  private db: Firestore | null = null;
  private storage: FirebaseStorage | null = null;

  // state
  private account: IAccount | null = null;
  private idUserSpecific: string | null = null;
  private queryUsersPosts: boolean = false;
  private queryUsersStars: boolean = false;
  private queryUsersBooks: boolean = false;
  private listenersContent: ((posts: IPost[]) => void)[] = [];
  private content: IPost[] = [];

  // content
  private typesContentActive: string[] = [];

  // order
  private order: QueryOrder = QueryOrder.popular;

  // timeframe
  private timeframe: QueryTimeframe = QueryTimeframe.day;

  private constructor() {
    // Private constructor to prevent instantiation
  }

  public static getInstance(): ManagerContent {
    if (!ManagerContent.instance) {
      ManagerContent.instance = new ManagerContent();
    }
    return ManagerContent.instance;
  }

  public init() {
    this.db = getFirestore();
    this.storage = getStorage();
    this.managerChannels = ManagerChannels;
    this.managerChannels.addListenerChannelCurrent(
      (channel: IChannel | null) => {
        if (!channel) return;
        if (this.channelCurrent === channel) return;
        this.channelCurrent = channel;
        this.queryContent();
      }
    );

    const managerAccount = ManagerAccount;
    managerAccount.addListenerAccount(async (account: IAccount | null) => {
      this.account = account;
    });
  }

  // ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
  // actions order
  public setIdQueryUsers(idUserSpecific: string) {
    this.idUserSpecific = idUserSpecific;
  }
  public setQueryUsersPosts() {
    this.queryUsersPosts = true;
    this.queryUsersStars = false;
    this.queryUsersBooks = false;
    this.queryContentUsersPosts();
  }
  public async setQueryUsersStars() {
    this.queryUsersPosts = false;
    this.queryUsersStars = true;
    this.queryUsersBooks = false;
    this.queryContentUsersStars();
  }
  public async setQueryUsersBooks() {
    this.queryUsersPosts = false;
    this.queryUsersStars = false;
    this.queryUsersBooks = true;
    this.queryContentUsersBooks();
  }
  public setTypesContentActive(types: string[]) {
    if (this.typesContentActive === types) return;
    if (arraysEqual(types, this.typesContentActive)) return;
    this.typesContentActive = types;

    if (this.queryUsersPosts) {
      this.queryContentUsersPosts();
    } else if (this.queryUsersStars) {
      this.queryContentUsersStars();
    } else if (this.queryUsersBooks) {
      this.queryContentUsersBooks();
    } else {
      this.queryContent();
    }
  }
  public setOrder(order: QueryOrder) {
    if (this.order === order) return;
    this.order = order;
    this.queryContent();
  }
  public setTimeframe(timeframe: QueryTimeframe) {
    if (this.timeframe === timeframe) return;
    this.timeframe = timeframe;
    this.queryContent();
  }
  // actions order
  // ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----

  // ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
  // actions content
  public async deletePost(post: IPost) {
    if (!this.db) return;
    if (!this.channelCurrent) return;
    if (!this.account) return;

    const docRef = doc(this.db, stateCollections.posts, post.id);

    await deleteDoc(docRef).catch((error) => {
      console.error("Error deleting post: ", error.message);
    });

    if (post.type === TypePost.Article) {
      const storageRef = ref(
        this.storage!,
        `${stateStorage.articles}/${post.id}.pdf`
      );
      deleteObject(storageRef).catch((error) => {
        console.error("Error deleting file: ", error.message);
      });
    }

    if (post.type === TypePost.Photo) {
      const storageRef = ref(
        this.storage!,
        `${stateStorage.photos}/${post.id}.jpg`
      );
      deleteObject(storageRef).catch((error) => {
        console.error("Error deleting file: ", error.message);
      });
    }

    this.queryContent();
  }

  public async addQuote(
    caption: string,
    idCreator: string,
    nameCreator: string
  ) {
    if (!this.db) return;
    if (!this.channelCurrent) return;
    if (!this.account) return;

    const parent = await this.managerChannels?.getChannelOptimized(
      this.channelCurrent.idParent
    );
    if (!parent) return;

    const docRef = doc(collection(this.db, stateCollections.posts));

    const quote: IPost = {
      version: "1.0.1",
      type: TypePost.Quote,
      timestampCreation: Date.now(),
      id: docRef.id,
      idCreator,
      nameCreator,
      countViews: 1,
      countWarnings: 0,
      countComments: 0,
      data: {
        caption: caption,
      },
      navigation: {
        idChannelOrigin: this.channelCurrent.id,
        nameChannelOrigin: this.channelCurrent.name,
        idChannelOriginParent: parent.id,
        nameChannelOriginParent: parent.name,
        idChannelPossibleRebalance: parent.id,
        idsChannelLocationDay: [this.channelCurrent.id],
        timestampUpdatedChannelLocationDay: Date.now(),
        idsChannelLocationWeek: [this.channelCurrent.id],
        timestampUpdatedChannelLocationWeek: Date.now(),
        idsChannelLocationMonth: [this.channelCurrent.id],
        timestampUpdatedChannelLocationMonth: Date.now(),
        idsChannelLocationYear: [this.channelCurrent.id],
        timestampUpdatedChannelLocationYear: Date.now(),
        idsChannelLocationAll: [this.channelCurrent.id],
        timestampUpdatedChannelLocationAll: Date.now(),
      },
      statistics: {
        timestampWorkloadNext: Date.now() + 1000 * 60 * 60 * 24,
        timestampWorkloadLast: Date.now(),
        countPositiveDay: 0,
        countPositiveWeek: 0,
        countPositiveMonth: 0,
        countPositiveYear: 0,
        countPositiveAll: 0,
        queueCountPositive: [],
        countStarsDay: 0,
        countStarsWeek: 0,
        countStarsMonth: 0,
        countStarsYear: 0,
        countStarsAll: 0,
        queueCountStars: [],
        countBooksDay: 0,
        countBooksWeek: 0,
        countBooksMonth: 0,
        countBooksYear: 0,
        countBooksAll: 0,
        queueCountBooks: [],
      },
    };

    await setDoc(docRef, quote).catch((error) => {
      console.error("Error publishing quote: ", error.message);
    });

    this.queryContent();
  }

  public async addArticle(
    file: File,
    caption: string,
    idCreator: string,
    nameCreator: string
  ) {
    if (!this.db) return;
    if (!this.channelCurrent) return;
    if (!this.account) return;

    const parent = await this.managerChannels?.getChannelOptimized(
      this.channelCurrent.idParent
    );
    if (!parent) return;

    const docRef = doc(collection(this.db, stateCollections.posts));

    const article: IPost = {
      version: "1.0.1",
      type: TypePost.Article,
      timestampCreation: Date.now(),
      id: docRef.id,
      idCreator,
      nameCreator,
      countViews: 1,
      countWarnings: 0,
      countComments: 0,
      data: {
        caption: caption,
        url: `gs://locus-68ed2.appspot.com/${stateStorage.articles}/${docRef.id}.pdf`,
      },
      navigation: {
        idChannelOrigin: this.channelCurrent.id,
        nameChannelOrigin: this.channelCurrent.name,
        idChannelOriginParent: parent.id,
        nameChannelOriginParent: parent.name,
        idChannelPossibleRebalance: parent.id,
        idsChannelLocationDay: [this.channelCurrent.id],
        timestampUpdatedChannelLocationDay: Date.now(),
        idsChannelLocationWeek: [this.channelCurrent.id],
        timestampUpdatedChannelLocationWeek: Date.now(),
        idsChannelLocationMonth: [this.channelCurrent.id],
        timestampUpdatedChannelLocationMonth: Date.now(),
        idsChannelLocationYear: [this.channelCurrent.id],
        timestampUpdatedChannelLocationYear: Date.now(),
        idsChannelLocationAll: [this.channelCurrent.id],
        timestampUpdatedChannelLocationAll: Date.now(),
      },
      statistics: {
        timestampWorkloadNext: Date.now() + 1000 * 60 * 60 * 24,
        timestampWorkloadLast: Date.now(),
        countPositiveDay: 0,
        countPositiveWeek: 0,
        countPositiveMonth: 0,
        countPositiveYear: 0,
        countPositiveAll: 0,
        queueCountPositive: [],
        countStarsDay: 0,
        countStarsWeek: 0,
        countStarsMonth: 0,
        countStarsYear: 0,
        countStarsAll: 0,
        queueCountStars: [],
        countBooksDay: 0,
        countBooksWeek: 0,
        countBooksMonth: 0,
        countBooksYear: 0,
        countBooksAll: 0,
        queueCountBooks: [],
      },
    };

    await setDoc(docRef, article)
      .then((res) => {
        const storageRef = ref(
          this.storage!,
          `${stateStorage.articles}/${docRef.id}.pdf`
        );
        uploadBytes(storageRef, file)
          .then((res) => {
            console.log("Uploaded a blob or file!");
          })
          .catch((error) => {
            console.error("Error uploading file: ", error.message);
          });
      })
      .catch((error) => {
        console.error("Error publishing article: ", error.message);
      });

    this.queryContent();
  }

  public async addPhoto(
    file: File,
    caption: string,
    idCreator: string,
    nameCreator: string
  ) {
    if (!this.db) return;
    if (!this.channelCurrent) return;
    if (!this.account) return;

    const parent = await this.managerChannels?.getChannelOptimized(
      this.channelCurrent.idParent
    );
    if (!parent) return;

    const docRef = doc(collection(this.db, stateCollections.posts));

    const photo: IPost = {
      version: "1.0.1",
      type: TypePost.Photo,
      timestampCreation: Date.now(),
      id: docRef.id,
      idCreator,
      nameCreator,
      countViews: 1,
      countWarnings: 0,
      countComments: 0,
      data: {
        caption: caption,
        url: `gs://locus-68ed2.appspot.com/${stateStorage.photos}/${docRef.id}.jpg`,
      },
      navigation: {
        idChannelOrigin: this.channelCurrent.id,
        nameChannelOrigin: this.channelCurrent.name,
        idChannelOriginParent: parent.id,
        nameChannelOriginParent: parent.name,
        idChannelPossibleRebalance: parent.id,
        idsChannelLocationDay: [this.channelCurrent.id],
        timestampUpdatedChannelLocationDay: Date.now(),
        idsChannelLocationWeek: [this.channelCurrent.id],
        timestampUpdatedChannelLocationWeek: Date.now(),
        idsChannelLocationMonth: [this.channelCurrent.id],
        timestampUpdatedChannelLocationMonth: Date.now(),
        idsChannelLocationYear: [this.channelCurrent.id],
        timestampUpdatedChannelLocationYear: Date.now(),
        idsChannelLocationAll: [this.channelCurrent.id],
        timestampUpdatedChannelLocationAll: Date.now(),
      },
      statistics: {
        timestampWorkloadNext: Date.now() + 1000 * 60 * 60 * 24,
        timestampWorkloadLast: Date.now(),
        countPositiveDay: 0,
        countPositiveWeek: 0,
        countPositiveMonth: 0,
        countPositiveYear: 0,
        countPositiveAll: 0,
        queueCountPositive: [],
        countStarsDay: 0,
        countStarsWeek: 0,
        countStarsMonth: 0,
        countStarsYear: 0,
        countStarsAll: 0,
        queueCountStars: [],
        countBooksDay: 0,
        countBooksWeek: 0,
        countBooksMonth: 0,
        countBooksYear: 0,
        countBooksAll: 0,
        queueCountBooks: [],
      },
    };

    await setDoc(docRef, photo)
      .then((res) => {
        const storageRef = ref(
          this.storage!,
          `${stateStorage.photos}/${docRef.id}.jpg`
        );
        uploadBytes(storageRef, file)
          .then((res) => {
            console.log("Uploaded a blob or file!");
          })
          .catch((error) => {
            console.error("Error uploading file: ", error.message);
          });
      })
      .catch((error) => {
        console.error("Error publishing photo: ", error.message);
      });

    this.queryContent();
  }

  public async addVideo(
    id: string,
    caption: string,
    idCreator: string,
    nameCreator: string
  ) {
    if (!this.db) return;
    if (!this.channelCurrent) return;
    if (!this.account) return;

    const parent = await this.managerChannels?.getChannelOptimized(
      this.channelCurrent.idParent
    );
    if (!parent) return;

    const docRef = doc(collection(this.db, stateCollections.posts));

    const video: IPost = {
      version: "1.0.1",
      type: TypePost.Video,
      timestampCreation: Date.now(),
      id: docRef.id,
      idCreator,
      nameCreator,
      countViews: 1,
      countWarnings: 0,
      countComments: 0,
      data: {
        caption: caption,
        id: id,
      },
      navigation: {
        idChannelOrigin: this.channelCurrent.id,
        nameChannelOrigin: this.channelCurrent.name,
        idChannelOriginParent: parent.id,
        nameChannelOriginParent: parent.name,
        idChannelPossibleRebalance: parent.id,
        idsChannelLocationDay: [this.channelCurrent.id],
        timestampUpdatedChannelLocationDay: Date.now(),
        idsChannelLocationWeek: [this.channelCurrent.id],
        timestampUpdatedChannelLocationWeek: Date.now(),
        idsChannelLocationMonth: [this.channelCurrent.id],
        timestampUpdatedChannelLocationMonth: Date.now(),
        idsChannelLocationYear: [this.channelCurrent.id],
        timestampUpdatedChannelLocationYear: Date.now(),
        idsChannelLocationAll: [this.channelCurrent.id],
        timestampUpdatedChannelLocationAll: Date.now(),
      },
      statistics: {
        timestampWorkloadNext: Date.now() + 1000 * 60 * 60 * 24,
        timestampWorkloadLast: Date.now(),
        countPositiveDay: 0,
        countPositiveWeek: 0,
        countPositiveMonth: 0,
        countPositiveYear: 0,
        countPositiveAll: 0,
        queueCountPositive: [],
        countStarsDay: 0,
        countStarsWeek: 0,
        countStarsMonth: 0,
        countStarsYear: 0,
        countStarsAll: 0,
        queueCountStars: [],
        countBooksDay: 0,
        countBooksWeek: 0,
        countBooksMonth: 0,
        countBooksYear: 0,
        countBooksAll: 0,
        queueCountBooks: [],
      },
    };

    await setDoc(docRef, video).catch((error) => {
      console.error("Error publishing video: ", error.message);
    });

    this.queryContent();
  }

  public async addStarPost(post: IPost) {
    if (!this.db) return;
    if (!this.channelCurrent) return;
    if (!this.account) return;

    const docRef = doc(this.db, stateCollections.posts, post.id);

    const data: any = {};

    data["statistics.countStarsAll"] = increment(1);
    if (this.timeframe !== QueryTimeframe.all) {
      data["statistics.countStarsYear"] = increment(1);
      if (this.timeframe !== QueryTimeframe.year) {
        data["statistics.countStarsMonth"] = increment(1);
        if (this.timeframe !== QueryTimeframe.month) {
          data["statistics.countStarsWeek"] = increment(1);
          if (this.timeframe !== QueryTimeframe.week) {
            data["statistics.countStarsDay"] = increment(1);
          }
        }
      }
    }
    data["statistics.countPositiveAll"] = increment(1);
    if (this.timeframe !== QueryTimeframe.all) {
      data["statistics.countPositiveYear"] = increment(1);
      if (this.timeframe !== QueryTimeframe.year) {
        data["statistics.countPositiveMonth"] = increment(1);
        if (this.timeframe !== QueryTimeframe.month) {
          data["statistics.countPositiveWeek"] = increment(1);
          if (this.timeframe !== QueryTimeframe.week) {
            data["statistics.countPositiveDay"] = increment(1);
          }
        }
      }
    }

    const newPost = post;

    newPost.statistics.countStarsAll++;
    if (this.timeframe !== QueryTimeframe.all) {
      newPost.statistics.countStarsYear++;
      if (this.timeframe !== QueryTimeframe.year) {
        newPost.statistics.countStarsMonth++;
        if (this.timeframe !== QueryTimeframe.month) {
          newPost.statistics.countStarsWeek++;
          if (this.timeframe !== QueryTimeframe.week) {
            newPost.statistics.countStarsDay++;
          }
        }
      }
    }
    newPost.statistics.countPositiveAll++;
    if (this.timeframe !== QueryTimeframe.all) {
      newPost.statistics.countPositiveYear++;
      if (this.timeframe !== QueryTimeframe.year) {
        newPost.statistics.countPositiveMonth++;
        if (this.timeframe !== QueryTimeframe.month) {
          newPost.statistics.countPositiveWeek++;
          if (this.timeframe !== QueryTimeframe.week) {
            newPost.statistics.countPositiveDay++;
          }
        }
      }
    }

    this.updatePostLocally(newPost);
    this.notifyListenersContent();

    await updateDoc(docRef, data)
      .then(() => {
        const managerCompetencyUser = ManagerCompetencyUser;
        managerCompetencyUser.starAnotherUser(post);
        const managerTraceUser = ManagerTraceUser;
        managerTraceUser.addStar(post, this.timeframe);
      })
      .catch((error) => {
        console.error("Error starring post: ", error.message);
      });
  }

  public async removeStarPost(post: IPost) {
    if (!this.db) return;
    if (!this.channelCurrent) return;
    if (!this.account) return;

    const managerTraceUser = ManagerTraceUser;
    const dateStar = managerTraceUser.getDateStar(post.id);
    if (!dateStar) return;

    const docRef = doc(this.db, stateCollections.posts, post.id);
    const data: any = {};
    const newPost = post;

    const date = new Date(dateStar);
    const dateNow = new Date();
    const diff = dateNow.getTime() - date.getTime();
    const diffDays = Math.ceil(diff / (1000 * 3600 * 24));

    data["statistics.countStarsAll"] = increment(-1);
    newPost.statistics.countStarsAll--;
    if (diffDays < 365) {
      data["statistics.countStarsYear"] = increment(-1);
      newPost.statistics.countStarsYear--;
      if (diffDays < 30) {
        data["statistics.countStarsMonth"] = increment(-1);
        newPost.statistics.countStarsMonth--;
        if (diffDays < 7) {
          data["statistics.countStarsWeek"] = increment(-1);
          newPost.statistics.countStarsWeek--;
          if (diffDays < 1) {
            data["statistics.countStarsDay"] = increment(-1);
            newPost.statistics.countStarsDay--;
          }
        }
      }
    }
    data["statistics.countPositiveAll"] = increment(-1);
    newPost.statistics.countPositiveAll--;
    if (diffDays < 365) {
      data["statistics.countPositiveYear"] = increment(-1);
      newPost.statistics.countPositiveYear--;
      if (diffDays < 30) {
        data["statistics.countPositiveMonth"] = increment(-1);
        newPost.statistics.countPositiveMonth--;
        if (diffDays < 7) {
          data["statistics.countPositiveWeek"] = increment(-1);
          newPost.statistics.countPositiveWeek--;
          if (diffDays < 1) {
            data["statistics.countPositiveDay"] = increment(-1);
            newPost.statistics.countPositiveDay--;
          }
        }
      }
    }

    this.updatePostLocally(newPost);
    this.notifyListenersContent();

    await updateDoc(docRef, data)
      .then(() => {
        const managerTraceUser = ManagerTraceUser;
        managerTraceUser.removeStar(post);
      })
      .catch((error) => {
        console.error("Error unstarring post: ", error.message);
      });
  }

  public async addBookPost(post: IPost) {
    if (!this.db) return;
    if (!this.channelCurrent) return;
    if (!this.account) return;

    const docRef = doc(this.db, stateCollections.posts, post.id);

    const data: any = {};

    data["statistics.countBooksAll"] = increment(1);
    if (this.timeframe !== QueryTimeframe.all) {
      data["statistics.countBooksYear"] = increment(1);
      if (this.timeframe !== QueryTimeframe.year) {
        data["statistics.countBooksMonth"] = increment(1);
        if (this.timeframe !== QueryTimeframe.month) {
          data["statistics.countBooksWeek"] = increment(1);
          if (this.timeframe !== QueryTimeframe.week) {
            data["statistics.countBooksDay"] = increment(1);
          }
        }
      }
    }
    data["statistics.countPositiveAll"] = increment(1);
    if (this.timeframe !== QueryTimeframe.all) {
      data["statistics.countPositiveYear"] = increment(1);
      if (this.timeframe !== QueryTimeframe.year) {
        data["statistics.countPositiveMonth"] = increment(1);
        if (this.timeframe !== QueryTimeframe.month) {
          data["statistics.countPositiveWeek"] = increment(1);
          if (this.timeframe !== QueryTimeframe.week) {
            data["statistics.countPositiveDay"] = increment(1);
          }
        }
      }
    }

    const newPost = post;

    newPost.statistics.countBooksAll++;
    if (this.timeframe !== QueryTimeframe.all) {
      newPost.statistics.countBooksYear++;
      if (this.timeframe !== QueryTimeframe.year) {
        newPost.statistics.countBooksMonth++;
        if (this.timeframe !== QueryTimeframe.month) {
          newPost.statistics.countBooksWeek++;
          if (this.timeframe !== QueryTimeframe.week) {
            newPost.statistics.countBooksDay++;
          }
        }
      }
    }
    newPost.statistics.countPositiveAll++;
    if (this.timeframe !== QueryTimeframe.all) {
      newPost.statistics.countPositiveYear++;
      if (this.timeframe !== QueryTimeframe.year) {
        newPost.statistics.countPositiveMonth++;
        if (this.timeframe !== QueryTimeframe.month) {
          newPost.statistics.countPositiveWeek++;
          if (this.timeframe !== QueryTimeframe.week) {
            newPost.statistics.countPositiveDay++;
          }
        }
      }
    }

    this.updatePostLocally(newPost);
    this.notifyListenersContent();

    await updateDoc(docRef, data)
      .then(() => {
        const managerCompetencyUser = ManagerCompetencyUser;
        managerCompetencyUser.bookAnotherUser(post);
        const managerTraceUser = ManagerTraceUser;
        managerTraceUser.addBook(post, this.timeframe);
      })
      .catch((error) => {
        console.error("Error booking post: ", error.message);
      });
  }

  public async removeBookPost(post: IPost) {
    if (!this.db) return;
    if (!this.channelCurrent) return;
    if (!this.account) return;

    const managerTraceUser = ManagerTraceUser;
    const dateBook = managerTraceUser.getDateBook(post.id);
    if (!dateBook) return;

    const docRef = doc(this.db, stateCollections.posts, post.id);
    const data: any = {};
    const newPost = post;

    const date = new Date(dateBook);
    const dateNow = new Date();
    const diff = dateNow.getTime() - date.getTime();
    const diffDays = Math.ceil(diff / (1000 * 3600 * 24));

    data["statistics.countBooksAll"] = increment(-1);
    newPost.statistics.countBooksAll--;
    data["statistics.countPositiveAll"] = increment(-1);
    newPost.statistics.countPositiveAll--;
    if (diffDays < 365) data["statistics.countBooksYear"] = increment(-1);
    newPost.statistics.countBooksYear--;
    data["statistics.countPositiveYear"] = increment(-1);
    newPost.statistics.countPositiveYear--;
    if (diffDays < 30) {
      data["statistics.countBooksMonth"] = increment(-1);
      newPost.statistics.countBooksMonth--;
      data["statistics.countPositiveMonth"] = increment(-1);
      newPost.statistics.countPositiveMonth--;
      if (diffDays < 7) {
        data["statistics.countBooksWeek"] = increment(-1);
        newPost.statistics.countBooksWeek--;
        data["statistics.countPositiveWeek"] = increment(-1);
        newPost.statistics.countPositiveWeek--;
        if (diffDays < 1) {
          data["statistics.countBooksDay"] = increment(-1);
          newPost.statistics.countBooksDay--;
          data["statistics.countPositiveDay"] = increment(-1);
          newPost.statistics.countPositiveDay--;
        }
      }
    }

    this.updatePostLocally(newPost);
    this.notifyListenersContent();

    await updateDoc(docRef, data)
      .then(() => {
        const managerTraceUser = ManagerTraceUser;
        managerTraceUser.removeBook(post);
      })
      .catch((error) => {
        console.error("Error unbooking post: ", error.message);
      });
  }

  public async incrementCounterCommentLocally(idPost: string) {
    const post = this.content.find((p) => p.id === idPost);
    if (!post) return;
    post.countComments++;
    this.notifyListenersContent();
  }

  public async decrementCounterCommentLocally(idPost: string) {
    const post = this.content.find((p) => p.id === idPost);
    if (!post) return;
    post.countComments--;
    this.notifyListenersContent();
  }

  private updatePostLocally(post: IPost) {
    this.content = this.content.map((p) => {
      if (p.id === post.id) {
        p = post;
      }
      return p;
    });
  }
  // actions content
  // ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----

  // ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
  // query
  private async queryContentUsersPosts() {
    if (!this.db) return;
    if (!this.idUserSpecific) return;

    const q = query(
      collection(this.db, stateCollections.posts),
      where("idCreator", "==", this.idUserSpecific),
      where("type", "in", this.typesContentActive),
      limit(20)
    );

    const querySnapshot = await getDocs(q);

    const content: IPost[] = [];
    querySnapshot.forEach((doc) => {
      const post = doc.data() as IPost;
      post.countViews++;
      if (this.account) {
        updateDoc(doc.ref, { countViews: increment(1) });
      }
      content.push(post);
    });
    this.content = content;

    this.notifyListenersContent();
  }
  private async queryContentUsersStars() {
    if (!this.db) return;
    if (!this.idUserSpecific) return;
    const managerTraceUser = ManagerTraceUser;
    const idsPostsUsersStars = await managerTraceUser.getStarsSpecificUser(
      this.idUserSpecific
    );
    const content: IPost[] = [];
    let countPostsDownloaded = 0;
    let countAttempts = 0;
    for (let i = 0; i < idsPostsUsersStars.length; i++) {
      countAttempts++;
      const docSnapshot = await getDoc(
        doc(this.db, stateCollections.posts, idsPostsUsersStars[i])
      ).catch((error) => {
        console.log(error.message);
      });
      if (!docSnapshot) continue;
      if (!docSnapshot.exists()) continue;
      const post = docSnapshot.data() as IPost;
      post.countViews++;
      if (this.account) {
        updateDoc(docSnapshot.ref, { countViews: increment(1) });
      }
      console.log(post.type);
      console.log(this.typesContentActive);
      if (this.typesContentActive.includes(post.type)) {
        content.push(post);
        countPostsDownloaded++;
      }
      if (countPostsDownloaded === 10) break;
      if (countAttempts === 20) break;
    }
    this.content = content;
    this.notifyListenersContent();
  }
  private async queryContentUsersBooks() {
    if (!this.db) return;
    if (!this.idUserSpecific) return;
    const managerTraceUser = ManagerTraceUser;
    const idsPostsUsersBooks = await managerTraceUser.getBooksSpecificUser(
      this.idUserSpecific
    );
    const content: IPost[] = [];
    let countPostsDownloaded = 0;
    let countAttempts = 0;
    for (let i = 0; i < idsPostsUsersBooks.length; i++) {
      countAttempts++;
      const docSnapshot = await getDoc(
        doc(this.db, stateCollections.posts, idsPostsUsersBooks[i])
      ).catch((error) => {
        console.log(error.message);
      });
      if (!docSnapshot) continue;
      if (!docSnapshot.exists()) continue;
      const post = docSnapshot.data() as IPost;
      post.countViews++;
      if (this.account) {
        updateDoc(docSnapshot.ref, { countViews: increment(1) });
      }
      if (this.typesContentActive.includes(post.type)) {
        content.push(post);
        countPostsDownloaded++;
      }
      if (countPostsDownloaded === 10) break;
      if (countAttempts === 20) break;
    }
    this.content = content;
    this.notifyListenersContent();
  }
  private async queryContent() {
    if (!this.db) return;
    if (!this.channelCurrent) return;
    if (this.typesContentActive.length === 0) return;

    let orderField = null;
    switch (this.order) {
      case QueryOrder.new:
        orderField = "timestampCreation";
        break;
      case QueryOrder.popular:
        orderField = "statistics.countPositive";
        break;
      case QueryOrder.inspiring:
        orderField = "statistics.countStars";
        break;
      case QueryOrder.educational:
        orderField = "statistics.countBooks";
        break;
    }

    if (this.order !== QueryOrder.new) {
      switch (this.timeframe) {
        case QueryTimeframe.day:
          orderField += "Day";
          break;
        case QueryTimeframe.week:
          orderField += "Week";
          break;
        case QueryTimeframe.month:
          orderField += "Month";
          break;
        case QueryTimeframe.year:
          orderField += "Year";
          break;
        case QueryTimeframe.all:
          orderField += "All";
          break;
      }
    }

    // return;

    const q = query(
      collection(this.db, stateCollections.posts),
      where(
        "navigation.idsChannelLocationDay",
        "array-contains",
        this.channelCurrent.id
      ),
      where("type", "in", this.typesContentActive),
      limit(20),
      orderBy(orderField, "desc")
    );

    const querySnapshot = await getDocs(q);

    const content: IPost[] = [];
    querySnapshot.forEach((doc) => {
      const post = doc.data() as IPost;
      post.countViews++;
      if (this.account) {
        updateDoc(doc.ref, { countViews: increment(1) });
      }
      content.push(post);
    });
    this.content = content;

    this.notifyListenersContent();
  }
  // query
  // ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----

  // ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
  // state
  private notifyListenersContent() {
    this.listenersContent.forEach((listener) => {
      listener(this.content);
    });
  }
  public addListenerContent(
    listener: (posts: IPost[]) => void
  ): (posts: IPost[]) => void {
    this.listenersContent.push(listener);
    listener(this.content);
    return listener;
  }
  public removeListenerContent(listener: (posts: IPost[]) => void) {
    const index = this.listenersContent.indexOf(listener);
    if (index > -1) {
      this.listenersContent.splice(index, 1);
    }
  }
  // state
  // ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
}

export default ManagerContent.getInstance();
