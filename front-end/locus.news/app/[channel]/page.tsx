import styles from './style.module.css';
import NavigationMobile from './_navigation/navigationMobile';
import NavigationDesktop from './_navigation/navigationDesktop';

import { userAgent } from 'next/server';
import { headers } from "next/headers";
import Content from './_content/content';

export default async function Home({
  params,
}: {
  params: Promise<{ channel: string }>
}) {

  const channel = (await params).channel

  // console.log(channel)

  const { device } = userAgent({ headers: await headers() })
  const deviceType = device.type === 'mobile' ? 'mobile' : 'desktop'

  console.log('device', deviceType)

  return (
    <>
      {deviceType === 'mobile' ? (
        <div className="flex justify-between">

          <div style={{ width: '140px', height: '100vh', }}>
            <NavigationMobile base={channel} />
          </div>

          <Content />
        </div>
      ) : (
        <div className="flex justify-between">

          <div style={{ minWidth: '200px', height: '100vh', }}>
            <NavigationDesktop base={channel} />
          </div>

          <Content />

          <div style={{ minWidth: '200px', height: '100vh', }} className={styles.containerRight}>
            extra desktop
          </div>
        </div>
      )}
    </>
  );
}