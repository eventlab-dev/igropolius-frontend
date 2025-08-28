import {
  EventDescription,
  FrontendCardData,
  GameLengthRange,
  PlayerStateAction,
  SectorData,
  TaxData,
} from '@/lib/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { bonusCardsData, frontendCardsData, SectorsById } from './mockData';
import {
  FALLBACK_GAME_POSTER,
  ScoreByGameLength,
  SECTORS_COLOR_GROUPS,
  SectorScoreMultiplier,
  SEVENTV_EMOTE_BASE_URL,
} from './constants';
import usePlayerStore from '@/stores/playerStore';
import {
  BonusCardEvent,
  BonusCardType,
  Events,
  GameCompletionType,
  GameEvent,
  GameLength,
  MainBonusCardType,
  MoveEvent,
  PlayerDetails,
  PlayerTurnState,
  ScoreChangeEvent,
} from './api-types-generated';
import { canBuildOnSector } from '@/components/map/utils';
import useSystemStore from '@/stores/systemStore';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const months = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
];

export function eventTimeFormat(ts: number) {
  const date = new Date(ts * 1000);

  return {
    month: months[date.getMonth()],
    day: String(date.getDate()).padStart(2, '0'),
    hours: String(date.getHours()).padStart(2, '0'),
    minutes: String(date.getMinutes()).padStart(2, '0'),
  };
}

export function getShortestRotationDelta(current: number, target: number) {
  const delta = target - current;
  // Normalize to [-π, π] range to get shortest path
  return ((delta + Math.PI) % (2 * Math.PI)) - Math.PI;
}

export function getEventGameInfo(event: GameEvent) {
  let header = '';
  let subSectorId = null;
  switch (event.subtype) {
    case 'completed':
      header = 'Прошёл игру';
      subSectorId = event.sector_id === event.player_sector_id ? null : event.player_sector_id;
      break;
    case 'drop':
      header = 'Дроп игры';
      break;
    case 'reroll':
      header = 'Реролл игры';
      break;
    default: {
      const subtype: never = event.subtype;
      throw new Error(`Unsupported game event subtype: ${subtype}`);
    }
  }

  const { hours, minutes } = eventTimeFormat(event.timestamp);

  return {
    timeHeader: `${hours}:${minutes} — ${header}`,
    title: event.game_title,
    description: '',
    image: event.game_cover || FALLBACK_GAME_POSTER,
    sectorId: event.sector_id,
    subSectorId: subSectorId,
  } as EventDescription;
}

function getEventMoveInfo(event: MoveEvent) {
  let title = '';

  switch (event.subtype) {
    case 'train-ride':
      title = 'Проехал на поезде';
      break;
    case 'dice-roll':
      title = 'Ход на карте';
      break;
    case 'drop-to-prison':
      title = 'Попал в тюрьму';
      break;
    default: {
      const error: never = event.subtype;
      throw new Error(`Unsupported move event subtype: ${error}`);
    }
  }

  return {
    title,
    description: `с сектора #${event.sector_from} на #${event.sector_to}`,
  };
}

function getEventScoreChangeInfo(event: ScoreChangeEvent, player: PlayerDetails): EventDescription {
  let title = '';

  switch (event.subtype) {
    case 'street-tax':
      title = `Заплатил налог на секторе #${event.sector_id}`;
      break;
    case 'map-tax':
      title = 'Заплатил налог за круг';
      break;
    case 'game-completed':
      title = 'Получил очки за игру';
      break;
    case 'game-dropped':
      title = 'Потерял очки за дроп игры';
      break;
    case 'street-income': {
      const incomePlayer = usePlayerStore
        .getState()
        .players.find(p => p.id === event.income_from_player);
      title = `Получил доход с сектора ${event.sector_id} от ${incomePlayer?.username}`;
      break;
    }
    case 'instant-card': {
      const showCardOwner = player.id !== event.bonus_card_owner;
      const owner = usePlayerStore.getState().players.find(p => p.id === event.bonus_card_owner);

      let image = undefined;
      if (event.bonus_card) {
        const card = bonusCardsData[event.bonus_card];
        title = `Карточка "${card.name}"`;
        image = card.picture;
      } else {
        title = `Карточка "${event.bonus_card}"`;
      }

      if (showCardOwner) {
        title += ` (использовал ${owner?.username})`;
      }
      return {
        image,
        title,
        description: '',
        sectorId: event.sector_id,
        bonusType: event.bonus_card ?? undefined,
      };
    }
    default: {
      const subtype: never = event.subtype;
      throw new Error(`Unsupported score change event subtype: ${subtype}`);
    }
  }

  return {
    title,
    description: '',
    sectorId: event.sector_id,
  };
}

