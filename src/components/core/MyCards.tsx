import usePlayerStore from '@/stores/playerStore';
import { Card } from '../ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { Button } from '../ui/button';
import { frontendCardsData, frontendInstantCardsData, mainCardTypes } from '@/lib/mockData';
import { useShallow } from 'zustand/shallow';
import { ManualUseCard } from '@/lib/types';
import { useState } from 'react';
import BonusCardUsedConfirmation from './turnUI/BonusCardUsedConfirmation';
import { activateBonusCard } from '@/lib/api';
import { resetPlayersQuery } from '@/lib/queryClient';
import { MainBonusCardType } from '@/lib/api-types-generated';
import ImageLoader from './ImageLoader';
import { getCardDescription, getTurnsNoun } from '@/lib/utils';
import { BUILDING_BONUS_IMAGE, SCORE_BONUS_PER_MAP_COMPLETION } from '@/lib/constants';
import BonusCardComponent from './BonusCardComponent';
import { useNavigate } from 'react-router';
import useSystemStore from '@/stores/systemStore';

export default function MyCards() {
  const { myPlayer, turnState } = usePlayerStore(
    useShallow(state => ({
      myPlayer: state.myPlayer,
      turnState: state.turnState,
    }))
  );

  const getCardCooldown = useSystemStore(state => state.getCardCooldown);

  const navigate = useNavigate();

  const [usedCard, setUsedCard] = useState<ManualUseCard | null>(null);

  if (!myPlayer) {
    return null;
  }

  const handleUseCard = async (cardType: MainBonusCardType) => {
    if (cardType === 'reroll-game' || cardType === 'game-help-allowed') {
      await activateBonusCard({ bonus_type: cardType });
      setUsedCard(cardType);
      resetPlayersQuery();
      return;
    }
  };

  const handleDialogClose = () => {
    setUsedCard(null);
    if (usedCard === 'reroll-game') {
      navigate('/game-review?completion=reroll');
    }
  };

  const mapBonus = myPlayer.maps_completed * SCORE_BONUS_PER_MAP_COMPLETION;
  const buildingBonus = myPlayer.building_upgrade_bonus;

  let difficultyVariant: 'neutral' | 'positive' | 'negative' = 'neutral';
  let tooltipText = 'Средняя';
  let difficultyImg = undefined;
  let difficultyDescription = '';
  if (myPlayer.game_difficulty_level === -1) {
    difficultyVariant = 'positive';
    tooltipText = 'Лёгкая';
    difficultyImg = frontendInstantCardsData['decrease-difficulty'].picture;
    difficultyDescription = frontendInstantCardsData['decrease-difficulty'].description;
  } else if (myPlayer.game_difficulty_level === 1) {
    difficultyVariant = 'negative';
    tooltipText = 'Сложная';
    difficultyImg = frontendInstantCardsData['increase-difficulty'].picture;
    difficultyDescription = frontendInstantCardsData['increase-difficulty'].description;
  }

  return (
    <>
      {usedCard && <BonusCardUsedConfirmation card={usedCard} onClose={handleDialogClose} />}
      <Card className="flex flex-row p-2 gap-2">
        {mainCardTypes.map((bonus, idx) => {
          const cardData = frontendCardsData[bonus];
          const cardOwned = myPlayer.bonus_cards.find(card => card.bonus_type === bonus);
          const cooldownTurns = cardOwned?.cooldown_turns_left || 0;
          const cardCooldown = getCardCooldown(bonus);
          const canBeUsed =
            cardOwned &&
            turnState === 'filling-game-review' &&
            (bonus === 'reroll-game' || bonus === 'game-help-allowed') &&
            cooldownTurns === 0;

          return (
            <Tooltip delayDuration={0} key={idx}>
              <TooltipTrigger>
                <ImageLoader
                  className="relative z-10 flex w-[32px] h-[45px] rounded-sm overflow-hidden data-[usable=true]:animate-shake data-[inactive=true]:grayscale-100"
                  data-usable={canBeUsed}
                  data-inactive={!cardOwned}
                  src={cardData.picture}
                  alt={cardData.name}
                />
              </TooltipTrigger>
              <TooltipContent
                className="bg-card/70 backdrop-blur-[1.5rem] p-3 rounded-xl"
                side="bottom"
                align="start"
                sideOffset={8}
              >
                <div className="flex gap-4">
                  <div className="">
                    <ImageLoader
                      src={cardData.picture}
                      alt={cardData.name}
                      className="w-[200px] rounded-md overflow-hidden"
                    />
                  </div>
                  <div className="w-[200px]">
                    <div className="text-[20px] font-semibold mb-2 leading-6">{cardData.name}</div>
                    <div className="text-base font-semibold text-muted-foreground leading-[19px]">
                      {getCardDescription(cardData)}
                    </div>
                    {canBeUsed && (
                      <div className="mt-2 w-full">
                        <Button className="w-full" onClick={() => handleUseCard(bonus)}>
                          Использовать
                        </Button>
                      </div>
                    )}
                    {cardCooldown !== 0 && (
                      <div className="mt-2 text-sm font-bold">Кулдаун: {getTurnsNoun(cardCooldown)}</div>
                    )}
                    {cardOwned &&
                      (cooldownTurns === 0 ? (
                        <div className="mt-2 text-sm font-bold text-green-400">
                          Готова к использованию
                        </div>
                      ) : (
                        <div className="mt-2 text-sm font-bold text-red-400">
                          Осталось: {getTurnsNoun(cooldownTurns)}
                        </div>
                      ))}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
        <>
          <div className="flex flex-col items-center justify-center">
            <div className="rounded-xl bg-gray-500 w-1 h-3.5"></div>
          </div>
          {myPlayer.game_difficulty_level !== 0 && (
            <BonusCardComponent
              size="small"
              variant={difficultyVariant}
              description={difficultyDescription}
              header={<div className="text-xs">Слж</div>}
              tooltipHeader={`Уровень сложности: ${tooltipText}`}
              image={difficultyImg}
            />
          )}
          {buildingBonus !== 0 && (
            <BonusCardComponent
              size="small"
              variant={buildingBonus > 0 ? 'positive' : 'negative'}
              description="Автоматически увеличивает или уменьшает размер следующего здания"
              header={<div className="text-xs">Дом</div>}
              tooltipHeader={`Бонус зданий: ${buildingBonus > 0 ? '+' : ''}${buildingBonus}`}
              value={buildingBonus > 0 ? `+${buildingBonus}` : buildingBonus}
              image={BUILDING_BONUS_IMAGE}
            />
          )}
          {mapBonus > 0 && (
            <BonusCardComponent
              size="small"
              variant={mapBonus > 0 ? 'positive' : 'neutral'}
              description="Автоматически добавляет бонус к каждой пройденной игре: 5 * круг"
              header={<div className="text-xs">Круг</div>}
              tooltipHeader={`Пройдено кругов: ${myPlayer.maps_completed}`}
              value={mapBonus}
            />
          )}
        </>
      </Card>
    </>
  );
}
