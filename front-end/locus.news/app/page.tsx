import Home from "./[channel]/page"
// import { initializeApp } from "firebase/app";

// const firebaseConfig = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//   authDomain: "locus-new.firebaseapp.com",
//   projectId: "locus-new",
//   storageBucket: "locus-new.firebasestorage.app",
//   messagingSenderId: "367099181537",
//   appId: "1:367099181537:web:a77932829070825d0b7aa0",
//   measurementId: "G-4C7ME91ZQP"
// };

// initializeApp(firebaseConfig);

export default function Landing() {
  return <Home params={Promise.resolve({ channel: "locus" })} />
}