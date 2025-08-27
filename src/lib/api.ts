import { playersData, mockHltbGamesList } from './mockData';
import { IS_DEV, MOCK_DICE_ROLL, NO_MOCKS, EMOTES_SEARCH_API_URL } from './constants';
import {
  CreateMessageNotificationRequest,
  CurrentUserResponse,
  DropBonusCardRequest,
  EditPlayerGame,
  EventSettingsResponse,
  FinalStatsResponse,
  GameDurationRequest,
  GameDurationResponse,
  GiveBonusCardRequest,
  GiveBonusCardResponse,
  HltbGamesListResponse,
  HltbRandomGameRequest,
  IgdbGamesListResponse,
  IgdbGameSummary,
  LoginRequest,
  LoginResponse,
  MarkNotificationsSeenRequest,
  MovePlayerGameRequest,
  NewRulesVersionRequest,
  NotificationsResponse,
  PayTaxRequest,
  PlayerEventsResponse,
  PlayerListResponse,
  PlayerMoveRequest,
  PlayerMoveResponse,
  PlayerStatsResponse,
  RollDiceResponse,
  RulesResponse,
  SavePlayerGameRequest,
  SavePlayerGameResponse,
  StealBonusCardRequest,
  UpdatePlayerInternalRequest,
  UpdatePlayerRequest,
  UpdatePlayerTurnStateRequest,
  UseBonusCardRequest,
  UseInstantCardRequest,
  UseInstantCardResponse,
} from './api-types-generated';
import useSystemStore from '@/stores/systemStore';

const MOCK_API = NO_MOCKS ? false : IS_DEV;

const API_HOST = IS_DEV ? 'http://localhost:8000' : 'https://igropolius.ru';

export function showApiError(
  endpoint: string,
  status: number,
  body?: { detail?: string; message?: string },
  requestBody?: unknown
) {
  if (status === 401) {
    return;
  }

  const systemStore = useSystemStore.getState();
  const errorMessage = body?.detail || body?.message || JSON.stringify(body);
  let notificationText = `Ошибка ${status} в ${endpoint}: ${errorMessage}`;

  if (requestBody) {
    const requestBodyStr =
      typeof requestBody === 'string' ? requestBody : JSON.stringify(requestBody);
    notificationText += `\nЗапрос: ${requestBodyStr.slice(0, 300)}`;
  }

  systemStore.setMainNotification({
    text: notificationText,
    tag: 'api-error',
    variant: 'error',
  });

  setTimeout(() => {
    const currentNotification = systemStore.mainNotification;
    if (currentNotification?.tag === 'api-error') {
      systemStore.setMainNotification(null);
    }
  }, 10000);
}

