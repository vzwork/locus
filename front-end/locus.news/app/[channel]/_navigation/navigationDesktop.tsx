import ButtonChannelDesktop from "../_buttonChanel/buttonChannelDesktop";
import { doc, getDoc, getFirestore } from "firebase/firestore"

async function getChannel(root: string) {

  const db = getFirestore();
  const docRef = doc(db, 'channels', root);
  const docSnap = await getDoc(docRef);

  return docSnap.data();
}

export default async function NavigationDesktop({base}: {base: string}) {
  const data = await getChannel(base);

  // console.log(data)

  if (!data) {
    return <div>loading...</div>
  }

  // console.log(data);

  return (
    <div className="flex flex-col p-2">
      <div>
        <ButtonChannelDesktop name={data.name} />
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
              <div className="w-full">
                <ButtonChannelDesktop name={name} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}