import * as fs from 'fs';
// import admin from 'firebase-admin'
import { Article } from '../../../types/article';
import * as path from 'path';
import { z } from 'zod';
import admin from 'firebase-admin';
import { channel } from 'diagnostics_channel';

const keyFirebase = JSON.parse(fs.readFileSync('./key/serviceAccountKeyFirebase.json', 'utf8'));

// data: {
//   timeUnixPublished: number;
//   source: string;
//   url_source: string;
//   author: string;
//   title: string;
//   description: string;
//   language: string;
//   country: string;
//   img: string;
// }

const SchemaArticleAPI = z.object({
  timeUnixPublished: z.number(),
  channelOrigin: z.string(),
  author: z.string(),
  title: z.string(),
  description: z.string(),
  url_source: z.string(),
  source: z.string(),
  img: z.string(),
  language: z.string(),
  country: z.string(),
  isImageFromFirebase: z.boolean(),
})

const ArticleDefaultAPI = {
  timeUnixPublished: 0,
  channelOrigin: '',
  author: '',
  title: '',
  description: '',
  url_source: '',
  source: '',
  img: '',
  language: '',
  country: '',
  isImageFromFirebase: false,
}

function upload(path_folder: string) {
  // initialize firebase admin
  // admin.initializeApp({
  //   credential: admin.credential.cert(keyFirebase),
  // });
  try {
    // connect to firebase
    admin.initializeApp({
      credential: admin.credential.cert(keyFirebase),
    });
  } catch (error) {
    console.log('Error initializing firebase');
    console.log(error);
    return -1;
  }

  try {
    // read the files in the folder
    const paths_files = fs.readdirSync(path_folder);

    let number_files_failed_to_parse = 0;

    paths_files.forEach((path_file) => {
      const path_file_full = path.join(path_folder, path_file);
      const article_raw = JSON.parse(fs.readFileSync(path_file_full, 'utf8'));

      article_raw.timeUnixPublished = new Date(article_raw.published_at).getTime();
      article_raw.img = article_raw.image;
      article_raw.url_source = article_raw.url;
      article_raw.isImageFromFirebase = false;

      for (const key in ArticleDefaultAPI) {
        const typedKey = key as keyof typeof ArticleDefaultAPI;
        if (!article_raw.hasOwnProperty(typedKey) || article_raw[typedKey] === null) {
          article_raw[typedKey] = ArticleDefaultAPI[typedKey];
        }
      }

      try {
        const article_zod = SchemaArticleAPI.parse(article_raw);

        // request ID from firebase
        const docRef = admin.firestore().collection('articles').doc();
        const id = docRef.id;
        
        const articleFirebase: Article = {
          id,
          sys: {
            version: '1.0.1',
            timeUnixCreated: new Date().getTime(),
            timeUnixUpdated: new Date().getTime(),
            locationChannels: [],
            isLocated: false,
            scoreInteraction: 0,
          },
          data: article_zod,
        };

        // upload to firebase
        docRef.set(articleFirebase);

      } catch (error) {
        console.log(path_file_full);
        console.log(error);
      }

    });

    console.log('Number of files failed to parse: ', number_files_failed_to_parse);
  }
  catch (error) {
    console.log(error);
  }
}

upload('./output/english~2025-01-02T21:06:54.688Z');