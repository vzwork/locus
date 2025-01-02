import { doc, getDoc, getFirestore } from "firebase/firestore"
import ButtonChannelMobile from "../_buttonChanel/buttonChannelMobile";

async function getChannel(root: string) {

  const db = getFirestore();
  const docRef = doc(db, 'channels', root);
  const docSnap = await getDoc(docRef);

  return docSnap.data();
}

export default async function NavigationMobile({base}: {base: string}) {
  const data = await getChannel(base);

  // console.log(data)

  if (!data) {
    return <div>loading...</div>
  }

  // console.log(data);

  return (
    <div className="flex flex-col p-2">
      <div>
        <ButtonChannelMobile name={data.name} />
      </div>
      <div className="flex flex-col">
        {data.children.map((name:string, idx:number) => (
          <div className="flex flex-col" key={idx}>
            <div className="flex">
              <div className="flex flex-col pl-3">
                <div className="flex-1 p-1" style={{ borderLeft: '1px solid grey' }} />
              </div>
            </div>
            <div className="flex">
              <div className="flex flex-col pl-3">
                <div className="flex-1 p-1" style={{
                  borderLeft: '1px solid grey',
                  borderBottom: '1px solid grey'
                }} />
                {idx === data.children.length - 1
                  ? <div className="flex-1 p-1" />
                  : <div className="flex-1 p-1" style={{ borderLeft: '1px solid grey' }} />
                }
              </div>
              <div className="w-full overflow-hidden">
                <ButtonChannelMobile name={name} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}