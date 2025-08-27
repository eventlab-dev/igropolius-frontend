import { FinalStatsResponse } from '@/lib/api-types-generated';
import { StatisticsCardProps } from './StatisticsCard';
import { Share } from '@/components/icons';
import StatisticsHeading from './StatisticsHeading';
import StatisticsRows from './StatisticsRows';

type Props = {
  data: FinalStatsResponse;
};

function StatisticsGeneralSection({ data }: Props) {
  const keyToProps = (key: keyof FinalStatsResponse): Omit<StatisticsCardProps, 'value'> | null => {
    switch (key) {
      case 'total_score':
        return {
          text: `Всего очков\nзаработано`,
          icon: <Share className="size-[26px]" />,
          modifiedValue: Math.round(data[key]),
          order: 1,
        };
      case 'hours_spent_on_games':
        return {
          text: `Наиграли в игры\nстримеры`,
          modifiedValue: `${Math.round(data[key])}ч`,
          order: 4,
        };
      case 'average_rating_of_completed_games':
        return {
          text: `Средняя оценка\nпройденных игр`,
          modifiedValue: `${data[key]} / 10`,
          order: 11,
        };
      case 'completed_games':
        return { text: `Игр пройдено\nна ивенте`, order: 2 };
      case 'dice_rolls':
        return { text: `Раз бросили\nкубики`, order: 3 };
      case 'cards_received':
        return { text: `Раз ролили\nкарточки`, order: 5 };
      case 'cards_used':
        return { text: `Карточек\nиспользовали`, order: 6 };
      case 'maps_completed':
        return { text: `Кругов\nпройдено`, order: 7 };
      case 'games_dropped':
        return { text: `Игр дропнуто\nна ивенте`, order: 8 };
      case 'games_rerolled':
        return { text: `Игр рерольнуто\nучастниками`, order: 9 };
      case 'train_rides':
        return { text: `Поездки на\nпоезде`, order: 10 };
      default:
        return null;
    }
  };

  return (
    <div className="space-y-[30px] mb-[150px]">
      <StatisticsHeading>Общая статистика</StatisticsHeading>
      <StatisticsRows data={data} keyToProps={keyToProps} />
    </div>
  );
}

export default StatisticsGeneralSection;
