import { FinalStatsResponse } from '@/lib/api-types-generated';
import StatisticsCard, { StatisticsCardProps } from './StatisticsCard';

type KeyToPropsType = (key: keyof FinalStatsResponse) => Omit<StatisticsCardProps, 'value'> | null;

function StatisticsRows({
  data,
  keyToProps,
}: {
  data: FinalStatsResponse;
  keyToProps: KeyToPropsType;
}) {
  const dataEntries = Object.entries(data)
    .map(([key, value]) => {
      const params = keyToProps(key as keyof FinalStatsResponse);
      if (!params) {
        return null;
      }
      return { ...params, value: Math.round(value) };
    })
    .filter(x => x !== null);
  const firstRow = dataEntries.filter(({ order }) => order <= 5);
  const secondRow = dataEntries.filter(({ order }) => order > 5);

  return (
    <div className="flex flex-col gap-[15px] justify-center">
      <div className="flex gap-[15px] justify-center">
        {firstRow.map((data, idx) => (
          <StatisticsCard
            key={idx}
            value={data.value as number}
            text={data.text}
            modifiedValue={data.modifiedValue}
            icon={data.icon}
            order={data.order}
          />
        ))}
      </div>
      <div className="flex gap-[15px] justify-center">
        {secondRow.map((data, idx) => (
          <StatisticsCard
            key={idx}
            value={data.value as number}
            text={data.text}
            modifiedValue={data.modifiedValue}
            icon={data.icon}
            order={data.order}
          />
        ))}
      </div>
    </div>
  );
}

export default StatisticsRows;
