import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import "./App.css";
import GameStartScreen from "./components/GameStartScreen";
import Game from "./components/Game";

const App = () => {
  const [gameState, setGameState] = useState<
    "start" | "waiting" | "playing" | "end"
  >("start");

  const [roomData, setRoomData] = useState<null | {
    roomId: Number;
    players: { playerId: String; score: Number }[];
    roomReady: Boolean;
    roundAnswers: { [key: String]: String | null };
  }>(null);

  const connectMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post("/connect");
      return response.data;
    },
  });

  const handleGameStart = async () => {
    try {
      const data = await connectMutation.mutateAsync();
      console.log("Connected to room:", data); // API 호출 결과 확인
      setGameState("playing"); // Game Board 화면으로 전환

      setRoomData({
        roomId: data.roomId,
        players: data.players,
        roomReady: data.roomReady,
        roundAnswers: {
          round1Answer: data.round1Answer,
          round2Answer: data.round2Answer,
          round3Answer: data.round3Answer,
          round4Answer: data.round4Answer,
          round5Answer: data.round5Answer,
        },
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
          <p>Waiting for another player to join..</p>
        </div>
      )}
      {gameState === "playing" && (
        <div>
          <Game roomData={roomData} />
        </div>
      )}
    </div>
  );
};

export default App;
