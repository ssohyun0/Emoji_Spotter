import { useState, useEffect, useRef } from "react";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import axios from "axios";
import GameStartScreen from "./components/GameStartScreen";
import Game from "./components/Game";
import "./App.css";

const App = () => {
  const [gameState, setGameState] = useState<
    "start" | "loading" | "waiting" | "playing" | "end"
  >("start");

  const [roomData, setRoomData] = useState<null | {
    roomId: number;
    players: { playerId: string; score: number }[];
    roomReady: boolean;
  }>(null);

  const [serverMessage, setServerMessage] = useState<string | null>(null);

  // API 호출 상태 관리
  const isBroadRoomReadyCalled = useRef(false);

  const connectMutation: UseMutationResult<
    {
      roomId: number;
      players: { playerId: string; score: number }[];
      roomReady: boolean;
    },
    Error,
    void
  > = useMutation({
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
        setGameState("loading");
      } else {
        setGameState("waiting");
      }
    } catch (error) {
      console.error("Failed to connect:", error);
    }
  };

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
        setGameState("loading");

        // 3초 후에 broad-room-ready API 호출 (한 번만 실행)
        if (!isBroadRoomReadyCalled.current) {
          isBroadRoomReadyCalled.current = true;
          setTimeout(async () => {
            try {
              const response = await axios.post(
                `http://localhost:8080/broad-room-ready/${roomData.roomId}`
              );
              console.log("Broad-room-ready response:", response.data);
            } catch (error) {
              console.error("Failed to broadcast room ready:", error);
            }
          }, 3000);
        }
      }

      // 모든 클라이언트가 브로드캐스트 메시지를 수신한 후 보드판 표시
      if (
        message.includes("(모두한테 알림)Room") &&
        message.includes("is ready!")
      ) {
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
          isLoading={connectMutation.status === "pending"}
        />
      )}
      {gameState === "waiting" && (
        <div>
          <p>Waiting for another player to join...</p>
          {serverMessage && <p>{serverMessage}</p>}
        </div>
      )}
      {gameState === "loading" && (
        <div>
          <p>Loading... Please wait.</p>
          {serverMessage && <p>{serverMessage}</p>}
        </div>
      )}
      {gameState === "playing" && roomData && <Game roomData={roomData} />}
    </div>
  );
};

export default App;
