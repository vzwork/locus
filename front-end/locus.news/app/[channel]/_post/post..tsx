"use client";
/* eslint-disable */

import styles from './style.module.css'
import Image from "next/image"

const customLoader = ({ src }: { src: string }) => {
  return src; // Return the URL directly
};

export default function Post({ type, data }: { type: string, data: any }) {
  console.log(type);

  return (
    <div className={styles.post}>
      <p className="text-xl py-4">{data.title}</p>
      <div className={styles.contentPost}>
          <p style={{flex: '2'}}>{data.description.replace(/[^ a-zA-Z.,?!'";:()\[\]{}-]/g, '')}</p>
          <div style={{ flex: '1', position: 'relative', width: '100%', minHeight: '100px', maxHeight: '150px', right: '0' }}>
            {data.img !== "" ?
              <Image loader={customLoader} src={data.img} alt="lorem" layout="fill"
                objectFit="cover" />
              :
              <Image loader={customLoader} src="/locus.jpg" alt="lorem" layout="fill"
                objectFit="cover" />
            }
          </div>
        
      </div>
    </div>
  )
}