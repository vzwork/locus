
export interface Article {
  id: string;
  sys: {
    version: string;
    timeUnixCreated: number;
    timeUnixUpdated: number;
    locationChannels: string[];
    isLocated: boolean;
    scoreInteraction: number;
  }
  data: {
    timeUnixPublished: number;
    source: string | null;
    url_source: string;
    author: string | null;
    title: string;
    description: string;
    language: string;
    country: string;
    img: string | null;
    isImageFromFirebase: boolean;
  }
}