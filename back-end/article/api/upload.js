"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var zod_1 = require("zod");
var firebase_admin_1 = require("firebase-admin");
var keyFirebase = JSON.parse(fs.readFileSync('./key/serviceAccountKeyFirebase.json', 'utf8'));
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
var SchemaArticleAPI = zod_1.z.object({
    timeUnixPublished: zod_1.z.number(),
    author: zod_1.z.string(),
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    url_source: zod_1.z.string(),
    source: zod_1.z.string(),
    img: zod_1.z.string(),
    language: zod_1.z.string(),
    country: zod_1.z.string(),
    isImageFromFirebase: zod_1.z.boolean(),
});
var ArticleDefaultAPI = {
    timeUnixPublished: 0,
    author: '',
    title: '',
    description: '',
    url_source: '',
    source: '',
    img: '',
    language: '',
    country: '',
    isImageFromFirebase: false,
};
function upload(path_folder) {
    // initialize firebase admin
    // admin.initializeApp({
    //   credential: admin.credential.cert(keyFirebase),
    // });
    try {
        // connect to firebase
        firebase_admin_1.default.initializeApp({
            credential: firebase_admin_1.default.credential.cert(keyFirebase),
        });
    }
    catch (error) {
        console.log('Error initializing firebase');
        console.log(error);
        return -1;
    }
    try {
        // read the files in the folder
        var paths_files = fs.readdirSync(path_folder);
        var number_files_failed_to_parse = 0;
        paths_files.forEach(function (path_file) {
            var path_file_full = path.join(path_folder, path_file);
            var article_raw = JSON.parse(fs.readFileSync(path_file_full, 'utf8'));
            article_raw.timeUnixPublished = new Date(article_raw.published_at).getTime();
            article_raw.img = article_raw.image;
            article_raw.url_source = article_raw.url;
            article_raw.isImageFromFirebase = false;
            for (var key in ArticleDefaultAPI) {
                var typedKey = key;
                if (!article_raw.hasOwnProperty(typedKey) || article_raw[typedKey] === null) {
                    article_raw[typedKey] = ArticleDefaultAPI[typedKey];
                }
            }
            try {
                var article_zod = SchemaArticleAPI.parse(article_raw);
                // request ID from firebase
                var docRef = firebase_admin_1.default.firestore().collection('articles').doc();
                var id = docRef.id;
                var articleFirebase = {
                    id: id,
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
            }
            catch (error) {
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
