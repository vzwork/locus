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

export type { IPost, IDataQuote, IDataArticle, IDataVideo, IDataPhoto };
export { TypePost };
