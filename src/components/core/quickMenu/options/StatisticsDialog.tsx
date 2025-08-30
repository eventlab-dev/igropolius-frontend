import { buttonVariants } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Document } from '@/components/icons';
import { useQuery } from '@tanstack/react-query';
import { fetchStats } from '@/lib/api';
import { LoaderCircle } from 'lucide-react';
import { Table } from '@radix-ui/themes';
import { useState } from 'react';
import { PlayerStatsResponse } from '@/lib/api-types-generated';
import { colors } from '@/lib/types';

type Props = {
  className?: string;
};

type Columns =
  | 'username'
  | 'total_score'
  | 'games'
  | 'games_score'
  | 'instant_cards_used'
  | 'instant_cards_score'
  | 'street_income'
  | 'building_scores_sum'
  | 'street_tax_paid'
  | 'map_tax_paid';

type SortKey = keyof PlayerStatsResponse['stats'][0];

const columns: { key: Columns; header: string; sortKey: SortKey }[] = [
  { key: 'username', header: 'Игрок', sortKey: 'username' },
  { key: 'total_score', header: 'Очки', sortKey: 'total_score' },
  { key: 'games', header: 'Игры', sortKey: 'games_completed' },
  // { key: 'games_dropped', header: 'Игр дропнуто' },
  { key: 'games_score', header: 'Очки с игр', sortKey: 'score_from_games_completed' },
  { key: 'building_scores_sum', header: 'Сумма очков зданий', sortKey: 'building_scores_sum' },
  // { key: 'score_from_games_dropped', header: 'Очки с дропов' },
  { key: 'instant_cards_used', header: 'Мгновенные карты', sortKey: 'instant_cards_used' },
  { key: 'instant_cards_score', header: 'Очки с карт', sortKey: 'score_from_cards' },
  // { key: 'score_lost_on_cards', header: 'Потеряно на картах' },
  { key: 'street_income', header: 'Доход со зданий', sortKey: 'income_from_others' },
  { key: 'street_tax_paid', header: 'Налог за улицы', sortKey: 'street_tax_paid' },
  { key: 'map_tax_paid', header: 'Налог за круги', sortKey: 'map_tax_paid' },
] as const;

export default function StatisticsDialog({ className }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
  });

  const [sortColumn, setSortColumn] = useState<Columns>('total_score');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const onHeaderClick = (columnKey: Columns) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('desc');
    }
  };

  const sortKey = columns.find(col => col.key === sortColumn)?.sortKey ?? 'total_score';

  const orderedData =
    data?.stats.sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      } else if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      return 0; // Fallback for unsupported types
    }) || [];

  return (
    <Dialog>
      <DialogTrigger className={cn(buttonVariants({ variant: 'outline' }), className)}>
        <Document />
        Статистика
      </DialogTrigger>
      <DialogContent
        className="w-[1200px]! max-w-[1200px]! p-0 h-[400px] overflow-hidden"
        aria-describedby=""
      >
        <ScrollArea className="max-h-full px-5 overflow-y-auto">
          <DialogHeader className="pt-5 pb-4">
            <DialogTitle className="text-[32px] font-wide-black! leading-[38px]">
              Статистика
            </DialogTitle>
          </DialogHeader>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <LoaderCircle className="w-16 h-16 animate-spin" />
            </div>
          ) : (
            <Table.Root className="stats-table table-auto border-separate text-auto text-center">
              <Table.Header>
                <Table.Row>
                  {columns.map(col => (
                    <Table.ColumnHeaderCell
                      key={col.key}
                      className="max-w-15 border-separate border-spacing-5 cursor-pointer"
                      style={{
                        color:
                          sortColumn === col.key
                            ? sortDirection === 'asc'
                              ? colors.red
                              : colors.green
                            : undefined,
                        textDecoration: 'underline',
                        userSelect: 'none',
                      }}
                      onClick={() => onHeaderClick(col.key)}
                    >
                      {col.header}
                    </Table.ColumnHeaderCell>
                  ))}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {orderedData.map(playerStats => (
                  <Table.Row key={playerStats.player_id}>
                    {columns.map((col, idx) => {
                      const RowTag = idx === 0 ? Table.RowHeaderCell : Table.Cell;
                      let content = '';
                      switch (col.key) {
                        case 'username':
                          content = playerStats[col.key];
                          break;
                        case 'games': {
                          const completed = playerStats['games_completed'] || 0;
                          const dropped = playerStats['games_dropped'] || 0;
                          content = `${completed} / ${dropped}`;
                          break;
                        }
                        case 'total_score':
                          content = playerStats[col.key].toString();
                          break;
                        case 'games_score': {
                          const scoreRecevied = playerStats['score_from_games_completed'] || 0;
                          const scoreDropped = playerStats['score_from_games_dropped'] || 0;
                          content = `+${scoreRecevied} / ${scoreDropped}`;
                          break;
                        }
                        case 'instant_cards_score': {
                          const scoreReceived = playerStats['score_from_cards'] || 0;
                          const scoreLost = playerStats['score_lost_on_cards'] || 0;
                          content = `+${scoreReceived} / ${scoreLost}`;
                          break;
                        }
                        case 'instant_cards_used': {
                          content = playerStats[col.key].toString();
                          break;
                        }
                        case 'map_tax_paid':
                          content = playerStats[col.key].toString();
                          break;
                        case 'street_income':
                          content = playerStats['income_from_others'].toString();
                          break;
                        case 'street_tax_paid':
                          content = playerStats[col.key].toString();
                          break;
                        case 'building_scores_sum':
                          content = playerStats[col.key].toString();
                          break;
                        default: {
                          const error: never = col.key;
                          throw new Error(`Unknown column key: ${error}`);
                        }
                      }
                      return <RowTag key={col.key}>{content}</RowTag>;
                    })}
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
