import {
  Firestore,
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  getFirestore,
  increment,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import ManagerAccount from "../_1_ManagerAccount/ManagerAccount";
import { IAccount } from "../account";
import { stateCollections } from "../db";
import { IPost } from "../post";
import { IStats } from "../stats";
import { QueryTimeframe } from "../query";

class ManagerTraceUser {
  private static instance: ManagerTraceUser;
  private db: Firestore | null = null;
  private account: IAccount | null = null;

  // state
  private statsUser: IStats | null = null;
  private setStars: Set<string> = new Set();
  private mapDatesStars: Map<string, string> = new Map();
  private setBooks: Set<string> = new Set();
  private mapDatesBooks: Map<string, string> = new Map();
  private setComments: Set<string> = new Set();

  // listeners
  private listenersStatsUser: Array<(statsUser: IStats | null) => void> =
    [];
  private listenersStars: Array<(stars: Set<string>) => void> = [];

  private constructor() {
    // Private constructor to prevent instantiation
  }

  public static getInstance(): ManagerTraceUser {
    if (!ManagerTraceUser.instance) {
      ManagerTraceUser.instance = new ManagerTraceUser();
    }
    return ManagerTraceUser.instance;
  }

  public init() {
    this.db = getFirestore();
    const managerAccount = ManagerAccount;
    managerAccount.addListenerAccount((account: IAccount | null) => {
      if (!account) {
        this.account = null;
        this.setStars = new Set();
        this.setBooks = new Set();
        this.setComments = new Set();
      } else {
        if (JSON.stringify(this.account) !== JSON.stringify(account)) {
          this.account = account;
          this.loadTraceData();
          this.loadStatsUser();
        }
      }
    });
  }

  private async loadTraceData() {
    if (!this.db || !this.account) return;

    const docStarsRef = await getDoc(
      doc(this.db, stateCollections.traceUserStars, this.account.id)
    ).catch((error) => {
      console.log("Error getting document:", error);
    });
    if (docStarsRef && docStarsRef.exists()) {
      docStarsRef.data().stars.forEach((star: string) => {
        const starData = star.split("-");
        this.setStars.add(starData[0]);
        this.mapDatesStars.set(starData[0], starData[1]);
      });
      this.notifyListenersStars();
    } else {
      await setDoc(
        doc(this.db, stateCollections.traceUserStars, this.account.id),
        {
          stars: [],
        }
      );
    }

    const docBooksRef = await getDoc(
      doc(this.db, stateCollections.traceUserBooks, this.account.id)
    ).catch((error) => {
      console.log("Error getting document:", error);
    });
    if (docBooksRef && docBooksRef.exists()) {
      docBooksRef.data().books.forEach((book: string) => {
        const bookData = book.split("-");
        this.setBooks.add(bookData[0]);
        this.mapDatesBooks.set(bookData[0], bookData[1]);
      });
      this.notifyListenersBooks();
    } else {
      await setDoc(
        doc(this.db, stateCollections.traceUserBooks, this.account.id),
        {
          books: [],
        }
      );
    }

    const docCommentsRef = await getDoc(
      doc(this.db, stateCollections.traceUserComments, this.account.id)
    ).catch((error) => {
      console.log("Error getting document:", error);
    });
    if (docCommentsRef && docCommentsRef.exists()) {
      this.setComments = new Set(docCommentsRef.data().comments);
      this.notifyListenersComments();
    } else {
      await setDoc(
        doc(this.db, stateCollections.traceUserComments, this.account.id),
        {
          comments: [],
        }
      );
    }
  }

  private async loadStatsUser() {
    if (!this.db || !this.account) return;

    const docStatsRef = await getDoc(
      doc(this.db, stateCollections.stats, this.account.id)
    ).catch((error) => {
      console.log("Error getting document:", error);
    });
    if (docStatsRef && docStatsRef.exists()) {
      this.statsUser = docStatsRef.data() as IStats;
    } else {
      const statsTemplate: IStats = {
        countStarsByOtherUsers: 0,
        countBooksByOtherUsers: 0,
        countPosts: 0,
        countUpvotesComments: 0,
      };

      await setDoc(
        doc(this.db, stateCollections.stats, this.account.id),
        statsTemplate
      );
      this.statsUser = statsTemplate;
    }

    this.notifyListenersStatsUser();
  }

  // ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
  // user actions
  public async addStar(post: IPost, timeframe: QueryTimeframe) {
    if (!this.db || !this.account) return;
    if (this.setStars.has(post.id)) return;

    this.setStars.add(post.id);
    const dateOfStar = Date.now().toString();
    this.mapDatesStars.set(post.id, dateOfStar);
    this.notifyListenersStars();

    await updateDoc(
      doc(this.db, stateCollections.traceUserStars, this.account.id),
      {
        stars: arrayUnion(post.id + "-" + dateOfStar),
      }
    ).catch((error) => {
      console.log(error.message);
    });

    if (this.account.id !== post.idCreator) {
      await this.makeSureStatsUserExist(post.idCreator);
      await updateDoc(
        doc(this.db, stateCollections.stats, post.idCreator),
        {
          countStarsByOtherUsers: increment(1),
        }
      );
    }

    this.notifyListenersStars();
  }

  public async removeStar(post: IPost) {
    if (!this.db || !this.account) return;
    if (!this.setStars.has(post.id)) return;

    this.setStars.delete(post.id);
    const dateOfStar = this.mapDatesStars.get(post.id);
    this.mapDatesStars.delete(post.id);
    this.notifyListenersStars();

    await updateDoc(
      doc(this.db, stateCollections.traceUserStars, this.account.id),
      {
        stars: arrayRemove(post.id + "-" + dateOfStar),
      }
    );

    if (this.account.id !== post.idCreator) {
      await this.makeSureStatsUserExist(post.idCreator);
      await updateDoc(
        doc(this.db, stateCollections.stats, post.idCreator),
        {
          countStarsByOtherUsers: increment(-1),
        }
      );
    }

    this.notifyListenersStars();
  }

  public getDateStar(id: string): string | undefined {
    return this.mapDatesStars.get(id);
  }

  public async getStarsSpecificUser(
    idUserSpecific: string
  ): Promise<string[]> {
    const outIdsStars: string[] = [];
    if (!this.db) return outIdsStars;

    const docSnap = await getDoc(
      doc(this.db, stateCollections.traceUserStars, idUserSpecific)
    );
    if (!docSnap.exists()) return outIdsStars;

    docSnap.data().stars.forEach((star: string) => {
      const starData = star.split("-");
      outIdsStars.push(starData[0]);
    });

    return outIdsStars;
  }

  public async addBook(post: IPost, timeframe: QueryTimeframe) {
    if (!this.db || !this.account) return;
    if (this.setBooks.has(post.id)) return;

    this.setBooks.add(post.id);
    const dateOfBook = Date.now().toString();
    this.mapDatesBooks.set(post.id, dateOfBook);
    this.notifyListenersBooks();

    await updateDoc(
      doc(this.db, stateCollections.traceUserBooks, this.account.id),
      {
        books: arrayUnion(post.id + "-" + dateOfBook),
      }
    );

    if (this.account.id !== post.idCreator) {
      await this.makeSureStatsUserExist(post.idCreator);
      await updateDoc(
        doc(this.db, stateCollections.stats, post.idCreator),
        {
          countBooksByOtherUsers: increment(1),
        }
      );

      this.notifyListenersBooks();
    }
  }

  public async removeBook(post: IPost) {
    if (!this.db || !this.account) return;
    if (!this.setBooks.has(post.id)) return;

    this.setBooks.delete(post.id);
    const dateOfBook = this.mapDatesBooks.get(post.id);
    this.mapDatesBooks.delete(post.id);
    this.notifyListenersBooks();

    await updateDoc(
      doc(this.db, stateCollections.traceUserBooks, this.account.id),
      {
        books: arrayRemove(post.id + "-" + dateOfBook),
      }
    );

    if (this.account.id !== post.idCreator) {
      await this.makeSureStatsUserExist(post.idCreator);
      await updateDoc(
        doc(this.db, stateCollections.stats, post.idCreator),
        {
          countBooksByOtherUsers: increment(-1),
        }
      );
    }

    this.notifyListenersBooks();
  }

  public getDateBook(id: string): string | undefined {
    return this.mapDatesBooks.get(id);
  }

  public async getBooksSpecificUser(
    idUserSpecific: string
  ): Promise<string[]> {
    const outIdsBooks: string[] = [];
    if (!this.db) return outIdsBooks;

    const docSnap = await getDoc(
      doc(this.db, stateCollections.traceUserBooks, idUserSpecific)
    );
    if (!docSnap.exists()) return outIdsBooks;

    docSnap.data().books.forEach((book: string) => {
      const bookData = book.split("-");
      outIdsBooks.push(bookData[0]);
    });

    return outIdsBooks;
  }

  private async makeSureStatsUserExist(idUser: string) {
    if (!this.db) return;
    const docRef = doc(this.db, stateCollections.stats, idUser);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      const statsTemplate: IStats = {
        countStarsByOtherUsers: 0,
        countBooksByOtherUsers: 0,
        countPosts: 0,
        countUpvotesComments: 0,
      };

      await setDoc(docRef, statsTemplate);
    }
  }

  public async addComment(id: string) {
    if (!this.db || !this.account) return;
    if (this.setComments.has(id)) return;

    this.setComments.add(id);
    this.notifyListenersComments();

    await updateDoc(
      doc(this.db, stateCollections.traceUserComments, this.account.id),
      {
        comments: arrayUnion(id),
      }
    );

    this.notifyListenersComments();
  }

  public async removeComment(id: string) {
    if (!this.db || !this.account) return;
    if (!this.setComments.has(id)) return;

    this.setComments.delete(id);
    this.notifyListenersComments();

    await updateDoc(
      doc(this.db, stateCollections.traceUserComments, this.account.id),
      {
        comments: arrayRemove(id),
      }
    );

    this.notifyListenersComments();
  }
  // user actions
  // ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----

  // ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
  // state stats user
  private notifyListenersStatsUser() {
    if (!this.statsUser) return;
    this.listenersStatsUser.forEach((listener) => {
      listener(this.statsUser);
    });
  }
  public addListenerStatsUser(
    listener: (statsUser: IStats | null) => void
  ): (statsUser: IStats | null) => void {
    this.listenersStatsUser.push(listener);
    listener(this.statsUser);
    return listener;
  }
  public removeListenerStatsUser(
    listener: (statsUser: IStats | null) => void
  ) {
    this.listenersStatsUser = this.listenersStatsUser.filter(
      (l) => l !== listener
    );
  }
  // state stats user
  // ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----

  // ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
  // state stars
  private notifyListenersStars() {
    this.listenersStars.forEach((listener) => {
      listener(this.setStars);
    });
  }
  public addListenerStars(
    listener: (stars: Set<string>) => void
  ): (stars: Set<string>) => void {
    this.listenersStars.push(listener);
    listener(this.setStars);
    return listener;
  }
  public removeListenerStars(listener: (stars: Set<string>) => void) {
    this.listenersStars = this.listenersStars.filter((l) => l !== listener);
  }
  // state stars
  // ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----

  // ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
  // state books
  private notifyListenersBooks() {
    this.listenersStars.forEach((listener) => {
      listener(this.setBooks);
    });
  }
  public addListenerBooks(
    listener: (books: Set<string>) => void
  ): (books: Set<string>) => void {
    this.listenersStars.push(listener);
    listener(this.setBooks);
    return listener;
  }
  public removeListenerBooks(listener: (books: Set<string>) => void) {
    this.listenersStars = this.listenersStars.filter((l) => l !== listener);
  }
  // state books
  // ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----

  // ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
  // state comments
  private notifyListenersComments() {
    this.listenersStars.forEach((listener) => {
      listener(this.setComments);
    });
  }
  public addListenerComments(
    listener: (comments: Set<string>) => void
  ): (comments: Set<string>) => void {
    this.listenersStars.push(listener);
    listener(this.setComments);
    return listener;
  }
  public removeListenerComments(listener: (comments: Set<string>) => void) {
    this.listenersStars = this.listenersStars.filter((l) => l !== listener);
  }
  // state comments
  // ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
}

export default ManagerTraceUser.getInstance();
