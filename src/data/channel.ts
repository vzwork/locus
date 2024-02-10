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

export type { IChannel };
