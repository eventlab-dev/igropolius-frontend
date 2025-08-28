import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { GameDifficulty, MainBonusCardType, PlayerDetails } from '@/lib/api-types-generated';
import { mainCardTypes, frontendCardsData, frontendInstantCardsData } from '@/lib/mockData';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState, useEffect, useRef } from 'react';
import ImageLoader from '../../ImageLoader';
import { getCardDescription } from '@/lib/utils';
import { BUILDING_BONUS_IMAGE, SCORE_BONUS_PER_MAP_COMPLETION } from '@/lib/constants';
import BonusCardComponent from '../../BonusCardComponent';

type GameCardProps = {
  type: MainBonusCardType;
  inactive?: boolean;
  cooldownTurnsLeft?: number;
};

function GameCard({ type, inactive, cooldownTurnsLeft }: GameCardProps) {
  const cardData = frontendCardsData[type];
  const isMobile = useIsMobile();
  const [showDescription, setShowDescription] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (showDescription) {
        setShowDescription(false);
      }
    };

    if (isMobile) {
      document.addEventListener('scroll', handleScroll, { passive: true });
      return () => document.removeEventListener('scroll', handleScroll);
    }
  }, [isMobile, showDescription]);

  const handleCardClick = () => {
    if (isMobile) {
      setShowDescription(!showDescription);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setShowDescription(false);
    }
  };

  if (isMobile) {
    return (
      <div className="relative">
        <div
          ref={cardRef}
          className="flex md:w-[134px] md:h-[189px] w-[122px] h-[173px] text-primary-foreground rounded-xl data-[inactive=true]:grayscale-100 cursor-pointer"
          data-inactive={inactive}
          onClick={handleCardClick}
        >
          <ImageLoader
            className="flex md:w-[134px] md:h-[189px] w-[122px] h-[173px] rounded-xl overflow-hidden"
            src={cardData.picture}
            alt={cardData.name}
          />
        </div>
        {showDescription && (
          <div
            className="fixed top-0 left-0 right-0 bottom-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={handleOverlayClick}
          >
            <div className="bg-card/95 backdrop-blur-[1.5rem] p-4 rounded-lg border shadow-lg w-full max-w-sm">
              <div className="text-[16px] font-semibold mb-2">{cardData.name}</div>
              <div
                className="text-sm font-semibold text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: getCardDescription(cardData, undefined, cooldownTurnsLeft) }}
              ></div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="flex md:w-[134px] md:h-[189px] w-[122px] h-[173px] text-primary-foreground rounded-xl data-[inactive=true]:grayscale-100"
      data-inactive={inactive}
    >
      <Tooltip delayDuration={0} disableHoverableContent>
        <TooltipTrigger>
          <ImageLoader
            className="flex md:w-[134px] md:h-[189px] w-[122px] h-[173px] rounded-xl overflow-hidden"
            src={cardData.picture}
            alt={cardData.name}
          />
        </TooltipTrigger>
        <TooltipContent
          className="max-w-[280px] bg-card/70 backdrop-blur-[1.5rem] p-3 rounded-xl"
          side="right"
          align="start"
          sideOffset={8}
        >
          <div className="text-[20px] font-semibold mb-2 leading-6">{cardData.name}</div>
          <div
            className="text-base font-semibold text-muted-foreground leading-[19px]"
            dangerouslySetInnerHTML={{ __html: getCardDescription(cardData, undefined, cooldownTurnsLeft) }}
          ></div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

function CardsTab({ player }: { player: PlayerDetails }) {
  const { bonus_cards: cards, building_upgrade_bonus: buildingBonus } = player;

  const availableCards = mainCardTypes.filter(type => cards.some(card => card.bonus_type === type));
  const unavailableCards = mainCardTypes.filter(type => !availableCards.includes(type));

  const showBuildingBonus = buildingBonus !== 0;
  const showMapBonus = player.maps_completed > 0;

  return (
    <div className="flex flex-col md:my-0 my-5 md:px-5">
      <div className="flex flex-wrap gap-y-2.5 gap-x-2 mb-[50px]">
        {player.game_difficulty_level !== 0 && (
          <GameDifficultyBonusCard difficulty={player.game_difficulty_level} />
        )}
        {showBuildingBonus && <BuildingBonusCard buildingBonus={buildingBonus} />}
        {showMapBonus && <MapScoreBonusCard mapsCompleted={player.maps_completed} />}
        {availableCards.map(type => {
          const card = player.bonus_cards.find(card => card.bonus_type === type);
          return (
            <GameCard
              key={type}
              type={type}
              cooldownTurnsLeft={card?.cooldown_turns_left}
            />
          );
        })}
      </div>

      {unavailableCards.length > 0 && (
        <>
          <p className="text-center text-xs font-roboto-wide-semibold text-muted-foreground mb-5">
            Не полученые
          </p>
          <div className="flex flex-wrap gap-y-2.5 gap-x-2">
            {unavailableCards.map(type => (
              <GameCard key={type} type={type} inactive />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default CardsTab;

function BuildingBonusCard({ buildingBonus }: { buildingBonus: number }) {
  return (
    <BonusCardComponent
      description="Автоматически увеличивает или уменьшает размер следующего здания"
      size="large"
      variant={buildingBonus === 0 ? 'neutral' : buildingBonus > 0 ? 'positive' : 'negative'}
      header={
        <span>
          Бонус
          <br />
          зданий
        </span>
      }
      tooltipHeader="Бонус зданий"
      value={
        <span className="text-4xl">{buildingBonus > 0 ? `+${buildingBonus}` : buildingBonus}</span>
      }
      image={BUILDING_BONUS_IMAGE}
    />
  );
}

function MapScoreBonusCard({ mapsCompleted }: { mapsCompleted: number }) {
  const mapBonus = mapsCompleted * SCORE_BONUS_PER_MAP_COMPLETION;
  const valueText = mapBonus > 0 ? `+${mapBonus}` : mapBonus.toString();

  return (
    <BonusCardComponent
      description="Автоматически добавляет бонус к каждой пройденной игре: 5 * круг"
      size="large"
      variant="positive"
      header={
        <span>
          Бонус
          <br />
          круга
        </span>
      }
      tooltipHeader={`Пройдено кругов: ${mapsCompleted}`}
      value={<span className="text-4xl">{valueText}</span>}
    />
  );
}

function GameDifficultyBonusCard({ difficulty }: { difficulty: GameDifficulty }) {
  let difficultyText = 'Средняя';
  let variant: 'neutral' | 'positive' | 'negative' = 'neutral';
  let difficultyImg = undefined;
  let description = '';

  if (difficulty === -1) {
    difficultyText = 'Легкая';
    variant = 'positive';
    difficultyImg = frontendInstantCardsData['decrease-difficulty'].picture;
    description = frontendInstantCardsData['decrease-difficulty'].description;
  } else if (difficulty === 1) {
    difficultyText = 'Сложная';
    variant = 'negative';
    difficultyImg = frontendInstantCardsData['increase-difficulty'].picture;
    description = frontendInstantCardsData['increase-difficulty'].description;
  }

  return (
    <BonusCardComponent
      description={description}
      size="large"
      variant={variant}
      header="Сложность игры"
      tooltipHeader={`Сложность игры: ${difficultyText}`}
      image={difficultyImg}
    />
  );
}
