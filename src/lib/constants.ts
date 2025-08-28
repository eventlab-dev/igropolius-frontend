import { BuildingType, GameRollType, SectorData, TrainData } from '@/lib/types';
import { Color } from 'three';
import { GameLength } from './api-types-generated';

export enum Controls {
  forward = 'forward',
  backward = 'backward',
  left = 'left',
  right = 'right',
  up = 'up',
  down = 'down',
  turnLeft = 'turnLeft',
  turnRight = 'turnRight',
}

export const SECTORS_PER_SIDE = 9;

export const SECTOR_WIDTH = 8;
export const SECTOR_HEIGHT = 1;
export const SECTOR_DEPTH = 18;

export const BOARD_SIZE = SECTORS_PER_SIDE * SECTOR_WIDTH;
export const HALF_BOARD = (SECTORS_PER_SIDE * SECTOR_WIDTH) / 2 + SECTOR_WIDTH / 2;

export const SECTOR_CONTENT_ELEVATION = SECTOR_HEIGHT / 2;

export const PLAYER_WIDTH = 2;
export const PLAYER_HEIGHT = 1;
export const PLAYER_DEPTH = 1.25;
export const PLAYER_ELEVATION = SECTOR_HEIGHT / 2;

export const EMISSION_FULL = new Color('white');
export const EMISSION_NONE = new Color('black');

export const GameLengthToBuildingType: { [key in GameLength]: BuildingType } = {
  '': 'ruins',
  '2-5': 'small_buildingD',
  '5-10': 'skyscraperE',
  '10-15': 'skyscraperA',
  '15-20': 'skyscraperB',
  '20-25': 'skyscraperD',
  '25+': 'skyscraperX',
};

export const TrainsConfig: Record<number, TrainData> = {
  6: {
    sectorFrom: 6,
    sectorTo: 16,
  },
  16: {
    sectorFrom: 16,
    sectorTo: 26,
  },
  26: {
    sectorFrom: 26,
    sectorTo: 36,
  },
  36: {
    sectorFrom: 36,
    sectorTo: 6,
  },
};

export const MOCK_DICE_ROLL: [number, number] = [3, 5];
export const IS_DEV = import.meta.env.MODE === 'development';
export const NO_MOCKS = Boolean(import.meta.env.VITE_NO_MOCKS);

export const STORAGE_BASE_URL = IS_DEV ? `/monopoly_s3/assets` : `/models_assets`;

export const ScoreByGameLength: { [key in GameLength]: number } = {
  '': 0,
  '2-5': 10,
  '5-10': 20,
  '10-15': 30,
  '15-20': 40,
  '20-25': 50,
  '25+': 60,
};

export const IncomeScoreMultiplier = 0.5;
export const IncomeScoreGroupOwnerMultiplier = 1;
export const TaxScoreMultiplier = 0.5;
export const MapTaxPercent = 0.1; // 10%
export const MinMapTax = 10;

export const SectorScoreMultiplier: { [key in SectorData['type']]: number } = {
  'start-corner': 1.5,
  parking: 1.5,
  bonus: 1.5,
  prison: 1,
  property: 1,
  railroad: 1,
};

export const FALLBACK_GAME_POSTER =
  'https://www.igdb.com/assets/no_cover_show-ef1e36c00e101c2fb23d15bb80edd9667bbf604a12fc0267a66033afea320c65.png';

export const FALLBACK_AVATAR_URL = 'https://github.com/shadcn.png';

export const PlayerModelsUrls: Record<string, string> = {
  praden: `${STORAGE_BASE_URL}/models/players/cars/van1.glb`,
  'player-2': `${STORAGE_BASE_URL}/models/players/cars/garbage-truck1.glb`,
  'player-3': `${STORAGE_BASE_URL}/models/players/cars/delivery-flat2.glb`,
  'player-4': `${STORAGE_BASE_URL}/models/players/boats/boat-speed-d.glb`,
  'player-5': `${STORAGE_BASE_URL}/models/players/boats/boat-tow-a.glb`,
  'player-6': `${STORAGE_BASE_URL}/models/players/trains/train-diesel-a.glb`,
  'player-7': `${STORAGE_BASE_URL}/models/players/trains/train-locomotive-a.glb`,
  'player-8': `${STORAGE_BASE_URL}/models/players/trains/train-tram-modern.glb`,
};

