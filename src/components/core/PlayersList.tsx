import PlayerDialog from './playerDialog/PlayerDialog';
import usePlayerStore from '@/stores/playerStore';
import { useShallow } from 'zustand/shallow';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './Collapsible';
import useUrlPath from '@/hooks/useUrlPath';

function PlayersList() {
  const { players, myPlayer, turnState } = usePlayerStore(
    useShallow(state => ({
      players: state.players,
      myPlayer: state.myPlayer,
      turnState: state.turnState,
    }))
  );

  const showCards = turnState === 'stealing-bonus-card';
  const nonCollapsiblePlayersCount = 3;
  const nonCollapsiblePlayers = showCards ? players : players.slice(0, nonCollapsiblePlayersCount);
  const collapsiblePlayers = players.slice(nonCollapsiblePlayersCount);

  const { pathActive: isFinals } = useUrlPath('/finals');

  if (players.length === 0 || isFinals) {
    return null;
  }

  return (
    <div className="w-[268px]">
      <Collapsible>
        <div className="flex w-full justify-between items-center">
          <span className="text-[#282828] font-roboto-wide-black opacity-70">Игроки</span>
          <CollapsibleTrigger className="p-0 h-auto" />
        </div>
        <div className="space-y-[5px]">
          {nonCollapsiblePlayers.map((player, idx) => {
            const isCurrentPlayer = myPlayer?.id === player.id;
            return (
              <PlayerDialog
                key={player.id}
                player={player}
                isCurrentPlayer={isCurrentPlayer}
                placement={idx + 1}
                showCards={showCards}
              />
            );
          })}
        </div>
        {!showCards && (
          <CollapsibleContent>
            {collapsiblePlayers.map((player, idx) => {
              const isCurrentPlayer = myPlayer?.id === player.id;
              return (
                <PlayerDialog
                  key={player.id}
                  player={player}
                  isCurrentPlayer={isCurrentPlayer}
                  placement={idx + 1 + nonCollapsiblePlayersCount}
                  showCards={showCards}
                />
              );
            })}
          </CollapsibleContent>
        )}
      </Collapsible>
    </div>
  );
}

export default PlayersList;