function getEventBonusCardInfo(event: BonusCardEvent) {
  let title = '';
  const players = usePlayerStore.getState().players;

  const cardName = bonusCardsData[event.bonus_type].name || 'Неизвестная карточка';

  switch (event.subtype) {
    case 'received':
      title = `Получил "${cardName}"`;
      break;
    case 'used':
      title = `Использовал "${cardName}"`;
      break;
    case 'dropped':
      title = `Потерял "${cardName}"`;
      break;
    case 'stolen-from-me': {
      const player = players.find(p => p.id === event.stolen_by);
      title = `${player?.username} украл "${cardName}"`;
      break;
    }
    case 'stolen-by-me': {
      const player = players.find(p => p.id === event.stolen_from_player);
      title = `Карточка украдена у ${player?.username}`;
      break;
    }
    default: {
      const subtype: never = event.subtype;
      throw new Error(`Unsupported bonus card event subtype: ${subtype}`);
    }
  }

  const card = bonusCardsData[event.bonus_type];

  return {
    title,
    description: card.name,
    image: card?.picture || '',
    sectorId: event.sector_id,
    bonusType: event.bonus_type,
  } as EventDescription;
}

export function getBonusCardName(bonusType: MainBonusCardType): string {
  const data = frontendCardsData[bonusType];
  return data.name;
}

export function getEventDescription(event: Events[0], player: PlayerDetails): EventDescription {
  const eventType = event.event_type;
  switch (eventType) {
    case 'game':
      return getEventGameInfo(event);
    case 'bonus-card':
      return getEventBonusCardInfo(event);
    case 'player-move':
      return getEventMoveInfo(event);
    case 'score-change':
      return getEventScoreChangeInfo(event, player);
    default: {
      const error: never = eventType;
      throw new Error(`Unsupported event type: ${error}`);
    }
  }
}

type NextTurnStateParams = {
  player: PlayerDetails;
  currentState: PlayerTurnState;
  mapCompleted: boolean;
  action?: PlayerStateAction;
  // sectorFromId?: number;
  sectorToId?: number;
};

export function getNextTurnState({
  player,
  currentState,
  mapCompleted,
  action,
  sectorToId,
}: NextTurnStateParams): PlayerTurnState {
  const sectorFrom = SectorsById[player.sector_id];
  const sectorTo = sectorToId ? SectorsById[sectorToId] : sectorFrom;

  const bonusCardsSet = new Set(player.bonus_cards.map(card => card.bonus_type));

  console.log('current cards', bonusCardsSet);

  const statesToStop: PlayerTurnState[] = [
    'rolling-dice',
    'using-dice-bonuses',
    'rolling-bonus-card',
    'filling-game-review',
    'entering-prison',
    'dropping-card-after-game-drop',
    'dropping-card-after-instant-roll',
    'dropping-card-after-police-search',
    'stealing-bonus-card',
    'choosing-building-sector',
  ];

  let maxIterations = 10;
  let state = currentState;
  let currentAction = action;
  console.log('current state:', currentState, action);
  while (maxIterations--) {
    const iteration = getNextState({
      currentState: state,
      sectorFrom,
      sectorTo,
      mapCompleted,
      bonusCardsSet,
      action: currentAction,
    });
    currentAction = undefined; // Reset action after first iteration
    console.log('next state:', iteration, currentAction);
    if (iteration === 'stop') {
      return state; // No further state change, return current state
    }
    if (statesToStop.includes(iteration)) {
      return iteration;
    }
    state = iteration; // Update state for next iteration
  }
  throw new Error('Infinite loop detected in getNextTurnState');
}

type GetNextStateParams = {
  currentState: PlayerTurnState;
  action?: PlayerStateAction;
  sectorFrom: SectorData;
  sectorTo: SectorData;
  mapCompleted?: boolean;
  bonusCardsSet: Set<BonusCardType>;
};

type StateCycle = 'stop' | PlayerTurnState;

