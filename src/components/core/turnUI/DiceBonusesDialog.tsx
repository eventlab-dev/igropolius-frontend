import { Button } from '@/components/ui/button';
import { makePlayerMove } from '@/lib/api';
import { getTurnsNoun } from '@/lib/utils';
import { TrainsConfig } from '@/lib/constants';
import { SectorsById, sectorsData } from '@/lib/mockData';
import useCameraStore from '@/stores/cameraStore';
import useDiceStore from '@/stores/diceStore';
import usePlayerStore from '@/stores/playerStore';
import useSystemStore from '@/stores/systemStore';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useShallow } from 'zustand/shallow';

export default function DiceBonusesDialog() {
  const [selectedDie, setSelectedDie] = useState<number | null>(null);
  const [adjustBy1, setAdjustBy1] = useState<number | null>(null);
  const [rideTrain, setRideTrain] = useState<boolean>(false);

  const rollResult = useDiceStore(state => state.rollResult);
  const rollResultSum = rollResult.reduce((a, b) => a + b, 0);

  const adjustedRoll =
    selectedDie !== null ? selectedDie + (adjustBy1 || 0) : rollResultSum + (adjustBy1 || 0);

  const { myPlayer, moveMyPlayer, setNextTurnState } = usePlayerStore(
    useShallow(state => ({
      myPlayer: state.myPlayer,
      moveMyPlayer: state.moveMyPlayer,
      setNextTurnState: state.setNextTurnState,
    }))
  );

  const setHighlightedSectorId = useSystemStore(state => state.setHighlightedSectorId);

  const handleSubmit = async () => {
    let adjustBy1Typed = null;
    switch (adjustBy1) {
      case 1:
        adjustBy1Typed = 1 as const;
        break;
      case -1:
        adjustBy1Typed = -1 as const;
        break;
      default:
        adjustBy1Typed = null;
    }

    useSystemStore.setState(state => ({ ...state, disablePlayersQuery: true }));
    usePlayerStore.setState(state => ({ ...state, isPlayerMoving: true }));
    setHighlightedSectorId(null);

    if (myPlayer) {
      await useCameraStore.getState().cameraToPlayer(myPlayer.id);
    }

    const { new_sector_id, map_completed } = await makePlayerMove({
      type: 'dice-roll',
      selected_die: selectedDie,
      adjust_by_1: adjustBy1Typed,
      ride_train: rideTrain,
    });

    await setNextTurnState({
      sectorToId: new_sector_id,
      action: 'skip-bonus',
      mapCompleted: map_completed,
    });

    await moveMyPlayer({
      sectorTo: new_sector_id,
      rideTrain,
    });

    usePlayerStore.setState(state => ({ ...state, isPlayerMoving: false }));
    useSystemStore.setState(state => ({ ...state, disablePlayersQuery: false }));
  };

  useEffect(() => {
    if (rollResult.length === 0) {
      usePlayerStore.getState().setTurnState('rolling-dice');
    }
  }, [rollResult.length]);

  const { mutateAsync: doSubmit, isPending } = useMutation({
    mutationFn: handleSubmit,
  });

  const bonusCards = myPlayer?.bonus_cards || [];

  const adjustBy1Card = bonusCards.find(card => card.bonus_type === 'adjust-roll-by1');
  const hasAdjustBy1 = Boolean(adjustBy1Card);

  const chooseDieCard = bonusCards.find(card => card.bonus_type === 'choose-1-die');
  const hasChooseDie = Boolean(chooseDieCard);

  const canRideTrain = Boolean(
    myPlayer?.sector_id && SectorsById[myPlayer.sector_id].type === 'railroad'
  );

  let trainDestination: number | null = null;
  if (canRideTrain && myPlayer?.sector_id) {
    trainDestination = TrainsConfig[myPlayer.sector_id].sectorTo;
  }

  let finalDestination = myPlayer?.sector_id || 0;
  if (rideTrain && trainDestination) {
    finalDestination = trainDestination;
  }
  if (selectedDie) {
    finalDestination += selectedDie;
  } else {
    finalDestination += rollResultSum;
  }
  if (adjustBy1) {
    finalDestination += adjustBy1;
  }

  finalDestination = ((finalDestination - 1) % sectorsData.length) + 1;

  useEffect(() => {
    if (!myPlayer) {
      setHighlightedSectorId(null);
      return;
    }

    setHighlightedSectorId(finalDestination);

    return () => {
      setHighlightedSectorId(null);
    };
  }, [myPlayer, finalDestination, setHighlightedSectorId]);

  if (!myPlayer) {
    return null;
  }

  const adjustBy1Cooldown = adjustBy1Card ? adjustBy1Card.cooldown_turns_left : 0;
  const chooseDieCooldown = chooseDieCard ? chooseDieCard.cooldown_turns_left : 0;

  return (
    <div className="backdrop-blur-[1.5rem] bg-card/70 border-none rounded-xl p-4 font-semibold">
      <div className="w-[400px]">
        <div className="text-xl font-wide-semibold">Бонусы на ход</div>
        <div className="mt-[20px]">
          На кубиках: {rollResultSum} ({rollResult.join(' и ')})
        </div>

        {canRideTrain && trainDestination && (
          <div className="mt-[20px]">
            <div className="mb-[15px]">
              Проехать на поезде до сектора #{trainDestination} и ходить с него?
            </div>
            <NumberToggle
              options={[
                { value: 0, label: 'Нет' },
                { value: 1, label: 'Да' },
              ]}
              value={rideTrain ? 1 : 0}
              onChange={value => {
                setRideTrain(value === 1);
              }}
            />
          </div>
        )}

        {hasChooseDie && (
          <div className="mt-[20px]">
            <div className="mb-[15px]">
              Выбрать только один кубик?
              {chooseDieCooldown !== 0 && <span>&nbsp;Кулдаун: {getTurnsNoun(chooseDieCooldown)}</span>}
            </div>
            <NumberToggle
              options={[
                { value: null, label: 'Нет' },
                ...rollResult.map(num => ({
                  value: num,
                  label: num.toString(),
                  disabled: chooseDieCooldown !== 0,
                })),
              ]}
              value={selectedDie}
              onChange={value => {
                setSelectedDie(prev => (prev === value ? null : value));
              }}
            />
          </div>
        )}

        {hasAdjustBy1 && (
          <div className="mt-[20px]">
            <div className="mb-[15px]">
              Изменить результат на 1?{' '}
              {adjustBy1Cooldown !== 0 && <span>Кулдаун: {getTurnsNoun(adjustBy1Cooldown)}</span>}
            </div>
            <NumberToggle
              options={[
                { value: null, label: 'Нет' },
                { value: 1, label: '+1', disabled: adjustBy1Cooldown !== 0 },
                { value: -1, label: '-1', disabled: adjustBy1Cooldown !== 0 },
              ]}
              value={adjustBy1}
              onChange={value => {
                setAdjustBy1(prev => (prev === value ? null : value));
              }}
            />
          </div>
        )}

        <div className="mt-[50px]">
          <Button
            type="button"
            loading={isPending}
            onClick={() => doSubmit()}
            className="w-full font-bold bg-primary text-primary-foreground rounded-md py-2 hover:bg-primary/90 transition-colors"
          >
            Применить с результатом: {adjustedRoll} (#{finalDestination})
          </Button>
        </div>
      </div>
    </div>
  );
}

type ToggleOption = {
  value: number | null;
  label: string;
  disabled?: boolean;
};

type NumberToggleProps = {
  options: ToggleOption[];
  value: number | null;
  onChange: (value: number | null) => void;
};

export function NumberToggle({ options, value, onChange }: NumberToggleProps) {
  return (
    <div className="flex gap-4">
      {options.map((num, idx) => (
        <Button
          key={idx}
          type="button"
          onClick={() => onChange(num.value)}
          disabled={num.disabled}
          className="flex-1 items-center justify-center rounded-md p-[6px]
            data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:border-primary
            data-[active=false]:bg-muted data-[active=false]:text-muted-foreground data-[active=false]:border-muted
            "
          data-active={value === num.value}
        >
          {num.label}
        </Button>
      ))}
    </div>
  );
}
