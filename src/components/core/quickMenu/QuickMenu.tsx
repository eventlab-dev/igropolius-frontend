import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import usePlayerStore from '@/stores/playerStore';
import AboutDialog from './options/AboutDialog';
import OrthographicToggle from './options/OrthographicToggle';
import RulesDialog from './options/RulesDialog';
import Countdown from './options/Countdown';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../Collapsible';
import LoginDialog from './options/LoginDialog';
import { LogoutButton } from './options/LogoutButton';
import StreamsButton from './options/StreamsButton';
import { Separator } from '@/components/ui/separator';
import { Sort } from '@/components/icons';
import { FALLBACK_AVATAR_URL } from '@/lib/constants';
import Clock from '../Clock';
import useSystemStore from '@/stores/systemStore';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import GamesHistory from './options/GamesHistory';
import StatisticsDialog from './options/StatisticsDialog';
import SvgProfile from '@/components/icons/Profile';
import DonationGoalCalculatorDialog from './options/DonationGoalCalculatorDialog';
import useUrlPath from '@/hooks/useUrlPath';

const buttonStyle =
  'flex items-center justify-start max-h-9 bg-transparent font-semibold text-base w-full rounded-none border-none px-3 py-2';
const groupStyle =
  'flex flex-col items-center w-full rounded-xl backdrop-blur-[1.5rem] bg-card/70 overflow-hidden shrink-0 first:mt-[5px]';

function QuickMenuTitle({ username, avatarLink }: { username?: string; avatarLink?: string }) {
  return (
    <>
      {username ? (
        <div className="flex gap-2 items-center font-bold text-base">
          <Avatar className="w-6 h-6">
            <AvatarImage src={avatarLink || FALLBACK_AVATAR_URL} />
            <AvatarFallback className="bg-primary-foreground uppercase">
              {username.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <span>{username}</span>
        </div>
      ) : (
        <div className="flex gap-2 items-center font-bold pl-[7px] text-base">
          <Sort />
          Быстрый доступ
        </div>
      )}
    </>
  );
}

function QuickMenu() {
  const myUser = useSystemStore(state => state.myUser);
  const myPlayer = usePlayerStore(state => state.myPlayer);

  const navigate = useNavigate();

  const openProfile = () => {
    if (myUser) {
      navigate(`/${myUser.username.toLowerCase()}`);
    }
  };

  const { pathActive: isFinals } = useUrlPath('/finals');

  if (isFinals) {
    return null;
  }

  return (
    <Collapsible key={myPlayer?.id}>
      <CollapsibleTrigger className="w-full">
        <QuickMenuTitle
          username={myUser?.username}
          avatarLink={myPlayer?.avatar_link ?? undefined}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className={groupStyle}>
          <div className={cn(buttonStyle, 'whitespace-pre')}>
            Время — <Clock /> MSK
          </div>
          <Separator />
          <Countdown className={buttonStyle} />
        </div>

        <div className={groupStyle}>
          {myUser && (
            <>
              <Button variant="outline" className={buttonStyle} onClick={openProfile}>
                <SvgProfile />
                Мой профиль
              </Button>
              <Separator />
            </>
          )}
          <RulesDialog className={buttonStyle} />
          <Separator />
          <GamesHistory className={buttonStyle} />
          <Separator />
          <StatisticsDialog className={buttonStyle} />
          <Separator />
          <DonationGoalCalculatorDialog className={buttonStyle} />
          <Separator />
          <AboutDialog className={buttonStyle} />
        </div>

        <div className={groupStyle}>
          <OrthographicToggle className={buttonStyle} />
          <Separator />
          <StreamsButton className={buttonStyle} />
        </div>

        <div className={groupStyle}>
          {myUser ? (
            <LogoutButton className={buttonStyle} />
          ) : (
            <LoginDialog className={buttonStyle} />
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default QuickMenu;
