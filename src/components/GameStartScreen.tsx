import React, { useEffect, useState } from "react";
import { useWebSocketContext } from "../contexts/WebSocketContext";
import axios from "axios";

type GameStartScreenProps = {
  onGameStart: () => void;
  roomReady: boolean;
  roomId: number;
};

const GameStartScreen: React.FC<GameStartScreenProps> = ({
  onGameStart,
  roomReady,
  roomId,
}) => {
  const [statusMessage, setStatusMessage] = useState(
    roomReady
      ? "Waiting... The game will start soon."
      : "Please wait. Finding another player..."
  );
  const [apiCalled, setApiCalled] = useState(false); // API 중복 호출 방지

  const { gameStartScreenMessages } = useWebSocketContext();

  // 초기 상태 업데이트
  useEffect(() => {
    setStatusMessage(
      roomReady
        ? "Waiting... The game will start soon."
        : "Please wait. Finding another player..."
    );
  }, [roomReady]);

  // WebSocket 메시지 처리
  useEffect(() => {
    gameStartScreenMessages.forEach((message) => {
      console.log(
        "Received WebSocket message:",
        JSON.stringify(message, null, 2)
      );
      console.log("Received WebSocket message:", message); // 메시지 로그 확인

      if (message.message === `Room ${roomId} is ready!` && !apiCalled) {
        console.log(
          "Room is ready! Updating status message and calling API..."
        );
        setStatusMessage("Waiting... The game will start soon.");
        setApiCalled(true);

        setTimeout(async () => {
          try {
            await axios.post(`/broad-room-ready/${roomId}`);
            console.log("/board-room-ready API called successfully.");
          } catch (error) {
            console.error("Failed to call /board-room-ready API:", error);
          }
        }, 3000);
      }

      if (message.message?.includes("(모두한테 알림)")) {
        console.log("Game is starting...");
        onGameStart();
      }
    });
  }, [gameStartScreenMessages, onGameStart, apiCalled, roomId]);

  return <div>{statusMessage}</div>;
};

export default GameStartScreen;
