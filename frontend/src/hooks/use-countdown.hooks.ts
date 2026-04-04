import { useEffect, useState } from 'react';

export function useCountdown() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (seconds <= 0) {
      return;
    }

    const timerId = window.setInterval(() => {
      setSeconds((current) => {
        return current <= 1 ? 0 : current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [seconds]);

  function start(nextSeconds: number) {
    setSeconds(Math.max(0, nextSeconds));
  }

  return {
    seconds,
    start,
  };
}
