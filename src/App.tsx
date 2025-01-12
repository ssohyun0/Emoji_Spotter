import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import GameStartScreen from "./components/GameStartScreen";
import Game from "./components/Game";
import "./App.css";

const App = () => {
  const [gameState, setGameState] = useState<
    "start" | "waiting" | "playing" | "end"
  >("start");

  const [roomData, setRoomData] = useState<null | {
    roomId: number;
    players: { playerId: string; score: number }[];
    roomReady: boolean;
  }>(null);

  const [serverMessage, setServerMessage] = useState<string | null>(null);

  const connectMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post("/connect");
      return response.data;
    },
  });

  const handleGameStart = async () => {
    try {
      const data = await connectMutation.mutateAsync();
      console.log("Connected to room:", data);

      setRoomData({
        roomId: data.roomId,
        players: data.players,
        roomReady: data.roomReady,
      });

      if (data.roomReady) {
        setGameState("playing");
      } else {
        setGameState("waiting");
      }
    } catch (error) {
      console.error("Failed to connect:", error);
    }
  };

  // WebSocket 연결 및 메시지 처리
  useEffect(() => {
    if (!roomData || !roomData.roomId) return;

    const socket = new WebSocket(
      `ws://localhost:8080/ws/game?roomId=${roomData.roomId}`
    );

    socket.onopen = () => {
      console.log("Connected to WebSocket server");
    };

    socket.onmessage = (event) => {
      const message = event.data;
      console.log("Message from WebSocket:", message);

      if (message.includes("is ready!")) {
        setServerMessage(message);
        setGameState("playing");
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [roomData]);

  return (
    <div className="app-container">
      {gameState === "start" && (
        <GameStartScreen
          onStart={handleGameStart}
          isLoading={connectMutation.isLoading}
        />
      )}
      {gameState === "waiting" && (
        <div>
          <p>Waiting for another player to join...</p>
          {serverMessage && <p>{serverMessage}</p>}
        </div>
      )}
      {gameState === "playing" && roomData && <Game roomData={roomData} />}
    </div>
  );
};

export default App;
