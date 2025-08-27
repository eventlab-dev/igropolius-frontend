import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../ui/dialog';
import { ScrollArea } from '../../ui/scroll-area';
import { cn } from '@/lib/utils';
import usePlayerStore from '@/stores/playerStore';
import { useCallback, useEffect, useState } from 'react';
import { buttonVariants } from '../../ui/button';
import { XIcon } from 'lucide-react';
import StatisticsHeading from './components/StatisticsHeading';
import StatisticsGeneralSection from './components/StatisticsGeneralSection';
import StatisticsPlayerSection from './components/StatisticsPlayerSection';
import StatisticsCredits from './components/StatisticsCredits';
import { useQuery } from '@tanstack/react-query';
import { fetchFinalStats } from '@/lib/api';
import { SECTORS_COLOR_GROUPS } from '@/lib/constants';
import useUrlPath from '@/hooks/useUrlPath';

const ENABLE_STATS = false;

function EndGameStatistics() {
  const { activate, pathActive } = useUrlPath('/finals');

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (ENABLE_STATS) {
      setIsOpen(pathActive);
    }
  }, [pathActive]);

  const { data } = useQuery({
    queryKey: ['final-stats'],
    queryFn: fetchFinalStats,
  });

  const buildingsPerSector = usePlayerStore(state => state.buildingsPerSector);

  const getPlayersBuildings = useCallback(
    (playerId: number) => {
      return Object.values(buildingsPerSector).flatMap(buildings => {
        return buildings.filter(b => b.owner.id === playerId && b.gameStatus === 'completed');
      }).length;
    },
    [buildingsPerSector]
  );

  const genMonopoliesAmount = useCallback(
    (playerId: number) => {
      let monopolies = 0;
      for (const group of SECTORS_COLOR_GROUPS) {
        const buildingInGroup = buildingsPerSector[group[0]];
        const playerBuilding = buildingInGroup?.find(
          b => b.owner.id === playerId && b.gameStatus === 'completed'
        );
        if (playerBuilding?.hasGroupBonus) {
          monopolies += 1;
        }
      }
      return monopolies;
    },
    [buildingsPerSector]
  );

  if (!data) {
    return null;
  }

  const extendedPlayers = data.players
    .map(player => ({
      ...player,
      monopolies_amount: genMonopoliesAmount(player.player_id),
      buildings_amount: getPlayersBuildings(player.player_id),
    }))
    .sort((a, b) => b.total_score - a.total_score);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        activate(open);
      }}
    >
      <DialogTrigger className="absolute" />
      <DialogContent className="!max-w-none w-full h-full !bg-black/20 backdrop-blur-[50px] p-0">
        <ScrollArea className="h-full overflow-hidden">
          <div className="flex flex-col gap-[150px] pt-[98px] pb-[369px]">
            <DialogHeader className="gap-[30px]">
              <DialogTitle>
                <StatisticsHeading>
                  <span className="text-primary">Игрополиус</span> окончен!
                </StatisticsHeading>
              </DialogTitle>
              <DialogDescription className="text-center text-2xl text-foreground font-roboto-wide-black-alt w-[670px] mx-auto leading-7">
                Спасибо всем за участие, и за то что смотрели, дальше — больше :)
              </DialogDescription>
            </DialogHeader>

            <div className="mx-auto">
              <StatisticsGeneralSection data={data} />

              <div className="space-y-[224px] mb-[166px]">
                {extendedPlayers.map((player, idx) => (
                  <StatisticsPlayerSection
                    key={player.player_id}
                    data={{ ...player, placement: idx + 1 }}
                  />
                ))}
              </div>

              <StatisticsCredits />

              <div className="flex flex-col justify-center gap-[50px] mt-[200px]">
                <StatisticsHeading>Спасибо ещё раз!</StatisticsHeading>

                <DialogClose className={cn(buttonVariants({ variant: 'action' }), 'mx-auto')}>
                  Закрыть титры
                </DialogClose>
              </div>
            </div>

            <DialogClose className="absolute top-[50px] right-[60px] cursor-pointer">
              <XIcon className="stroke-3 size-8" />
            </DialogClose>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default EndGameStatistics;
