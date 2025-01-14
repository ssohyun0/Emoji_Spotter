import { useState } from "react";
import GameStartScreen from "./components/GameStartScreen";
import Game from "./components/Game";
import "./App.css";

const App = () => {
  const [gameState, setGameState] = useState<"start" | "gameStart" | "game">(
    "start"
  );

  return (
    <div className="app-container">
      {gameState === "start" && <h2>Emoji Game</h2>}
      {gameState === "start" && (
        <button onClick={() => setGameState("gameStart")}>Game Start</button>
      )}
      {gameState === "gameStart" && (
        <GameStartScreen onGameStart={() => setGameState("game")} />
      )}
      {gameState === "game" && <Game />}
    </div>
  );
};

export default App;