export const PlayerModelsUrlsArray = [
  `${STORAGE_BASE_URL}/models/players/cars/van1.glb`,
  `${STORAGE_BASE_URL}/models/players/cars/garbage-truck1.glb`,
  `${STORAGE_BASE_URL}/models/players/cars/delivery-flat2.glb`,
  // `${STORAGE_BASE_URL}/models/players/cars/delivery2.glb`,
  `${STORAGE_BASE_URL}/models/players/cars/race-future1.glb`,
  `${STORAGE_BASE_URL}/models/players/cars/sedan-sports2.glb`,
  `${STORAGE_BASE_URL}/models/players/cars/tractor2.glb`,
  `${STORAGE_BASE_URL}/models/players/cars/truck1.glb`,

  `${STORAGE_BASE_URL}/models/players/boats/boat-speed-d.glb`,
  `${STORAGE_BASE_URL}/models/players/boats/boat-tow-a.glb`,
  `${STORAGE_BASE_URL}/models/players/boats/boat-fishing-small.glb`,
  `${STORAGE_BASE_URL}/models/players/boats/boat-sail-b.glb`,

  `${STORAGE_BASE_URL}/models/players/trains/train-diesel-a.glb`,
  `${STORAGE_BASE_URL}/models/players/trains/train-locomotive-a.glb`,
  `${STORAGE_BASE_URL}/models/players/trains/train-tram-modern.glb`,
];

export const PlayerModelsScales: Record<string, number> = {
  [`${STORAGE_BASE_URL}/models/players/boats/boat-tow-a.glb`]: 0.5,
  [`${STORAGE_BASE_URL}/models/players/boats/boat-sail-b.glb`]: 0.7,
  [`${STORAGE_BASE_URL}/models/players/boats/boat-speed-d.glb`]: 0.7,
  [`${STORAGE_BASE_URL}/models/players/boats/boat-fishing-small.glb`]: 0.7,
  [`${STORAGE_BASE_URL}/models/players/trains/train-tram-modern.glb`]: 0.9,
  [`${STORAGE_BASE_URL}/models/players/cars/garbage-truck1.glb`]: 0.8,
  [`${STORAGE_BASE_URL}/models/players/cars/delivery-flat2.glb`]: 0.9,
  [`${STORAGE_BASE_URL}/models/players/cars/van1.glb`]: 0.9,
};

export const EMOTES_SEARCH_API_URL = 'https://api4.rhhhhhhh.live/search_emotes';
export const SEVENTV_EMOTE_BASE_URL = 'https://starege.rhhhhhhh.live/https://cdn.7tv.app/emote';

export const SECTORS_COLOR_GROUPS: number[][] = [
  [2, 4, 5],
  [7, 9, 10],
  [12, 14, 15],
  [17, 19, 20],
  [22, 24, 25],
  [27, 28, 30],
  [32, 33, 35],
  [37, 38, 40],
  Object.keys(TrainsConfig).map(Number),
];

export const PRISON_NOTHING_CARD_IMAGE = `${import.meta.env.BASE_URL}assets/cards/prison-nothing.png`;
export const BUILDING_BONUS_IMAGE = `${import.meta.env.BASE_URL}assets/cards/building-bonus.png`;

export const DRUM_SOUND_URL = `${import.meta.env.BASE_URL}assets/sounds/baraban.mp3`;
export const INDIAN_ROLL_URL = `${import.meta.env.BASE_URL}assets/sounds/indian-roll.mp3`;
export const ARMY_SOUND_URL = `${import.meta.env.BASE_URL}assets/sounds/army-roll.mp3`;
export const MAX_SOUND_URL = `${import.meta.env.BASE_URL}assets/sounds/max-roll2.mp3`;
export const DASBOOT_SOUND_URL = `${import.meta.env.BASE_URL}assets/sounds/dasboot-roll.mp3`;
export const DVAR_SOUND_URL = `${import.meta.env.BASE_URL}assets/sounds/dvar-roll.mp3`;

export const GameRollTypeNames: Record<GameRollType, string> = {
  auc: 'аукцион',
  steam: 'пресет из стима',
};

export const GameRollTypeShortName: Record<GameRollType, string> = {
  auc: 'Аук',
  steam: 'Стим',
};

export const SCORE_BONUS_PER_MAP_COMPLETION = 5;

export const GameLengthDisplay: Record<GameLength, string> = {
  '': 'дроп',
  '2-5': '2-5',
  '5-10': '6-10',
  '10-15': '11-15',
  '15-20': '16-20',
  '20-25': '21-25',
  '25+': '26+',
};

export const VideoLinks: Record<string, string> = {
  praden: '',
  krabick: '',
  maddyson: '',
  lasqa: '',
  f1ashko: '',
  roadhouse: '',
  browjey: '',
  sgtgrafoyni: '',
  melharucos: '',
  segall: '',
};
