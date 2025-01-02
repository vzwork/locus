console.log('hello')

import dotenv from 'dotenv';
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { collection, getDocs } from "firebase/firestore";

dotenv.config();

console.log('process.env.NEXT_PUBLIC_FIREBASE_API_KEY');
console.log(process.env.NEXT_PUBLIC_FIREBASE_API_KEY);

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "locus-new.firebaseapp.com",
  projectId: "locus-new",
  storageBucket: "locus-new.firebasestorage.app",
  messagingSenderId: "367099181537",
  appId: "1:367099181537:web:c3cac9e4423be1860b7aa0",
  measurementId: "G-7NDLSTLXNL"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function getStaticProps() {
  const querySnapshot = await getDocs(collection(db, 'your-collection'));
  const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  console.log('data');

  querySnapshot.forEach((doc) => {
    console.log(doc.id, " => ", doc.data());
  })

  return { props: { data }, revalidate: 10 }; // Revalidate every 10 seconds
}

await getStaticProps();

export {db, getStaticProps};