import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { activateBonusCard } from '@/lib/api';
import { getTurnsNoun } from '@/lib/utils';
import { resetNotificationsQuery } from '@/lib/queryClient';
import usePlayerStore from '@/stores/playerStore';
import { useShallow } from 'zustand/shallow';

export default function SkipPrisonDialog() {
  const { setNextTurnState, myPlayer } = usePlayerStore(
    useShallow(state => {
      return {
        setNextTurnState: state.setNextTurnState,
        myPlayer: state.myPlayer,
      };
    })
  );

  const handleStay = async () => {
    await setNextTurnState({ action: 'skip-bonus' });
  };

  const handleUseCard = async () => {
    await activateBonusCard({ bonus_type: 'skip-prison-day' });
    resetNotificationsQuery();
    await setNextTurnState({ action: 'skip-prison' });
  };

  const card = myPlayer?.bonus_cards.find(c => c.bonus_type === 'skip-prison-day');
  const cooldown = card ? card.cooldown_turns_left : 0;

  return (
    <Card className="p-4">
      <span className="font-wide-semibold">Сбежать из тюрьмы используя карточку?</span>
      <div className="flex justify-evenly mt-2 gap-2">
        <Button
          variant="outline"
          className="bg-[#0A84FF] hover:bg-[#0A84FF]/70 w-full flex-1"
          onClick={handleStay}
        >
          Остаться
        </Button>
        <Button
          variant="outline"
          className="bg-[#30D158] hover:bg-[#30D158]/70 w-full flex-1"
          onClick={handleUseCard}
          disabled={cooldown !== 0}
        >
          {cooldown === 0 ? 'Сбежать' : `Кулдаун: ${getTurnsNoun(cooldown)}`}
        </Button>
      </div>
    </Card>
  );
}