async function apiRequest(endpoint: string, params: RequestInit = {}): Promise<Response> {
  let actingUserId = null;
  if (!endpoint.includes('/api/login') && !endpoint.includes('/api/internal')) {
    actingUserId = useSystemStore.getState().actingUserId;
  }

  const token = localStorage.getItem('access-token');
  const response = await fetch(`${API_HOST}${endpoint}`, {
    ...params,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(actingUserId ? { 'X-Acting-User-Id': String(actingUserId) } : {}),
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Неизвестная ошибка' }));
    console.error('API request failed:', {
      endpoint,
      status: response.status,
      error: errorData,
      requestBody: params.body,
    });

    if (
      (response.status === 401 || response.status === 403) &&
      endpoint.includes('/api/players/current')
    ) {
      localStorage.removeItem('access-token');
      return Promise.reject({ body: errorData, status: response.status });
    }

    showApiError(endpoint, response.status, errorData, params.body);
    return Promise.reject({ body: errorData, status: response.status });
  }
  return response;
}

export async function fetchPlayerEvents(playerId: number): Promise<PlayerEventsResponse> {
  if (MOCK_API) {
    return Promise.resolve({
      events: [
        {
          timestamp: 1754087023,
          event_type: 'score-change',
          subtype: 'instant-card',
          amount: -0.52,
          reason: 'Leader lost 1% from instant card',
          sector_id: 17,
          score_before: 52.0,
          score_after: 51.48,
          income_from_player: null,
          bonus_card: 'leaders-lose-percents',
          bonus_card_owner: 3,
        },
        {
          event_type: 'game',
          timestamp: 1750661642,
          subtype: 'completed',
          game_title: 'Witcher 5',
          game_cover: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.webp',
          game_review: 'good',
          game_score: 9.5,
          sector_id: 10,
          duration: 200,
          bonuses_used: ['reroll-game', 'game-help-allowed'],
          player_sector_id: 1,
        },
        {
          event_type: 'game',
          timestamp: Math.floor(new Date('04 30 2025 18:20').getTime() / 1000),
          subtype: 'completed',
          game_title: 'Witcher 5',
          game_cover: null,
          game_review: 'good',
          game_score: 9.5,
          sector_id: 10,
          duration: 200,
          bonuses_used: ['reroll-game', 'game-help-allowed'],
          player_sector_id: 10,
        },
        {
          event_type: 'game',
          timestamp: Math.floor(new Date('04 30 2025 18:19').getTime() / 1000),
          subtype: 'completed',
          game_title: 'Witcher 5',
          game_cover: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.webp',
          game_review: 'good',
          game_score: 9.5,
          sector_id: 10,
          duration: 200,
          player_sector_id: 10,
        },
        {
          event_type: 'player-move',
          timestamp: Math.floor(new Date('04 30 2025 17:40').getTime() / 1000),
          adjusted_roll: 4,
          subtype: 'dice-roll',
          sector_from: 10,
          sector_to: 14,
          map_completed: false,
          bonuses_used: ['adjust-roll-by1', 'choose-1-die'],
          dice_roll: [3, 7],
          dice_roll_json: {
            is_random_org_result: true,
            data: [3, 7],
            random_org_check_form:
              'https://api.random.org/signatures/form?format=json&random=eyJtZXRob2QiOiJnZW5lcmF0ZVNpZ25lZEludGVnZXJzIiwiaGFzaGVkQXBpS2V5Ijoib2Y0T1c3MXQ3alFnNXZJb0pFdFBPUmVPNTA4UFNzZnpNL0x2ZlZwTmFIUDFCNjJ4NzgyWFBxR3ZLV0ZiTXhwYlRqcUNHbENEUS9oVldzRmFFT3Y3RFE9PSIsIm4iOjIsIm1pbiI6MSwibWF4Ijo4LCJyZXBsYWNlbWVudCI6dHJ1ZSwiYmFzZSI6MTAsInByZWdlbmVyYXRlZFJhbmRvbWl6YXRpb24iOnsiaWQiOiJwbGF5ZXJfaWQ9MSZ0aW1lc3RhbXA9MTc1MDY2MDc4MSJ9LCJkYXRhIjpbMyw3XSwibGljZW5zZSI6eyJ0eXBlIjoiZGV2ZWxvcGVyIiwidGV4dCI6IlJhbmRvbSB2YWx1ZXMgbGljZW5zZWQgc3RyaWN0bHkgZm9yIGRldmVsb3BtZW50IGFuZCB0ZXN0aW5nIG9ubHkiLCJpbmZvVXJsIjpudWxsfSwibGljZW5zZURhdGEiOm51bGwsInVzZXJEYXRhIjpudWxsLCJ0aWNrZXREYXRhIjpudWxsLCJjb21wbGV0aW9uVGltZSI6IjIwMjUtMDYtMjMgMDY6NDA6NTFaIiwic2VyaWFsTnVtYmVyIjo3NH0%3D&signature=WPlkelEz7Yx9WUneqcaO0MzFmkuA%2ByTlhMrZFPuIaxZ8UK%2Fv%2BxWP%2FLtCR3P5fCapAtwaHfccYKLsT%2B1k4blg4AhLfxbt7RrUTshDf%2ByTUuBXsOrVoO1jjmbLg43cikwMHcyhJIyT2bMGknvPGfb9B6YCDwoWvV1R8V2v8fU9WPXf5rsfdhT1E30LrPWbnzKMjaOgBHSHFTRokoOObh4AgYiAnCkxcZhaBZKMkqFp4r%2BmCheYf977CkgCfXBsepVlWXrZFEosgnJHVGdCxEYyhaPMl2GTetD07CnAK69SqILvMnUJ5ooOG0gz0cvzW5ZQzLtiYmFyPhneAahWIeQ1g9MdAh%2Fit4YA%2Bm6vLeVeYFyShSFq7%2B2jznv0UL77S7sCWFR0fi0qMuUr7JtfgENWOYSHO813qnsjfl0eqyPe9XxTg4e7CifE5ZOoet7pjKrj3VfPPKa%2BAMw89y5HKHXdjGqIrzdtVaM%2B7ZRdGhBwIRyrSwhXy8XTo%2BaOYdz8rLsdN35Bdf2LxSHJexbhrYD5QyMRUgmYWjvwzau3oMczmRR5wbJyJR67vmUedPxpEOlfScJzMqWc8de4pMV1llEtKjzjg9%2Fbd%2BQTtk%2F%2BGkIMQdEO0aJiblkJw1T8CiHd9pe3ep%2FH9e9uC4ou54UtR9T4ssXg6wrc9I90RNI5D%2BnHDKk%3D',
          },
        },
        {
          event_type: 'player-move',
          timestamp: Math.floor(new Date('04 30 2025 17:40').getTime() / 1000),
          adjusted_roll: 4,
          subtype: 'dice-roll',
          sector_from: 10,
          sector_to: 14,
          bonuses_used: ['adjust-roll-by1', 'choose-1-die'],
          dice_roll_json: {
            is_random_org_result: false,
            random_org_check_form: null,
            data: [3, 7],
            random_org_fail_reason: 'test',
          },
          dice_roll: [3, 7],
          map_completed: false,
        },
        {
          event_type: 'score-change',
          timestamp: Math.floor(new Date('04 29 2025 07:07').getTime() / 1000),
          subtype: 'street-tax',
          sector_id: 15,
          amount: -20,
          tax_player_id: 2,
          bonuses_used: ['evade-street-tax'],
          score_before: 100,
          score_after: 80,
          reason: 'Уклонение от налога на улицу',
        },
        {
          event_type: 'score-change',
          timestamp: Math.floor(new Date('04 29 2025 02:54').getTime() / 1000),
          subtype: 'map-tax',
          sector_id: 15,
          amount: 100,
          score_before: 80,
          score_after: 180,
          reason: 'Уплата налога на карту',
        },
        {
          event_type: 'score-change',
          timestamp: Math.floor(new Date('04 28 2025 11:23').getTime() / 1000),
          subtype: 'street-tax',
          sector_id: 7,
          amount: 50,
          tax_player_id: 3,
          score_before: 180,
          score_after: 230,
          reason: 'Уплата налога на улицу',
        },
      ],
    });
  }
  const response = await apiRequest(`/api/players/${playerId}/events`);
  return response.json();
}

export async function fetchCurrentPlayer(): Promise<CurrentUserResponse> {
  if (MOCK_API) {
    return Promise.resolve({
      id: 1,
      username: 'Praden',
      turn_state: 'rolling-dice',
      role: 'admin',
      last_roll_result: MOCK_DICE_ROLL,
    });
  }
  const response = await apiRequest('/api/players/current');
  return response.json();
}

export async function fetchPlayers(): Promise<PlayerListResponse> {
  if (MOCK_API) {
    return Promise.resolve({
      players: playersData,
      prison_cards: [],
    });
  }
  const response = await apiRequest('/api/players');
  return response.json();
}

export async function fetchCurrentRules(): Promise<RulesResponse> {
  if (MOCK_API) {
    return Promise.resolve({
      versions: [
        {
          content: JSON.stringify({
            ops: [
              { insert: 'Третья версия правил' },
              { insert: '\n' },
              { insert: 'Читы и подсказки запрещены' },
            ],
          }),
          created_at: Math.ceil(new Date('2025-04-30').getTime() / 1000),
          category: 'general',
        },
        {
          content: JSON.stringify({
            ops: [{ insert: 'Правила прохождения игр' }],
          }),
          created_at: Math.ceil(new Date('2025-04-30').getTime() / 1000),
          category: 'gameplay',
        },
        {
          content: JSON.stringify({
            ops: [{ insert: 'Правила заказа' }],
          }),
          created_at: Math.ceil(new Date('2025-04-30').getTime() / 1000),
          category: 'donations',
        },
      ],
    });
  }
  const response = await apiRequest('/api/rules/current');
  return response.json();
}

export async function fetchAllRules(): Promise<RulesResponse> {
  if (MOCK_API) {
    return Promise.resolve({
      versions: [
        {
          content: JSON.stringify({
            ops: [
              { insert: 'Третья версия правил' },
              { insert: '\n' },
              { insert: 'Читы и подсказки запрещены' },
            ],
          }),
          created_at: Math.ceil(new Date('2025-04-30').getTime() / 1000),
          category: 'general',
        },
        {
          content: JSON.stringify({
            ops: [
              { insert: 'Вторая версия правил' },
              { insert: '\n' },
              { insert: 'Читы запрещены' },
            ],
          }),
          category: 'general',
          created_at: Math.ceil(new Date('2025-04-29').getTime() / 1000),
        },
        {
          content: JSON.stringify({ ops: [{ insert: 'Первая версия правил' }] }),
          created_at: Math.ceil(new Date('2025-04-28').getTime() / 1000),
          category: 'general',
        },
      ],
    });
  }
  const response = await apiRequest('/api/rules');
  return response.json();
}

export async function saveRulesVersion(request: NewRulesVersionRequest): Promise<void> {
  if (MOCK_API) {
    return Promise.resolve();
  }
  await apiRequest('/api/rules', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function login(request: LoginRequest): Promise<LoginResponse> {
  if (MOCK_API) {
    return Promise.resolve({
      token: 'mock-token',
    });
  }
  const response = await apiRequest('/api/login', {
    method: 'POST',
    body: JSON.stringify(request),
  });
  return response.json();
}

export async function logout(): Promise<void> {
  if (MOCK_API) {
    return Promise.resolve();
  }
  await apiRequest('/api/logout', { method: 'POST' });
}

export async function makePlayerMove(request: PlayerMoveRequest): Promise<PlayerMoveResponse> {
  if (MOCK_API) {
    return Promise.resolve({
      new_sector_id: 10,
      map_completed: false,
    });
  }
  const response = await apiRequest('/api/players/current/moves', {
    method: 'POST',
    body: JSON.stringify(request),
  });
  return response.json();
}

export async function saveTurnState(request: UpdatePlayerTurnStateRequest): Promise<void> {
  if (MOCK_API) {
    return Promise.resolve();
  }
  await apiRequest('/api/players/current/turn-state', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function saveGameReview(
  request: SavePlayerGameRequest
): Promise<SavePlayerGameResponse> {
  if (MOCK_API) {
    return Promise.resolve({
      new_sector_id: 11,
    });
  }
  const response = await apiRequest('/api/player-games', {
    method: 'POST',
    body: JSON.stringify(request),
  });
  return response.json();
}

export async function payTaxes(request: PayTaxRequest): Promise<void> {
  if (MOCK_API) {
    return Promise.resolve();
  }
  await apiRequest('/api/players/current/pay-taxes', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function searchGames(
  query: string,
  limit: number = 100
): Promise<IgdbGamesListResponse> {
  if (MOCK_API) {
    const mockGames: IgdbGameSummary[] = [
      {
        id: 1,
        name: 'The Witcher 3: Wild Hunt',
        cover: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.webp',
        release_year: 2015,
      },
      {
        id: 2,
        name: 'Cyberpunk 2077',
        cover: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co7497.webp',
        release_year: 2020,
      },
      {
        id: 3,
        name: 'Elden Ring',
        cover: null,
        release_year: 2022,
      },
      {
        id: 4,
        name: 'Outlast: Whistleblower',
        cover: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2jjc.webp',
        release_year: 2014,
      },
      {
        id: 4,
        name: 'Gothic',
        cover: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co25r2.webp',
        release_year: 2001,
      },
    ];

    const filteredGames = mockGames.filter(game =>
      game.name.toLowerCase().includes(query.toLowerCase())
    );

    return Promise.resolve({ games: filteredGames });
  }

  const response = await apiRequest(
    `/api/igdb/games/search?query=${encodeURIComponent(query)}&limit=${limit}`
  );
  return response.json();
}

export async function giveBonusCard(request: GiveBonusCardRequest): Promise<GiveBonusCardResponse> {
  if (MOCK_API) {
    return Promise.resolve({
      bonus_type: request.bonus_type,
      received_at: Math.floor(Date.now() / 1000),
      received_on_sector: 1,
    });
  }
  const response = await apiRequest(`/api/bonus-cards`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
  return response.json();
}

export async function activateBonusCard(request: UseBonusCardRequest): Promise<void> {
  if (MOCK_API) {
    return Promise.resolve();
  }
  await apiRequest(`/api/bonus-cards/use`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function stealBonusCard(request: StealBonusCardRequest): Promise<void> {
  if (MOCK_API) {
    return Promise.resolve();
  }
  await apiRequest(`/api/bonus-cards/steal`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function dropBonusCard(request: DropBonusCardRequest): Promise<void> {
  if (MOCK_API) {
    return Promise.resolve();
  }
  await apiRequest(`/api/bonus-cards/lose`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function rollDice(): Promise<RollDiceResponse> {
  if (MOCK_API) {
    return Promise.resolve({
      roll_id: 1,
      is_random_org_result: false,
      data: MOCK_DICE_ROLL,
      // data: [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1],
    });
  }
  const response = await apiRequest('/api/dice/roll', {
    method: 'POST',
    body: JSON.stringify({ num: 2, min: 1, max: 8 }),
  });
  return response.json();
}

export async function resetDb(): Promise<void> {
  if (MOCK_API) {
    return Promise.resolve();
  }
  await apiRequest('/api/internal/reset-db', { method: 'POST' });
}

export async function fetchNotifications(): Promise<NotificationsResponse> {
  if (MOCK_API) {
    const now = Math.floor(Date.now() / 1000);
    return Promise.resolve({
      notifications: [
        {
          id: 1,
          notification_type: 'important',
          event_type: 'building-income',
          created_at: now - 900,
          other_player_id: 2,
          scores: 325,
          sector_id: 15,
        },
        {
          id: 2,
          notification_type: 'standard',
          event_type: 'game-completed',
          created_at: now - 3600,
          scores: 89,
          game_title: 'The Witcher 3: Wild Hunt',
        },
        {
          id: 3,
          notification_type: 'important',
          event_type: 'card-lost',
          created_at: now - 5400,
          other_player_id: 3,
          card_name: 'Выбор одного кубика',
        },
        {
          id: 4,
          notification_type: 'important',
          event_type: 'pay-sector-tax',
          created_at: now - 7200,
          scores: -150,
          sector_id: 24,
        },
        {
          id: 5,
          notification_type: 'standard',
          event_type: 'game-reroll',
          created_at: now - 10800,
          game_title: 'Cyberpunk 2077',
        },
        {
          id: 6,
          notification_type: 'important',
          event_type: 'pay-map-tax',
          created_at: now - 14400,
          scores: -200,
        },
        {
          id: 7,
          notification_type: 'important',
          event_type: 'bonus-increase',
          created_at: now - 18000,
          scores: 50,
        },
        {
          id: 8,
          notification_type: 'standard',
          event_type: 'card-stolen',
          created_at: now - 21600,
          other_player_id: 4,
          card_name: 'Пропуск тюрьмы',
        },
        {
          id: 9,
          notification_type: 'important',
          event_type: 'event-ending-soon',
          created_at: now - 25200,
          event_end_time: now + 86400,
        },
        {
          id: 10,
          notification_type: 'standard',
          event_type: 'game-drop',
          created_at: now - 28800,
          game_title: 'Elden Ring',
        },
        {
          id: 11,
          notification_type: 'standard',
          event_type: 'message',
          created_at: now - 28800,
          message_text: '4Header',
        },
      ],
    });
  }
  const response = await apiRequest('/api/notifications');
  return response.json();
}

export async function markNotificationsSeen(request: MarkNotificationsSeenRequest): Promise<void> {
  if (MOCK_API) {
    return Promise.resolve();
  }
  await apiRequest('/api/notifications/seen', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function activateInstantCard(
  request: UseInstantCardRequest
): Promise<UseInstantCardResponse> {
  if (MOCK_API) {
    return Promise.resolve({
      result: undefined,
    });
  }
  const response = await apiRequest(`/api/bonus-cards/instant`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
  return response.json();
}

export async function fetchFrontVersion(): Promise<{ version: string }> {
  if (MOCK_API) {
    return Promise.resolve({ version: import.meta.env.PACKAGE_VERSION });
  }
  const response = await apiRequest('/version.json?ts=' + Date.now());
  return response.json();
}

export async function fetchEventSettings(): Promise<EventSettingsResponse> {
  if (MOCK_API) {
    return Promise.resolve({
      settings: {
        event_start_time: '1755266400',
        event_end_time: '1794013556',
      },
    });
  }
  const response = await apiRequest('/api/event-settings');
  return response.json();
}

interface EmoteSearchResponse {
  emotes: string[];
}

export async function searchEmotes(query: string): Promise<EmoteSearchResponse> {
  if (!query.trim()) {
    return { emotes: [] };
  }

  const response = await fetch(`${EMOTES_SEARCH_API_URL}/${encodeURIComponent(query)}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Ошибка поиска 7TV смайлов' }));
    showApiError(`emotes-search/${query}`, response.status, errorData, { query });
    throw new Error('Failed to search emotes');
  }
  return response.json();
}

export async function movePlayerGame(request: MovePlayerGameRequest): Promise<void> {
  if (MOCK_API) {
    return Promise.resolve();
  }
  await apiRequest(`/api/player-games/move`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function editPlayerGame(playerGameId: number, request: EditPlayerGame): Promise<void> {
  if (MOCK_API) {
    return Promise.resolve();
  }
  await apiRequest(`/api/player-games/${playerGameId}`, {
    method: 'PATCH',
    body: JSON.stringify(request),
  });
}

export async function updatePlayerInternal(request: UpdatePlayerInternalRequest): Promise<void> {
  if (MOCK_API) {
    return Promise.resolve();
  }
  await apiRequest('/api/internal/player', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function updatePlayer(request: UpdatePlayerRequest): Promise<void> {
  if (MOCK_API) {
    return Promise.resolve();
  }
  await apiRequest('/api/players', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function fetchGameDuration(
  request: GameDurationRequest
): Promise<GameDurationResponse> {
  if (MOCK_API) {
    return Promise.resolve({ duration: 7200 }); // 2h 0m in seconds
  }
  const response = await apiRequest('/api/game-duration', {
    method: 'POST',
    body: JSON.stringify(request),
  });
  return response.json();
}

export async function createMessageNotification(
  request: CreateMessageNotificationRequest
): Promise<void> {
  if (MOCK_API) {
    return Promise.resolve();
  }
  await apiRequest('/api/internal/notifications/message', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function fetchHltbRandomGames(
  request: HltbRandomGameRequest
): Promise<HltbGamesListResponse> {
  if (MOCK_API) {
    return Promise.resolve({
      games: mockHltbGamesList.games.slice(0, request.limit),
    });
  }
  const response = await apiRequest('/api/hltb/random-game', {
    method: 'POST',
    body: JSON.stringify(request),
  });
  return response.json();
}

export async function fetchStats(): Promise<PlayerStatsResponse> {
  if (MOCK_API) {
    return Promise.resolve({
      stats: [],
    });
  }
  const response = await apiRequest('/api/stats');
  return response.json();
}

export async function fetchFinalStats(): Promise<FinalStatsResponse> {
  if (MOCK_API) {
    return Promise.resolve({
      total_score: 10000,
      completed_games: 235,
      dice_rolls: 300,
      hours_spent_on_games: 156,
      cards_received: 421,
      cards_used: 200,
      maps_completed: 20,
      games_dropped: 55,
      games_rerolled: 12,
      train_rides: 24,
      average_rating_of_completed_games: 5,
      players: playersData.map(player => ({
        player_id: player.id,
        username: player.username,
        total_score: player.total_score,
        games_completed: player.games.filter(g => g.status === 'completed').length,
        games_dropped: player.games.filter(g => g.status === 'drop').length,
        longest_game_hours:
          player.games.sort((a, b) => (b.duration || 0) - (a.duration || 0))[0]?.duration || 0,
        shortest_game_hours:
          player.games.sort((a, b) => (a.duration || 0) - (b.duration || 0))[0]?.duration || 0,
        cards_amount: 60,
        hours_played: player.games.reduce(
          (prev, curr) => ({ duration: (prev.duration || 0) + (curr.duration || 0) }),
          { duration: 0 }
        ).duration,
        best_rated_game: playersData[0].games[4],
        worst_rated_game: playersData[playersData.length - 1].games[1],
      })),
    });
  }
  const response = await apiRequest('/api/stats/final');
  return response.json();
}