function getNextState({
  currentState,
  action,
  sectorFrom,
  sectorTo,
  mapCompleted,
  bonusCardsSet,
}: GetNextStateParams): StateCycle {
  const hasStreetTaxCard = bonusCardsSet.has('evade-street-tax');
  const hasMapTaxCard = bonusCardsSet.has('evade-map-tax');
  const hasPrisonCard = bonusCardsSet.has('skip-prison-day');
  const hasDiceCards = bonusCardsSet.has('adjust-roll-by1') || bonusCardsSet.has('choose-1-die');

  const skipBonus = action === 'skip-bonus';

  switch (currentState) {
    case 'rolling-dice':
      return 'using-dice-bonuses';
    case 'using-dice-bonuses':
      if (hasDiceCards && !skipBonus) {
        return 'stop';
      }
      if (sectorFrom.type === 'railroad' && !skipBonus) {
        return 'stop';
      }
      return 'using-map-tax-bonuses';
    case 'using-map-tax-bonuses':
      if (mapCompleted && hasMapTaxCard && !skipBonus) {
        return 'stop';
      }
      return 'using-street-tax-bonuses';
    case 'using-street-tax-bonuses':
      if (canBuildOnSector(sectorTo.type) && hasStreetTaxCard && !skipBonus) {
        return 'stop';
      }
      if (sectorTo.type === 'prison') {
        return 'entering-prison';
      }
      return 'filling-game-review';
    case 'using-prison-bonuses':
      if (sectorTo.type === 'prison' && hasPrisonCard && !skipBonus) {
        if (action === 'skip-prison') {
          return 'rolling-dice';
        }
        return 'stop';
      }
      return 'filling-game-review';
    case 'filling-game-review':
      if (action === 'drop-game') {
        return 'dropping-card-after-game-drop';
      }
      if (action === 'reroll-game') {
        return 'filling-game-review';
      }
      if (action === 'drop-from-lose-card') {
        return 'dropping-card-after-instant-roll';
      }
      if (action === 'drop-from-police-search') {
        return 'dropping-card-after-police-search';
      }
      switch (sectorFrom.type) {
        case 'bonus':
          return 'rolling-bonus-card';
        case 'parking':
          return 'stealing-bonus-card';
        case 'railroad':
          return 'rolling-dice';
        case 'property':
          return 'rolling-dice';
        case 'prison':
          return 'rolling-dice';
        case 'start-corner':
          return 'choosing-building-sector';
        default: {
          const sectorType: never = sectorFrom.type;
          throw new Error(`Unsupported sector type: ${sectorType}`);
        }
      }
    case 'rolling-bonus-card':
      return 'rolling-dice';
    case 'dropping-card-after-game-drop':
      if (sectorFrom.type === 'prison') {
        // if already in prison don't do enter state
        return 'using-prison-bonuses';
      }
      return 'entering-prison';
    case 'entering-prison':
      return 'using-prison-bonuses';
    case 'stealing-bonus-card':
      return 'rolling-dice';
    case 'dropping-card-after-instant-roll':
      return 'filling-game-review';
    case 'dropping-card-after-police-search':
      return 'filling-game-review';
    case 'choosing-building-sector':
      return 'rolling-dice';
    default: {
      const state: never = currentState;
      throw new Error(`Unsupported turn state: ${state}`);
    }
  }
}

