import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './Collapsible';
import { Button } from '../ui/button';

import { ScrollArea } from '../ui/scroll-area';
import { Notification, Share, X } from '../icons';
import { fetchNotifications, markNotificationsSeen } from '@/lib/api';
import usePlayerStore from '@/stores/playerStore';
import useSystemStore from '@/stores/systemStore';
import { useShallow } from 'zustand/shallow';
import { formatMs } from '@/lib/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';
import { NotificationItem, PlayerDetails } from '@/lib/api-types-generated';
import useUrlPath from '@/hooks/useUrlPath';

function formatNotificationText(
  notification: NotificationItem,
  players: PlayerDetails[],
  eventEndTime: number | null
): string {
  const { event_type, other_player_id, scores, game_title, card_name, message_text, sector_id } =
    notification;

  const otherPlayer = other_player_id ? players.find(p => p.id === other_player_id) : null;
  const otherPlayerName = otherPlayer?.username || 'Игрок';

  switch (event_type) {
    case 'game-completed':
      return `Получено ${scores} очков за прохождение "${game_title}"`;
    case 'game-reroll':
      return `Рерольнул "${game_title}"`;
    case 'game-drop':
      return `Дропнул "${game_title}" и попал в тюрьму`;
    case 'pay-sector-tax':
      return `Заплатил налог ${scores} на секторе ${sector_id}`;
    case 'building-income':
      return `Доход ${scores} от ${otherPlayerName} на секторе ${sector_id}`;
    case 'pay-map-tax':
      return `Заплатил налог ${scores} за прохождение круга`;
    case 'bonus-increase':
      return `Бонус за прохождение игр стал +${scores} очков`;
    case 'card-stolen':
      return `Украдена карточка "${card_name}" у ${otherPlayerName}`;
    case 'card-lost':
      return `${otherPlayerName} украл твою карточку "${card_name}"`;
    case 'event-ending-soon':
      if (eventEndTime) {
        const timeLeftMs = eventEndTime * 1000 - Date.now();
        if (timeLeftMs > 0) {
          return `До конца ивента — ${formatMs(timeLeftMs)}`;
        } else {
          return 'Ивент завершен';
        }
      }
      return 'Ивент скоро закончится';
    case 'message':
      return message_text || 'Сообщение';
    default: {
      const subtype: never = event_type;
      throw new Error(`Unsupported notification event type: ${subtype}`);
    }
  }
}

function formatNotificationDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } else {
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

type NotificationCardProps = {
  notification: NotificationItem;
  players: PlayerDetails[];
  eventEndTime: number | null;
  isLast?: boolean;
};

function NotificationCard({
  notification,
  players,
  eventEndTime,
  isLast = false,
}: NotificationCardProps) {
  const { scores, event_type, notification_type } = notification;

  const isImportant = notification_type === 'important';
  const isPositive =
    event_type === 'building-income' ||
    event_type === 'bonus-increase' ||
    event_type === 'game-completed';
  const color = isPositive ? 'text-green-500' : 'text-red-500';
  const symbol = isPositive ? '+' : '-';

  const text = formatNotificationText(notification, players, eventEndTime);
  const date = formatNotificationDate(notification.created_at);

  return (
    <Card className="p-2 gap-0.5 font-semibold" data-important={isImportant}>
      {/*<div className="absolute top-0 right-0">
        <Button
          variant="ghost"
          onClick={async () => {
            await markNotificationsSeen({ notification_ids: [notification.id] });
            refetchNotificationsQuery();
          }}
        >
          <X />
        </Button>
      </div>*/}
      <CardHeader className="px-0 gap-0.5">
        {isImportant ? (
          <CardDescription className="flex text-sm justify-between flex-wrap">
            <div>Важное</div>
            <div>{date}</div>
          </CardDescription>
        ) : (
          <CardDescription className="text-sm">{isLast ? 'Последнее' : date}</CardDescription>
        )}
        <CardTitle className="text-base">{text}</CardTitle>
      </CardHeader>
      {scores != null && (
        <CardContent className={`px-0 text-base flex items-center ${color}`}>
          {`${symbol} ${Math.abs(scores)}`} <Share className="w-4 h-4" />
        </CardContent>
      )}
    </Card>
  );
}

function Notifications() {
  const { players, myPlayer } = usePlayerStore(
    useShallow(state => ({ players: state.players, myPlayer: state.myPlayer }))
  );
  const eventEndTime = useSystemStore(state => state.eventEndTime);
  const queryClient = useQueryClient();

  const { data: notificationsData, isLoading: loading } = useQuery({
    queryKey: queryKeys.notifications,
    queryFn: fetchNotifications,
    refetchInterval: 30 * 1000,
    enabled: Boolean(myPlayer),
  });

  const notifications = notificationsData?.notifications || [];

  async function dismissAllNotifications() {
    if (notifications.length === 0) return;

    const notificationIds = notifications.map(n => n.id);
    await markNotificationsSeen({ notification_ids: notificationIds });
    queryClient.refetchQueries({ queryKey: queryKeys.notifications });
  }

  const { pathActive: isFinals } = useUrlPath('/finals');

  if (isFinals) {
    return null;
  }

  if (loading) {
    return null;
  }

  const lastNotification = notifications[0];
  const collapsibleNotifications = notifications.slice(1);

  return (
    notifications.length > 0 && (
      <Collapsible key={lastNotification?.id}>
        <div className="flex gap-[5px]">
          <CollapsibleTrigger className="!pr-[5px] font-semibold text-sm text-muted-foreground">
            <Notification />
            Уведомления
          </CollapsibleTrigger>

          <Button
            variant="outline"
            className="w-full shrink rounded-[10px] backdrop-blur-[1.5rem] bg-card/70 text-muted-foreground border-none"
            onClick={dismissAllNotifications}
          >
            <X style={{ width: '23px', height: '23px' }} />
          </Button>
        </div>

        <ScrollArea className="h-[400px]">
          <div className="mt-[5px]">
            <NotificationCard
              notification={lastNotification}
              players={players}
              eventEndTime={eventEndTime}
              isLast
            />
          </div>

          <CollapsibleContent>
            {collapsibleNotifications.map(notification => (
              <div key={notification.id} className="first:mt-[5px]">
                <NotificationCard
                  notification={notification}
                  players={players}
                  eventEndTime={eventEndTime}
                />
              </div>
            ))}
          </CollapsibleContent>
        </ScrollArea>
      </Collapsible>
    )
  );
}

export default Notifications;
