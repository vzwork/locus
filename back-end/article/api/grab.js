import * as fs from 'fs';

const keyMediastack = JSON.parse(fs.readFileSync('./key/serviceAccountKeyMediastack.json', 'utf8'));

function scrape(session_name, count_article) {
  // create a folder for output with session_name and iso date
  const folder_name = session_name + '~' + new Date().toISOString();
  try {
    if (!fs.existsSync('./output')) {
      fs.mkdirSync('./output');
    }
    if (!fs.existsSync('./output/' + folder_name)) {
      fs.mkdirSync('./output/' + folder_name);
    }
  } catch (err) {
    console.error(err);
    return -1;
  }

  // scrape articles
  try {
    fetch('https://api.mediastack.com/v1/news?access_key=' + keyMediastack.access_key + '&limit=' + count_article + '&languages=en')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // Parse JSON data
      })
      .then(data => {
        // write articles to different json files inside appropriate folder
        console.log(data);
        data.data.forEach((article, index) => {
          console.log(article)
          console.log(index)
          fs.writeFileSync('./output/' + folder_name + '/article_' + index + '.json', JSON.stringify(article, null, 2));
        });
      })
      .catch(error => {
        console.error('Error:', error);
      });
  } catch (err) {
    console.error(err);
    return -1;
  }
}

scrape('english', 16);