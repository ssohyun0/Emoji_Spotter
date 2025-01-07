import React from "react";

interface GameStartScreenProps {
  onStart: () => void;
  isLoading: boolean;
}

const GameStartScreen: React.FC<GameStartScreenProps> = ({
  onStart,
  isLoading,
}) => {
  return (
    <div className="game-start-screen">
      <h1>Emoji Game</h1>
      <button onClick={onStart} disabled={isLoading}>
        {isLoading ? "Connecting..." : "Start Game"}
      </button>
    </div>
  );
};
export default GameStartScreen;
