import './index.css';
import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useMemo } from 'react';
import { KeyboardControls, KeyboardControlsEntry } from '@react-three/drei';
import { useShallow } from 'zustand/shallow';
import { Controls, IS_DEV } from './lib/constants';
import GameScene from './components/map/scenes/GameScene';
import UI from './components/UI';
import usePlayerStore from './stores/playerStore';
import useSystemStore from './stores/systemStore';
import { fetchCurrentPlayer, fetchPlayers, fetchFrontVersion, fetchEventSettings } from './lib/api';
import { useQuery } from '@tanstack/react-query';
import LoadingModal from './components/core/loadng/LoadingModal';
import { queryKeys } from './lib/queryClient';
import CanvasTooltip from './components/map/canvasTooltip/CanvasTooltip';
import SceneLoader from './components/map/SceneLoader';
import useDiceStore from './stores/diceStore';
import { TooltipProvider } from './components/ui/tooltip';
import useCanvasTooltipStore from './stores/canvasTooltipStore';
import { useUserActivity } from './hooks/useUserActivity';
import { MetrikaCounter } from 'react-metrika';
import { Environment } from '@react-three/drei';
import { STORAGE_BASE_URL } from '@/lib/constants';
import ModelSelectionScene from './components/map/scenes/ModelSelectionScene';
import useRenderStore from './stores/renderStore';
import { useIsMobile } from './hooks/use-mobile';

