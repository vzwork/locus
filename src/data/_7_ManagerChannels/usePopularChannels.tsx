import { useEffect, useState } from "react";
import { IChannel } from "../channel";
import ManagerChannels from "./ManagerChannels";

export default function usePopularChannels() {
  const managerChannels = ManagerChannels;
  const [popularChannels, setPopularChannels] = useState<IChannel[]>([]);

  useEffect(() => {
    const listener = managerChannels.addListenerPopularChannels(
      (channels) => {
        setPopularChannels(channels);
      }
    );

    return () => {
      managerChannels.removeListenerPopularChannels(listener);
    };
  }, []);

  return popularChannels;
}
