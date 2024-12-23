import { useState } from "react";
import GameStartScreen from "./components/GameStartScreen";

const App = () => {
  const [gameState, setGameState] = useState<"start" | "playing" | "end">(
    "start"
  );
  const [scores, setScores] = useState<{ player1: number; player2: number }>({
    player1: 0,
    player2: 0,
  });

  return (
    <div>
      {gameState === "start" && (
        <GameStartScreen onStart={() => setGameState("playing")} />
      )}
    </div>
  );
};
export default App;
