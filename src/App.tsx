import { useState } from "react";
import GameStartScreen from "./components/GameStartScreen";
import useWebSocketForRoom from "./hooks/useWebSocketForRoom";

const App = () => {
  const [gameState, setGameState] = useState<"start" | "playing" | "end">(
    "start"
  );
  const roomId = "mock-room"; // 추후 동적 생성으로 변경
  const { roomState, isConnected, sendReadyState } = useWebSocketForRoom(
    "ws://localhost:4000",
    roomId
  );
  // const [scores, setScores] = useState<{ player1: number; player2: number }>({
  //   player1: 0,
  //   player2: 0,
  // });

  return (
    <div>
      {gameState === "start" && (
        <GameStartScreen
          onStart={() => {
            sendReadyState(true);
            setGameState("playing");
          }}
          isRoomReady={roomState.isRoomReady}
          isConnected={isConnected}
        />
      )}
    </div>
  );
};
export default App;
