import { PlayerFinalStats } from '@/lib/api-types-generated';
import { FALLBACK_AVATAR_URL } from '@/lib/constants';
import { StatisticsCardProps } from './StatisticsCard';
import { formatMs, formatMsToHoursMins, getNoun } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import StatisticsHeading from './StatisticsHeading';
import StatisticsRows from './StatisticsRows';
import { Skeleton } from '@/components/ui/skeleton';
import StatisticsGameReview from './StatisticsGameReview';
import { Share } from '@/components/icons';
import usePlayerStore from '@/stores/playerStore';

type PlayerSectionProps = {
  data: PlayerFinalStats & {
    placement: number;
    monopolies_amount: number;
    buildings_amount: number;
  };
};

function StatisticsPlayerSection({ data }: PlayerSectionProps) {
  const players = usePlayerStore(state => state.players);

  const color = players.find(p => p.id === data.player_id)?.color || 'white';
  const avatar = players.find(p => p.id === data.player_id)?.avatar_link || FALLBACK_AVATAR_URL;

  const keyToProps = (key: string): Omit<StatisticsCardProps, 'value'> | null => {
    const dataKey = key as keyof PlayerSectionProps['data'];
    switch (dataKey) {
      case 'total_score': {
        const value = Math.round(data[dataKey]);
        const noun = getNoun(value, ['Очко', 'Очка', 'Очков'], false);
        const totalScoreText =
          data.placement === 1
            ? `${noun} — самый\nбогатый`
            : data.placement === players.length
              ? `${noun} — \nБанкрот!`
              : `${noun}\nзаработано`;

        return {
          text: totalScoreText,
          icon: <Share className="size-[26px]" />,
          order: 1,
          modifiedValue: value,
        };
      }
      case 'longest_game_hours':
        return {
          text: `Самая\nдлинная игра`,
          modifiedValue: formatMsToHoursMins(data[dataKey] * 1000),
          order: 4,
        };
      case 'shortest_game_hours':
        return {
          text: `Самая\nкороткая игра`,
          modifiedValue: formatMsToHoursMins(data[dataKey] * 1000),
          order: 9,
        };
      case 'hours_played':
        return {
          text: `Наиграно в игры\nна ивенте`,
          modifiedValue: formatMs(data[dataKey] * 1000),
          order: 6,
        };
      case 'games_completed': {
        const noun = getNoun(
          data[dataKey],
          ['Игра\nпройдена', 'Игры\nпройдены', 'Игр\nпройдено'],
          false
        );
        return { text: noun, order: 3 };
      }
      case 'games_dropped': {
        const noun = getNoun(
          data[dataKey],
          ['Игра\nдропнуто', 'Игры\nдропнуты', 'Игр\nдропнуто'],
          false
        );
        return { text: noun, order: 7 };
      }
      case 'cards_amount': {
        const noun = getNoun(
          data[dataKey],
          ['Карточка\nзаролена', 'Карточки\nзаролены', 'Карточек\nзаролено'],
          false
        );
        return { text: noun, order: 5 };
      }
      case 'buildings_amount': {
        const noun = getNoun(data[dataKey], ['Здание', 'Здания', 'Зданий'], false);
        return { text: `${noun}\nпостроено`, order: 2 };
      }
      case 'monopolies_amount': {
        const noun = getNoun(
          data[dataKey],
          ['Монополия\nсобрана', 'Монополии\nсобрано', 'Монополий\nсобрано'],
          false
        );
        return { text: noun, order: 8 };
      }
      default:
        return null;
    }
  };

  return (
    <div className="space-y-[30px]">
      <div className="space-y-[15px]">
        <Badge
          className="flex py-1 uppercase font-roboto-wide-semibold-italic leading-[19px] border-0 mx-auto"
          style={{ backgroundColor: color }}
        >
          {data.placement} место
        </Badge>
        <div className="flex gap-2 justify-center items-center">
          <div className="relative">
            <Avatar className="size-[56px] overflow-auto">
              <AvatarImage src={avatar} />
              <AvatarFallback className="uppercase">{data.username.slice(0, 2)}</AvatarFallback>
            </Avatar>
          </div>
          <StatisticsHeading>{data.username}</StatisticsHeading>
        </div>
      </div>

      <StatisticsRows data={data} keyToProps={keyToProps} />

      <div className="space-y-[15px]">
        <div className="text-center font-roboto-wide-black-alt text-2xl leading-7">Лучший клип</div>
        <div className="w-[500px] h-[281px] shrink-0 mx-auto">
          <Skeleton className="w-full h-full" />
        </div>
      </div>

      {data.best_rated_game && data.worst_rated_game && (
        <div className="flex gap-[15px] justify-center">
          {data.best_rated_game && (
            <StatisticsGameReview data={data.best_rated_game} title="Лучшая игра" />
          )}
          {data.worst_rated_game && (
            <StatisticsGameReview data={data.worst_rated_game} title="Худшая игра" />
          )}
        </div>
      )}
    </div>
  );
}

export default StatisticsPlayerSection;
