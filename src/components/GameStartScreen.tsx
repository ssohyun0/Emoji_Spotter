import React from "react";

const GameStartScreen = ({
  onStart,
  isLoading,
}: {
  onStart: () => void;
  isLoading: boolean;
}) => {
  return (
    <div>
      <h1>Emoji Game</h1>
      <button onClick={onStart} disabled={isLoading}>
        {isLoading ? "Connecting..." : "Game Start"}
      </button>
    </div>
  );
};

export default GameStartScreen;
