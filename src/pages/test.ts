import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";

const test = async () => {
  const db = getFirestore();
  const q = query(
    collection(db, "posts"),
    where("statistics.timestampWorkloadNext", "<", Date.now())
  );

  console.log(Date.now());

  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((doc) => {
    console.log(doc.id, " => ", doc.data());
  });
};

export default test;
