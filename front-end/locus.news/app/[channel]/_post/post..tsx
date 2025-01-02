import styles from './style.module.css'
import Image from "next/image"

export default function Post() {
  return (
    <div className={styles.post}>
      <p className="text-xl py-4">Lorem ipsum dolor sit amet consectetur adipisicing elit. </p>
      <div className={styles.contentPost}>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Minus ad quod ducimus corrupti adipisci vel nostrum similique tempora, dolorem quis!</p>
        <div>

        <Image src="/locus.jpg" alt="lorem" width={400} height={224} />
        </div>
      </div>
    </div>
  )
}