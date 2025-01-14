import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import useWebSocket from "../hooks/useWebSocket";

type GameStartScreenProps = {
  onGameStart: () => void;
};

const GameStartScreen: React.FC<GameStartScreenProps> = ({ onGameStart }) => {
  const [roomData, setRoomData] = useState<null | {
    roomId: number;
    players: { playerId: string; score: number }[];
    roomReady: boolean;
  }>(null);
  const [isPlayer1, setIsPlayer1] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Connecting...");
  const [apiCalled, setApiCalled] = useState(false); // API 중복 호출 방지

  // /connect API 호출
  useEffect(() => {
    const connect = async () => {
      try {
        const response = await axios.post("/connect");
        setRoomData(response.data);
        setIsPlayer1(response.data.players.length === 1);
        setStatusMessage(
          response.data.players.length === 1
            ? "Please wait. Finding another player..."
            : "Waiting... The game will start soon."
        );
      } catch (error) {
        console.error("Failed to connect:", error);
        setStatusMessage("Connection failed. Please refresh and try again.");
      }
    };
    connect();
  }, []);

  // WebSocket 메시지 처리 핸들러
  const handleWebSocketMessage = useCallback(
    (message: string) => {
      if (
        isPlayer1 &&
        message === `Room ${roomData?.roomId} is ready!` &&
        !apiCalled
      ) {
        console.log("Calling broad-room-ready API in 3 seconds...");
        setApiCalled(true); // API 호출 상태 업데이트
        setTimeout(async () => {
          try {
            await axios.post(`/broad-room-ready/${roomData?.roomId}`);
            console.log("Broad-room-ready API called successfully.");
          } catch (error) {
            console.error("Failed to call broad-room-ready API:", error);
          }
        }, 3000);
        setStatusMessage("Waiting... The game will start soon.");
      }

      if (message.includes("(모두한테 알림)")) {
        console.log("Game is starting...");
        onGameStart();
      }
    },
    [isPlayer1, roomData, onGameStart, apiCalled]
  );

  // WebSocket 연결: roomData가 유효할 때만 호출
  const { messages } = useWebSocket(
    roomData?.roomId ?? null,
    handleWebSocketMessage
  );

  return <div>{statusMessage}</div>;
};

export default GameStartScreen;
