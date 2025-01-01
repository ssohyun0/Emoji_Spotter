import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import GameStartScreen from "./components/GameStartScreen";

const App = () => {
  const [gameState, setGameState] = useState<"start" | "playing" | "end">(
    "start"
  );

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
    } catch (error) {
      console.error("Failed to connect:", error);
    }
  };

  return (
    <div>
      {gameState === "start" && (
        <GameStartScreen
          onStart={handleGameStart}
          isLoading={connectMutation.isLoading}
        />
      )}
      {gameState === "playing" && (
        <div>
          <h1>Game is now playing...</h1>
          {/* 추후 GameBoard.tsx를 여기에 추가 */}
        </div>
      )}
    </div>
  );
};

export default App;
