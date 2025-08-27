import usePlayerStore from '@/stores/playerStore';
import PlayersList from './core/PlayersList';
import QuickMenu from './core/quickMenu/QuickMenu';
import Notifications from './core/Notifications';
import { useShallow } from 'zustand/shallow';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileTabs from './core/mobile/MobileTabs';
import MobilePlayersList from './core/mobile/MobilePlayerList';
import DiceErrorNotification from './core/DiceErrorNotification';
import PlayerTurnUI from './core/turnUI/PlayerTurnUI';
import AdminPanel from './core/AdminPanel';
import MyCards from './core/MyCards';
import FrontVersionInfo from './FrontVersionInfo';
import useSystemStore from '@/stores/systemStore';
import { Card } from './ui/card';
import { useRef } from 'react';
import { Button } from './ui/button';
import { X } from './icons';
import EndGameStatistics from './core/endGameStatistics/EndGameStatistics';

function DesktopUI() {
  const techContainer = useRef<HTMLDivElement>(null);
  const { position, turnState, loggedIn } = usePlayerStore(
    useShallow(state => ({
      turnState: state.turnState,
      position: state.myPlayer?.sector_id,
      loggedIn: !!state.myPlayer,
    }))
  );

  const showAdminPanel = useSystemStore(
    state => state.myUser?.role === 'admin' || state.actingUserId
  );

  const mainNotification = useSystemStore(useShallow(state => state.mainNotification));

  return (
    <>
      <div className="absolute inset-0 [&>*]:pointer-events-auto pointer-events-none z-50 overflow-hidden md:block hidden">
        <div className="absolute top-3 left-4">
          <PlayersList />
        </div>
        <div className="absolute right-4 top-3 w-[15rem]">
          <div className="mb-[50px]">
            <QuickMenu />
          </div>
          <div className="mb-3">
            <DiceErrorNotification />
          </div>
          <Notifications />
        </div>

        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
          <PlayerTurnUI />
        </div>
        {showAdminPanel && (
          <div className="absolute top-3 right-70">
            <AdminPanel />
          </div>
        )}
        {loggedIn && (
          <div className="absolute left-4 bottom-5">
            <span className="text-[#282828] font-roboto-wide-black opacity-70">Мои бонусы</span>
            <MyCards />
          </div>
        )}
        <div ref={techContainer} className="absolute bottom-0 right-0 flex">
          {/* <Stats
              className="!relative h-[13px] scale-150 grayscale-100 overflow-hidden"
              parent={techContainer!}
              /> */}
          {position && (
            <div className="relative text-xs text-white/80 bg-black/60 p-1">
              #{position} ход: {turnState}
            </div>
          )}
          <FrontVersionInfo />
        </div>
      </div>

      {mainNotification && (
        <Card
          className={`absolute top-3 left-1/2 -translate-x-1/2 max-w-2xl z-[9999] pointer-events-auto ${
            mainNotification.variant === 'error'
              ? 'bg-destructive/90 text-white border-destructive'
              : ''
          }`}
        >
          <div className="relative rounded-md flex items-start gap-2">
            <div className="px-4 flex-1 whitespace-pre-wrap text-sm">{mainNotification.text}</div>
            {!mainNotification.permanent && (
              <Button
                variant="ghost"
                onClick={() => useSystemStore.getState().setMainNotification(null)}
                className=" text-white/70 hover:text-white transition-colors flex-shrink-0"
              >
                <X />
              </Button>
            )}
          </div>
        </Card>
      )}
    </>
  );
}

function MobileUI() {
  const mainNotification = useSystemStore(state => state.mainNotification);

  return (
    <div className="absolute h-dvh w-dvw [&>*]:pointer-events-auto pointer-events-none z-50 overflow-hidden md:hidden block">
      <MobileTabs />
      <MobilePlayersList />

      {mainNotification && (
        <Card
          className={`absolute top-20 left-4 right-4 ${
            mainNotification.variant === 'error'
              ? 'bg-destructive/90 text-white border-destructive'
              : ''
          }`}
        >
          <div className="pl-4 pr-4 rounded-md flex items-start gap-2 py-2">
            <div className="flex-1 whitespace-pre-wrap text-sm">{mainNotification.text}</div>
            <button
              onClick={() => useSystemStore.getState().setMainNotification(null)}
              className="text-white/70 hover:text-white transition-colors flex-shrink-0"
            >
              ✕
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}

function UI() {
  const isMobile = useIsMobile();

  return (
    <>
      <EndGameStatistics />
      {isMobile ? <MobileUI /> : <DesktopUI />}
    </>
  );
}

export default UI;