export function formatTsToFullDate(ts: number) {
  return new Date(ts * 1000).toLocaleString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTsToMonthDatetime(ts: number) {
  return new Date(ts * 1000).toLocaleString('ru-RU', {
    month: 'long',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTsToMonthDatetimeWithMSK(ts: number) {
  const date = new Date(ts * 1000);

  const localTime = date.toLocaleString('ru-RU', {
    month: 'long',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  const localOffset = -date.getTimezoneOffset() / 60;
  const mskOffset = 3;

  if (localOffset !== mskOffset) {
    const mskTime = date.toLocaleString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Moscow',
    });
    return `${localTime} (по MSK ${mskTime})`;
  }

  return localTime;
}

export function formatMs(diffMs: number) {
  const diffS = Math.floor(diffMs / 1000);
  const days = Math.floor(diffS / (60 * 60 * 24));
  const hours = Math.floor((diffS % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((diffS % (60 * 60)) / 60);
  const seconds = diffS % 60;

  // const hoursPadded = String(hours).padStart(2, '0');
  // const minutesPadded = String(minutes).padStart(2, '0');
  // const secondsPadded = String(seconds).padStart(2, '0');

  if (days > 0) {
    if (hours === 0) {
      return `${days}д ${minutes}м`;
    }
    return `${days}д ${hours}ч ${minutes}м`;
  }

  if (hours === 0) {
    return `${minutes}м ${seconds}с`;
  }

  return `${hours}ч ${minutes}м`;
}

export function formatMsToHoursMins(diffMs: number) {
  const diffS = Math.floor(diffMs / 1000);
  const hours = Math.floor(diffS / (60 * 60));
  const minutes = Math.floor((diffS % (60 * 60)) / 60);

  if (hours === 0) {
    return `${minutes}м`;
  }

  return `${hours}ч ${minutes}м`;
}

export function formatHltbLength(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours === 0) {
    return `${minutes}м`;
  }

  return `${hours}ч ${minutes}м`;
}

type CompletionScoreParams = {
  gameStatus: GameCompletionType;
  gameLength: GameLength | null;
  mapsCompleted: number;
  sectorId: number;
};

export function calculateGameCompletionScore({
  gameStatus,
  gameLength,
  mapsCompleted,
  sectorId,
}: CompletionScoreParams) {
  const mapCompletionBonus = mapsCompleted * 5;

  const sector = SectorsById[sectorId];
  const sectorMultiplier = SectorScoreMultiplier[sector.type] || 1;

  if (gameStatus === 'completed' && gameLength) {
    const base = ScoreByGameLength[gameLength];
    const total = base * sectorMultiplier + mapCompletionBonus;
    return {
      base,
      sectorMultiplier,
      total,
      mapCompletionBonus,
    };
  }
  if (gameStatus === 'drop') {
    return {
      base: 0,
      total: 0,
      sectorMultiplier,
      mapCompletionBonus,
    };
  }
  return {
    base: 0,
    sectorMultiplier: 0,
    total: 0,
    mapCompletionBonus,
  };
}

export function getGameLengthShortText(gameLengthRanges: GameLengthRange | undefined): string {
  if (!gameLengthRanges) return '';

  if (gameLengthRanges.min && gameLengthRanges.max) {
    return `${gameLengthRanges.min}-${gameLengthRanges.max}ч`;
  } else if (gameLengthRanges.min) {
    return `от ${gameLengthRanges.min}ч`;
  } else if (gameLengthRanges.max) {
    return `до ${gameLengthRanges.max}ч`;
  }
  return '';
}

export function getGameLengthFullText(gameLengthRanges: GameLengthRange | undefined): string {
  if (!gameLengthRanges) return 'без ограничений';

  if (gameLengthRanges.min && gameLengthRanges.max) {
    return `${gameLengthRanges.min} - ${gameLengthRanges.max} часов`;
  } else if (gameLengthRanges.min) {
    return `от ${gameLengthRanges.min} часов`;
  } else if (gameLengthRanges.max) {
    return `до ${gameLengthRanges.max} часов`;
  }
  return 'без ограничений';
}

export function playerOwnsSectorsGroup(games: PlayerDetails['games'], group: number[]) {
  return group.every(sectorId =>
    games.find(game => game.sector_id === sectorId && game.status === 'completed')
  );
}

export function getSectorsGroup(sectorId: number): number[] | null {
  for (const group of SECTORS_COLOR_GROUPS) {
    if (group.includes(sectorId)) {
      return group;
    }
  }
  return null;
}

export function getClosestPrison(sectorId: number): number {
  const prisonSectors = [11, 31];
  return prisonSectors.reduce(
    (prev, curr) => (Math.abs(curr - sectorId) < Math.abs(prev - sectorId) ? curr : prev),
    prisonSectors[0]
  );
}

export function wasLastMoveDropToPrison(player: PlayerDetails): boolean {
  const sorted = [...player.games].sort((a, b) => b.created_at - a.created_at);
  const last = sorted[0];
  if (!last) {
    return false;
  }
  return last.status === 'drop';
}

export function extract7tvEmoteId(emoteUrl: string): string | null {
  const match = emoteUrl.match(/\/emote\/([^/]+)\//);
  return match ? match[1] : null;
}

export function create7tvEmoteUrl(emoteId: string): string {
  return `${SEVENTV_EMOTE_BASE_URL}/${emoteId}/2x.webp`;
}

export function getCardDescription(
  card: FrontendCardData,
  scoreMultiplier?: number | null,
  cooldownTurnsLeft?: number
): string {
  if (!scoreMultiplier) {
    scoreMultiplier = useSystemStore.getState().instantCardScoreMultiplier;
  }

  let description = card.description.replaceAll('{X}', String(scoreMultiplier));

  if (cooldownTurnsLeft && cooldownTurnsLeft > 0) {
    description += ` <span class="mt-2 text-sm font-bold text-red-400">(Кулдаун: ${getTurnsNoun(cooldownTurnsLeft)})</span>`;
  }

  return esliFix(description);
}

export function getTaxCalculationText(taxInfo: TaxData, myPlayerId?: number): string {
  const otherPlayersOnSector = Object.entries(taxInfo.playerIncomes).filter(
    ([playerId]) => Number(playerId) !== myPlayerId
  );

  const myIncome = Object.entries(taxInfo.playerIncomes).find(
    ([playerId]) => Number(playerId) === myPlayerId
  );

  const taxSum = otherPlayersOnSector.map(([_playerId, amount]) => amount / 2).join(' + ');
  if (myIncome) {
    const myAmount = myIncome[1];
    if (taxSum === '') {
      return `-${myAmount}`;
    }
    return [taxSum, myAmount].join(' - ');
  }
  return taxSum;
}

export function splitTaxInfo(
  info: TaxData,
  myPlayerId?: number
): {
  myIncome?: number;
  otherIncomes: Record<string, number>;
} {
  const otherPlayersOnSector = Object.entries(info.playerIncomes).filter(
    ([playerId]) => Number(playerId) !== myPlayerId
  );

  const myIncome = Object.entries(info.playerIncomes).find(
    ([playerId]) => Number(playerId) === myPlayerId
  );

  return {
    otherIncomes: Object.fromEntries(otherPlayersOnSector),
    myIncome: myIncome ? myIncome[1] : undefined,
  };
}

export function getSectorDescription(sector: SectorData): string {
  switch (sector.type) {
    case 'property':
      return `За прохождение игры на этом секторе строится здание`;
    case 'railroad':
      return `За прохождение игры на этом секторе строится здание и можно поехать на поезде`;
    case 'bonus':
      return `За прохождение игры на этом секторе ролится бонусная карточка, дается x1.5 очков и +2 к бонусу здания`;
    case 'parking':
      return `За прохождение игры на этом секторе можно украсть карточку у другого игрока, дается x1.5 очков и +2 к бонусу здания`;
    case 'prison':
      return `Попадая на этот сектор игрок может потерять карточку или получить из хранилища тюрьмы.`;
    case 'start-corner':
      return `За прохождение игры на этом секторе строится здание на любом выбранном секторе, дается x1.5 очков и +1 к бонусу здания.`;
    default: {
      const type: never = sector.type;
      throw new Error(`Unsupported sector type: ${type}`);
    }
  }
}

export function adjustGameLength(len: GameLength, update: number): GameLength {
  if (len === '') {
    return '';
  }

  if (update === 0) {
    return len;
  }

  const gameLengths = Object.keys(ScoreByGameLength) as GameLength[];
  const currentIndex = gameLengths.indexOf(len);

  if (currentIndex === -1) {
    throw new Error(`Game length not found: ${len}, ${update}`);
  }

  const newIndex = currentIndex + update;
  if (newIndex < 0 || newIndex >= gameLengths.length) {
    throw new Error(`Game length index out of bounds: ${len}, ${newIndex}`);
  }
  return gameLengths[newIndex];
}

export function esliFix(input: string): string {
  const esliUpdate = useSystemStore.getState().myUser?.username.toLowerCase() === 'maddyson';
  if (esliUpdate) {
    return input.replaceAll('если', 'эсли').replaceAll('Если', 'Эсли');
  }
  return input;
}

export function getNoun(num: number, words: string[]) {
  const lastTwoDigits = Math.abs(num) % 100;
  const lastDigit = lastTwoDigits % 10;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return `${num} ${words[2]}`;
  } else if (lastDigit === 1) {
    return `${num} ${words[0]}`;
  } else if (lastDigit >= 2 && lastDigit <= 4) {
    return `${num} ${words[1]}`;
  } else {
    return `${num} ${words[2]}`;
  }
}

export function getTurnsNoun(num: number) {
  return getNoun(num, ['ход', 'хода', 'ходов']);
}

export function createPortionsRounded(amount: number, min: number, max: number) {
  if (amount <= 1) throw new Error('Amount must be greater than 1');

  const result: number[] = [];
  const step = (max - min) / (amount - 1);

  for (let i = 0; i < amount; i++) {
    result.push(Math.floor(min + step * i));
  }

  console.log('function');
  return result;
}
