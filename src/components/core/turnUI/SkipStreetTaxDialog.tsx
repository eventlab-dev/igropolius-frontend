import { Share } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { activateBonusCard } from '@/lib/api';
import { resetNotificationsQuery } from '@/lib/queryClient';
import { TaxData } from '@/lib/types';
import { getTaxCalculationText, getTurnsNoun } from '@/lib/utils';
import usePlayerStore from '@/stores/playerStore';
import { useShallow } from 'zustand/shallow';

export default function SkipStreetTaxDialog() {
  const { taxInfo, players, payTaxes, setNextTurnState, myPlayer } = usePlayerStore(
    useShallow(state => {
      const myPlayer = state.myPlayer;
      let taxInfo: TaxData = {
        taxAmount: 0,
        playerIncomes: [],
      };
      if (myPlayer && state.taxPerSector[myPlayer.sector_id]) {
        taxInfo = state.taxPerSector[myPlayer.sector_id];
      }
      return {
        taxInfo,
        players: state.players,
        payTaxes: state.payTaxesAndSwitchState,
        setNextTurnState: state.setNextTurnState,
        myPlayer,
      };
    })
  );

  // useEffect(() => {
  //   if (dataLoaded) {
  //     setNextTurnState({ action: 'skip-bonus' });
  //   }
  // }, [taxInfo.taxAmount, setNextTurnState, dataLoaded]);

  const handlePayTax = async () => {
    await payTaxes('street-tax');
  };

  const handleUseCard = async () => {
    await activateBonusCard({ bonus_type: 'evade-street-tax' });
    resetNotificationsQuery();
    await setNextTurnState({ action: 'skip-bonus' });
  };

  const otherPlayersOnSector = Object.entries(taxInfo.playerIncomes).filter(
    ([playerId]) => Number(playerId) !== myPlayer?.id
  );

  const calculationText = getTaxCalculationText(taxInfo, myPlayer?.id);

  const card = myPlayer?.bonus_cards.find(c => c.bonus_type === 'evade-street-tax');
  const cooldown = card ? card.cooldown_turns_left : 0;

  return (
    <Card className="p-4">
      <span className="font-wide-semibold">Уйти от налога на секторе?</span>
      <div className="flex mt-2 mb-2 items-center">
        Налог на секторе: {taxInfo.taxAmount} <Share />
        &nbsp;&nbsp;&nbsp;
        <span className="text-muted-foreground">({calculationText})</span>
      </div>
      <div>
        Доход получат:
        {otherPlayersOnSector.map(([playerId, amount], index) => {
          const playerIdNum = Number(playerId);
          const player = players.find(p => p.id === playerIdNum);
          return (
            <div key={index} className="flex gap-4">
              <span>{player?.username}</span>
              <div className="flex">
                <span>+{amount}</span>
                <Share />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-evenly mt-2 gap-2">
        <Button
          variant="outline"
          className="bg-[#0A84FF] hover:bg-[#0A84FF]/70 w-full flex-1"
          onClick={handlePayTax}
        >
          Заплатить {taxInfo.taxAmount}
        </Button>
        <Button
          variant="outline"
          className="bg-[#30D158] hover:bg-[#30D158]/70 w-full flex-1"
          onClick={handleUseCard}
          disabled={cooldown !== 0}
        >
          {cooldown === 0 ? 'Использовать карточку' : `Кулдаун: ${getTurnsNoun(cooldown)}`}
        </Button>
      </div>
    </Card>
  );
}
