import { formatMs } from '@/lib/utils';
import { useEffect, useState } from 'react';
import useSystemStore from '@/stores/systemStore';
import useUrlPath from '@/hooks/useUrlPath';
import { Button } from '@/components/ui/button';

type Props = {
  className?: string;
};

export default function Countdown({ className }: Props) {
  const [time, setTime] = useState(() => Date.now());
  const eventEndTime = useSystemStore(state => state.eventEndTime);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const { activate } = useUrlPath('/finals');

  if (!eventEndTime) {
    return <div className={className}>Загрузка...</div>;
  }

  const targetTime = eventEndTime * 1000;
  const diff = targetTime - time;

  if (diff > 0) {
    return <div className={className}>До конца — {formatMs(diff)}</div>;
  }

  const handleClick = () => {
    activate(true);
  };

  return (
    <Button variant="outline" className={className} onClick={handleClick}>
      Ивент завершен: итоги
    </Button>
  );
}
