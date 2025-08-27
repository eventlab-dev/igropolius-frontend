import usePlayerStore from '@/stores/playerStore';
import useSystemStore from '@/stores/systemStore';
import { useShallow } from 'zustand/shallow';
import GameReviewForm from './GameReviewForm';
import RollBonusCard from './RollBonusCard';
import DiceBonusesDialog from './DiceBonusesDialog';
import { DiceRollButton } from './DiceRollButton';
import SkipStreetTaxDialog from './SkipStreetTaxDialog';
import SkipMapTaxDialog from './SkipMapTaxDialog';
import SkipPrisonDialog from './SkipPrisonDialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LoseCardOnDropDialog from './LoseCardDialog';
import PrisonEnterCardRoll from './PrisonEnterCardRoll';
import RollWithInstantCards from './RollWithInstantCards';
import { useEffect, useState } from 'react';
import { SectorsById } from '@/lib/mockData';
import PointAUCButton from './PointAUCButton';
import GameGauntletsButton from './GameGauntletsButton';
import { formatTsToMonthDatetimeWithMSK } from '@/lib/utils';

export default function PlayerTurnUI() {
  const { turnState, isPlayerMoving, hasCardsToSteal, myPlayerSectorId, myPlayer } = usePlayerStore(
    useShallow(state => {
      const myCardsSet = new Set(state.myPlayer?.bonus_cards.map(card => card.bonus_type) ?? []);
      const otherPlayers = state.players.filter(player => player.id !== state.myPlayerId);
      const cardsToSteal = otherPlayers.flatMap(player =>
        player.bonus_cards.filter(card => !myCardsSet.has(card.bonus_type))
      );
      return {
        turnState: state.turnState,
        isPlayerMoving: state.isPlayerMoving,
        hasCardsToSteal: cardsToSteal.length > 0,
        myPlayerSectorId: state.myPlayer?.sector_id ?? null,
        canSelectBuildingSector: state.canSelectBuildingSector,
        myPlayer: state.myPlayer,
      };
    })
  );

  const currentSector = myPlayerSectorId ? SectorsById[myPlayerSectorId] : null;
  const showPointAUCButton = currentSector?.rollType === 'auc';

  const { eventStartTime, eventEndTime, setMainNotification } = useSystemStore(
    useShallow(state => ({
      eventStartTime: state.eventStartTime,
      eventEndTime: state.eventEndTime,
      setMainNotification: state.setMainNotification,
    }))
  );

  const [eventNotStarted, setEventNotStarted] = useState(false);
  const [eventEnded, setEventEnded] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!eventStartTime || !eventEndTime) {
        return;
      }
      const now = Date.now();
      const _eventNotStarted = now < eventStartTime * 1000;
      setEventNotStarted(_eventNotStarted);
      const _eventEnded = now > eventEndTime * 1000;
      setEventEnded(_eventEnded);

      if (_eventNotStarted) {
        setMainNotification({
          text: `Ивент начнется ${formatTsToMonthDatetimeWithMSK(eventStartTime)}`,
          variant: 'info',
          tag: 'event-start-timer',
        });
      } else {
        const mainNotification = useSystemStore.getState().mainNotification;
        if (mainNotification?.tag === 'event-start-timer') {
          setMainNotification(null);
        }
      }

      // if (_eventEnded) {
      //   const players = usePlayerStore.getState().players;
      //   const playersByScore = players.sort((p1, p2) => p2.total_score - p1.total_score);
      //   const winner = playersByScore[0];
      //   const notificationText = winner
      //     ? `Ивент завершён, победил ${winner.username}!`
      //     : 'Ивент завершён';

      //   setMainNotification({
      //     text: notificationText,
      //     variant: 'info',
      //     tag: 'event-ended',
      //     permanent: true,
      //   });
      // }
    }, 1000);
    return () => clearInterval(interval);
  }, [eventStartTime, eventEndTime, setMainNotification]);

  const [moveToDialog, setMoveToDialog] = useState<'drop' | 'reroll' | null>(null);

  useEffect(() => {
    setMoveToDialog(null);
  }, [turnState]);

  const eventSettingsNotLoaded = eventStartTime === null || eventEndTime === null;

  const needToSelect = myPlayer && (!myPlayer.model_name || !myPlayer.color);

  const disableUI =
    isPlayerMoving || eventSettingsNotLoaded || eventNotStarted || eventEnded || needToSelect;
  if (disableUI) {
    if (eventSettingsNotLoaded) {
      return (
        <div className="pointer-events-auto">
          <Button variant="outline" disabled>
            Загрузка...
          </Button>
        </div>
      );
    }
    return null;
  }

  switch (turnState) {
    case null:
      return null;
    case 'rolling-dice':
      return <DiceRollButton />;
    case 'filling-game-review':
      return (
        <div className="flex w-[736px] gap-2">
          <RollWithInstantCards
            autoOpen={moveToDialog === 'reroll'}
            onClose={result => setMoveToDialog(result ?? null)}
          />
          <GameReviewForm showTrigger />
          {showPointAUCButton && <PointAUCButton />}
          {currentSector?.gameLengthRanges && (
            <GameGauntletsButton gameLengthRanges={currentSector?.gameLengthRanges} />
          )}
        </div>
      );
    case 'rolling-bonus-card':
      return <RollBonusCard />;
    case 'using-dice-bonuses':
      return <DiceBonusesDialog />;
    case 'using-street-tax-bonuses':
      return <SkipStreetTaxDialog />;
    // case 'using-reroll-bonuses':
    //   return <GameRerollDialog />;
    case 'using-prison-bonuses':
      return <SkipPrisonDialog />;
    case 'using-map-tax-bonuses':
      return <SkipMapTaxDialog />;
    case 'stealing-bonus-card':
      if (!hasCardsToSteal) {
        return <NoCardsToStealDialog />;
      }
      return (
        <Card className="p-4">
          <span>Выбери, какую карточку своровать у игрока</span>
        </Card>
      );
    case 'entering-prison':
      return <PrisonEnterCardRoll />;
    case 'dropping-card-after-game-drop':
      return <LoseCardOnDropDialog />;
    case 'dropping-card-after-instant-roll':
      return (
        <LoseCardOnDropDialog
          autoOpen={moveToDialog === 'drop'}
          onClose={() => setMoveToDialog(null)}
        />
      );
    case 'dropping-card-after-police-search':
      return (
        <LoseCardOnDropDialog
          autoOpen={moveToDialog === 'drop'}
          onClose={() => setMoveToDialog(null)}
        />
      );
    case 'choosing-building-sector':
      return (
        <Card className="p-4">
          <span>Выбери сектор для строительства</span>
        </Card>
      );
    default: {
      const error: never = turnState;
      throw new Error(`Unknown turn state: ${error}`);
    }
  }
}

function NoCardsToStealDialog() {
  const setNextTurnState = usePlayerStore(state => state.setNextTurnState);
  return (
    <Card className="p-4">
      <span className="font-wide-semibold">
        Сейчас у игроков нет карточек
        <br />
        которые можно своровать
      </span>
      <div className="flex justify-evenly mt-2 gap-2">
        <Button
          variant="outline"
          className="bg-[#0A84FF] hover:bg-[#0A84FF]/70 w-full flex-1"
          onClick={() => setNextTurnState({})}
        >
          Продолжить
        </Button>
      </div>
    </Card>
  );
}
