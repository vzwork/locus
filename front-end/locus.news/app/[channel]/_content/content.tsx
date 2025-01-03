import { collection, getDocs, getFirestore, query, where } from "firebase/firestore";
import Post from "../_post/post.";

async function getArticles(channel: string) {
  const db = getFirestore();
  const articlesRef = collection(db, 'articles');
  const q = query(articlesRef, where('sys.locationChannels', 'array-contains', channel));
  const querySnapshot = await getDocs(q);
  const articles = querySnapshot.docs.map(doc => doc.data());
  return articles;
}

export default async function Content({channel}: {channel: string}) {

  const articles = await getArticles(channel);

  return (
    <div style={{ flex: '1', display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: '500px', width: '100%' }}>

        {articles.map((article, index) => (
          <Post type="article" data={article.data} key={index}/>
        ))}
      </div>
    </div>
  )
}