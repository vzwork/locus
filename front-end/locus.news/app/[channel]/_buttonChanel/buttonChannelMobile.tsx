/* eslint-disable  @typescript-eslint/no-explicit-any */

import styles from './style.module.css'

import Link from 'next/link'

export default async function ButtonChannelMobile({ name }: { name: string }) {

  if (!name) {
    return <div>loading...</div>
  }

  return (
    <Link href={name} className="w-full">
        <div className="
          relative 
          rounded-lg 
          overflow-hidden 
          w-full 
          h-7 
          border 
          border-gray-300 
          overflow-hidden 
          px-1 
          flex 
          items-center 
          bg-slate-500">
          <div className={styles.ButtonChannelMobile}>
            {name.toUpperCase()}
          </div>
        </div>
    </Link>
  )
}