function App() {
  const { isInactive } = useUserActivity();
  const shouldRender3D = useRenderStore(state => state.shouldRender3D);
  const isMobile = useIsMobile();

  const map = useMemo<KeyboardControlsEntry<Controls>[]>(
    () => [
      { name: Controls.forward, keys: ['ArrowUp', 'KeyW'] },
      { name: Controls.backward, keys: ['ArrowDown', 'KeyS'] },
      { name: Controls.left, keys: ['ArrowLeft', 'KeyA'] },
      { name: Controls.right, keys: ['ArrowRight', 'KeyD'] },
      { name: Controls.up, keys: ['Space'] },
      { name: Controls.down, keys: ['KeyC'] },
      { name: Controls.turnLeft, keys: ['KeyQ'] },
      { name: Controls.turnRight, keys: ['KeyE'] },
    ],
    []
  );

  const { setPlayers, setMyPlayer, setTurnState, setPrisonCards, myPlayer } = usePlayerStore(
    useShallow(state => ({
      setPlayers: state.setPlayers,
      setMyPlayer: state.setMyPlayer,
      setTurnState: state.setTurnState,
      setPrisonCards: state.setPrisonCards,
      players: state.players,

      myPlayer: state.myPlayer,
    }))
  );

  const {
    disableCurrentPlayerQuery,
    disablePlayersQuery,
    setMyUser,
    setActingUserId,
    accessToken,
  } = useSystemStore(
    useShallow(state => ({
      disableCurrentPlayerQuery: state.disableCurrentPlayerQuery,
      disablePlayersQuery: state.disablePlayersQuery,
      setMyUser: state.setMyUser,
      accessToken: state.accessToken,
      setActingUserId: state.setActingUserId,
    }))
  );

  const { data: currentPlayerData, error: currentPlayerDataError } = useQuery({
    queryKey: queryKeys.currentPlayer,
    queryFn: fetchCurrentPlayer,
    retry: false,
    enabled: !disableCurrentPlayerQuery && Boolean(accessToken),
  });

  const { data: playersData, isLoading } = useQuery({
    queryKey: queryKeys.players,
    queryFn: fetchPlayers,
    refetchInterval: 60 * 1000,
    enabled: !disablePlayersQuery,
  });

  const { data: eventSettingsData, isError: eventSettingsError } = useQuery({
    queryKey: queryKeys.eventSettings,
    queryFn: fetchEventSettings,
    refetchInterval: 60 * 1000,
  });

  const dismiss = useCanvasTooltipStore(state => state.dismiss);
  const unpin = useCanvasTooltipStore(state => state.unpin);

  const { setEventSettings, setMainNotification } = useSystemStore(
    useShallow(state => ({
      setEventSettings: state.setEventSettings,
      setMainNotification: state.setMainNotification,
    }))
  );

  const setRollResult = useDiceStore(state => state.setRollResult);

  useEffect(() => {
    if (currentPlayerData?.last_roll_result && currentPlayerData?.last_roll_result.length > 0) {
      setRollResult(currentPlayerData.last_roll_result);
    }
  }, [currentPlayerData?.last_roll_result, setRollResult]);

  useEffect(() => {
    if (currentPlayerDataError) {
      setMyPlayer(undefined);
      setTurnState(null);
      setMyUser(null);
      setActingUserId(null);
      return;
    }
    // console.log('set my player', currentPlayerData);
    setMyPlayer(currentPlayerData);
    setTurnState(currentPlayerData?.turn_state ?? null);
    setMyUser(currentPlayerData);
  }, [
    currentPlayerData,
    setMyPlayer,
    setTurnState,
    currentPlayerDataError,
    setMyUser,
    setActingUserId,
  ]);

  useEffect(() => {
    setPlayers(playersData?.players ?? []);
  }, [setPlayers, playersData?.players]);

  useEffect(() => {
    setPrisonCards(playersData?.prison_cards ?? []);
  }, [setPrisonCards, playersData?.prison_cards]);

  useEffect(() => {
    if (eventSettingsData?.settings) {
      setEventSettings(eventSettingsData.settings);
      setMainNotification(null);
    }
  }, [setEventSettings, eventSettingsData, setMainNotification]);

  useEffect(() => {
    if (eventSettingsError) {
      setMainNotification({
        text: 'Ошибка загрузки настроек ивента, проверьте записи event_end_time и event_start_time в БД',
        tag: 'event-settings-error',
        variant: 'error',
      });
    }
  }, [eventSettingsError, setMainNotification]);

  const { data: frontVersionData } = useQuery({
    queryKey: ['frontVersion'],
    queryFn: fetchFrontVersion,
    refetchInterval: 60000,
    retry: false,
  });

  useEffect(() => {
    if (!frontVersionData?.version) return;
    if (frontVersionData.version !== import.meta.env.PACKAGE_VERSION && isInactive) {
      window.location.href = window.location.pathname + '?reload=' + new Date().getTime();
    }
  }, [frontVersionData, isInactive]);

  function onPointerMissed() {
    unpin();
    dismiss();
  }

  const enableMetrika = !IS_DEV;

  const isModelSelectionScene = myPlayer && (!myPlayer.model_name || !myPlayer.color);

  return (
    <>
      {enableMetrika && (
        <MetrikaCounter
          id={103476492}
          options={{
            trackHash: true,
            webvisor: false,
          }}
        />
      )}
      {isLoading && <LoadingModal />}
      {!isLoading && (
        <KeyboardControls map={map}>
          <div className="h-screen">
            <CanvasTooltip />
            <TooltipProvider>
              <UI />
            </TooltipProvider>
            {!isMobile || shouldRender3D ? (
              <Canvas onPointerMissed={onPointerMissed} gl={{ toneMapping: 1 }}>
                <Suspense fallback={<SceneLoader />}>
                  <Environment
                    files={`${STORAGE_BASE_URL}/textures/sky2_2k.hdr`}
                    background
                    environmentIntensity={0.7}
                    backgroundIntensity={1.4}
                    backgroundBlurriness={0.06}
                  />

                  {isModelSelectionScene ? <ModelSelectionScene /> : <GameScene />}
                </Suspense>
              </Canvas>
            ) : (
              <div className="w-full h-full bg-black" />
            )}
          </div>
        </KeyboardControls>
      )}
    </>
  );
}

export default App;
