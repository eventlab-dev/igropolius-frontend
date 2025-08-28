import { Share } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { activateBonusCard } from '@/lib/api';
import { resetNotificationsQuery } from '@/lib/queryClient';
import { MapTaxPercent, MinMapTax } from '@/lib/constants';
import { getTurnsNoun } from '@/lib/utils';
import usePlayerStore from '@/stores/playerStore';
import { useShallow } from 'zustand/shallow';

export default function SkipMapTaxDialog() {
  const { taxAmount, payTaxes, setNextTurnState, myPlayer } = usePlayerStore(
    useShallow(state => {
      const myPlayer = state.myPlayer;
      let taxAmount = '0';
      if (myPlayer) {
        const taxBase = Math.abs(myPlayer.total_score) * MapTaxPercent;
        const amount = Math.max(taxBase, MinMapTax);
        taxAmount = amount.toFixed(2);
      }
      return {
        taxAmount,
        payTaxes: state.payTaxesAndSwitchState,
        setNextTurnState: state.setNextTurnState,
        myPlayer: myPlayer,
      };
    })
  );

  const handlePayTax = async () => {
    await payTaxes('map-tax');
  };

  const handleUseCard = async () => {
    await activateBonusCard({ bonus_type: 'evade-map-tax' });
    resetNotificationsQuery();
    await setNextTurnState({ action: 'skip-bonus', sectorToId: myPlayer?.sector_id });
  };

  const card = myPlayer?.bonus_cards.find(c => c.bonus_type === 'evade-map-tax');
  const cooldown = card ? card.cooldown_turns_left : 0;

  return (
    <Card className="p-4">
      <span className="font-wide-semibold">Уйти от налога на круг?</span>
      <div className="flex mt-2 mb-2 items-center">
        Налог за прохождение круга: {taxAmount} <Share />
      </div>
      <div className="flex justify-evenly mt-2 gap-2">
        <Button
          variant="outline"
          className="bg-[#0A84FF] hover:bg-[#0A84FF]/70 w-full flex-1"
          onClick={handlePayTax}
        >
          Заплатить {taxAmount}
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
