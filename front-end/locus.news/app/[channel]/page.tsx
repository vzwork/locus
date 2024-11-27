/* eslint-disable  @typescript-eslint/no-explicit-any */

import Image from "next/image";
import Link from "next/link";
import styles from './landing.module.css';

export default async function Home({
  params,
}: {
  params: Promise<{ channel: string }>
}) {
  return (
    <div className="flex">
      <div style={{ background: '#777', width: '200px', height: '100vh', position: 'sticky', top: '0' }}>
        <Navigation />
      </div>
      <div className="flex-1" style={{ background: '#666', height: '200vh' }}>
        {(await params).channel}
      </div>
    </div>
  );
}

const children = [
  {
    name: 'politics',
    url: 'politics',
    image: '/capitol.png',
  },
  {
    name: 'finance',
    url: 'finance',
    image: '/bull.png',
  },
  {
    name: 'sports',
    url: 'sports',
    image: '/sports.png',
  },
  {
    name: 'engineering',
    url: 'engineering',
    image: '/engineering.png',
  },
  {
    name: 'tech',
    url: 'tech',
    image: '/tech.png',
  },
  {
    name: 'entertainment',
    url: 'entertainment',
    image: '/entertainment.png',
  }
]

function Navigation() {
  return (
    <div className="flex flex-col p-2">
      <div>
        <Link href="/">
          <div className="relative h-16 rounded-lg overflow-hidden">
            <Image
              objectFit="fill"
              src="/trees.jpg"
              alt="locus"
              fill={true}
            />
            <div className={styles.textChannel}>
              LOCUS
            </div>
          </div>
        </Link>
      </div>
      <div className="flex flex-col">
        {children.map((child, idx) => (
          <div className="flex flex-col" key={idx}>
            <div className="flex">
              <div className="flex flex-col pl-3">
                <div className="flex-1 p-1" style={{ borderLeft: '1px solid white' }} />
              </div>
            </div>
            <div className="flex">
              <div className="flex flex-col pl-3">
                <div className="flex-1 p-1" style={{
                  borderLeft: '1px solid white',
                  borderBottom: '1px solid white'
                }} />
                {idx === children.length - 1
                  ? <div className="flex-1 p-1" />
                  : <div className="flex-1 p-1" style={{ borderLeft: '1px solid white' }} />
                }
              </div>
              <div className="w-full">
                <Channel data={child} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Channel(props: any) {
  return (
    <Link href={props.data.url} className="w-full">
      <div className="relative rounded-lg overflow-hidden w-full h-16">
        <Image
          objectFit="fill"
          src={props.data.image}
          alt="locus"
          fill={true}
        />
        <div className={styles.textChannel}>
          {props.data.name.toUpperCase()}
        </div>
      </div>
    </Link>
  )
}