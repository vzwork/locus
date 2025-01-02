/* eslint-disable  @typescript-eslint/no-explicit-any */

import styles from './style.module.css'

import Link from 'next/link'
import Image from 'next/image'

import { getStorage, ref, getDownloadURL } from 'firebase/storage'

async function getURL(url:string) {
  const storage = getStorage();

  try {
    const downloadUrl = await getDownloadURL(
      ref(storage, 'gs://locus-new.firebasestorage.app/channels/' + url)
    );
    return downloadUrl;
  } catch (err: any) {
    console.error(err);
    return '/locus.jpg';
  };
}

export default async function ButtonChannelDesktop({name}:{name: string}) {

  if (!name) {
    return <div>loading...</div>
  }


  const urlSrc = await getURL(name + '.jpg');

  return (
    <Link href={name} className="w-full">
      <div className="relative rounded-lg overflow-hidden w-full h-16">
        <Image
          src={urlSrc}
          alt="locus"
          fill={true}
          sizes="100px"
        />
        <div className={styles.ButtonChannelDesktop}>
          {name.toUpperCase()}
        </div>
      </div>
    </Link>
  )
}