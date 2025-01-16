import { useState } from "react";
import GameStartScreen from "./components/GameStartScreen";
import Game from "./components/Game";
import GameEndScreen from "./components/GameEndScreen";
import "./App.css";
import { WebSocketProvider } from "./contexts/WebSocketContext";
import axios from "axios";

const App = () => {
  const [gameState, setGameState] = useState<
    "start" | "gameStart" | "game" | "end"
  >("start");
  const [roomId, setRoomId] = useState<number | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [roomReady, setRoomReady] = useState(false);
  const [webSocketReady, setWebSocketReady] = useState(false);

  const handleGameStart = async () => {
    try {
      setStatusMessage("Connecting...");
      const response = await axios.post("/connect");
      const roomId = response.data.roomId;
      const players = response.data.players;

      if (!roomId || !players || players.length === 0) {
        console.error("Invalid response:", response.data);
        throw new Error("Invalid roomId or players received from /connect API");
      }

      // 현재 클라이언트의 playerId 찾기
      const playerIndex = players.length - 1; // 배열의 마지막 요소가 현재 플레이어
      const playerId = players[playerIndex]?.playerId;

      if (!playerId) {
        console.error("Unable to determine playerId:", response.data);
        throw new Error("Player ID is missing in the response");
      }

      setRoomId(roomId);
      setPlayerId(playerId);
      setRoomReady(response.data.roomReady);
      setWebSocketReady(true); // WebSocket 연결 준비 완료
      setGameState("gameStart");

      console.log("Room ID:", roomId);
      console.log("Player ID:", playerId);
    } catch (error) {
      console.error("Failed to connect:", error);
      setStatusMessage("Connection failed. Please refresh and try again.");
    }
  };

  if (gameState === "start") {
    return (
      <div className="app-container">
        <h2>Emoji Game</h2>
        <button onClick={handleGameStart}>Game Start</button>
        <div>{statusMessage}</div>
      </div>
    );
  }

  if (!roomId || !webSocketReady || !playerId) {
    return <div>{statusMessage}</div>; // roomId 또는 WebSocket이 준비되지 않은 경우 로딩 메시지 표시
  }

  return (
    <WebSocketProvider roomId={roomId}>
      <div className="app-container">
        {gameState === "gameStart" && (
          <GameStartScreen
            onGameStart={() => setGameState("game")}
            roomReady={roomReady}
            roomId={roomId}
          />
        )}
        {gameState === "game" && (
          <Game
            roomId={roomId}
            playerId={playerId}
            onGameEnd={() => setGameState("end")}
          />
        )}
        {gameState === "end" && (
          <GameEndScreen roomId={roomId} playerId={playerId} />
        )}
      </div>
    </WebSocketProvider>
  );
};

export default App;
