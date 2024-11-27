import Home from "./[channel]/page"

export default function Landing() {
  const channelName = "";
  const channelPromise: Promise<{ channel: string }> = Promise.resolve({ channel: channelName });

  return <Home params={channelPromise} />
}