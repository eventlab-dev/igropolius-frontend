import { FinalStatsResponse } from '@/lib/api-types-generated';
import { StatisticsCardProps } from './StatisticsCard';
import { Share } from '@/components/icons';
import StatisticsHeading from './StatisticsHeading';
import StatisticsRows from './StatisticsRows';
import { getNoun } from '@/lib/utils';

type Props = {
  data: FinalStatsResponse;
};

function StatisticsGeneralSection({ data }: Props) {
  const keyToProps = (key: string): Omit<StatisticsCardProps, 'value'> | null => {
    const dataKey = key as keyof FinalStatsResponse;
    switch (dataKey) {
      case 'total_score':
        return {
          text: `Всего очков\nзаработано`,
          icon: <Share className="size-[26px]" />,
          modifiedValue: Math.round(data[dataKey]),
          order: 1,
        };
      case 'hours_spent_on_games':
        return {
          text: `Наиграли в игры\nстримеры`,
          modifiedValue: `${Math.round(data[dataKey])}ч`,
          order: 4,
        };
      case 'average_rating_of_completed_games':
        return {
          text: `Средняя оценка\nпройденных игр`,
          modifiedValue: `${data[dataKey]} / 10`,
          order: 11,
        };
      case 'completed_games': {
        const noun = getNoun(data[dataKey], ['Игра пройдена', 'Игры пройдено', 'Игр пройдено'], false);

        return { text: `${noun}\nна ивенте`, order: 2 };
      }
      case 'dice_rolls': {
        const noun = getNoun(data[dataKey], ['Раз', 'Раза', 'Раз'], false);
        return { text: `${noun} бросили\nкубики`, order: 3 };
      }
      case 'cards_received': {
        const noun = getNoun(data[dataKey], ['Раз', 'Раза', 'Раз'], false);
        return { text: `${noun} ролили\nкарточки`, order: 5 };
      }
      case 'cards_used': {
        const noun = getNoun(data[dataKey], ['Карточку', 'Карточки', 'Карточек'], false);
        return { text: `${noun}\nиспользовали`, order: 6 };
      }
      case 'maps_completed': {
        const noun = getNoun(data[dataKey], ['Круг', 'Круга', 'Кругов'], false);
        return { text: `${noun}\nпройдено`, order: 7 };
      }
      case 'games_dropped': {
        const noun = getNoun(data[dataKey], ['Игра дропнута', 'Игры дропнуто', 'Игр дропнуто'], false);
        return { text: `${noun}\nна ивенте`, order: 8 };
      }
      case 'games_rerolled': {
        const noun = getNoun(data[dataKey], ['Игра рерольнута', 'Игры рерольнуто', 'Игр рерольнуто'], false);
        return { text: `${noun}\nучастниками`, order: 9 };
      }
      case 'train_rides': {
        const noun = getNoun(data[dataKey], ['Поездка', 'Поездки', 'Поездок'], false);
        return { text: `${noun} на\nпоезде`, order: 10 };
      }
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
