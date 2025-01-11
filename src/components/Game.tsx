import React, { useState } from "react";
import GameBoard from "./GameBoard";

const Game: React.FC<{ roomData: any }> = ({ roomData }) => {
  const [round, setRound] = useState<number>(1);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  const handleNextRound = () => {
    if (round < 5) {
      setRound(round + 1);
    } else {
      setIsGameOver(true);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      {!isGameOver ? (
        <>
          <GameBoard round={round} roomId={roomData.roomId} />
          <button onClick={handleNextRound}>Next Round</button>
        </>
      ) : (
        <div>Game Over</div>
      )}
    </div>
  );
};

export default Game;
