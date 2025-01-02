import React, { useState } from "react";

type GameBoardProps = {
  round: number;
};

const GameBoard: React.FC<GameBoardProps> = ({ round }) => {
  const gridSize = round + 1;
  const totalCells = gridSize * gridSize;

  const [board, setBoard] = useState<string[]>(
    Array.from({ length: totalCells }, (_, index) =>
      index === Math.floor(Math.random() * totalCells) ? "😎" : "😀"
    )
  );
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        gap: "10px",
        maxWidth: "300px",
        margin: "0 auto",
      }}
    >
      {board.map((emoji, index) => (
        <div
          key={index}
          style={{
            width: "60px",
            height: "60px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            border: "1px solid #ccc",
            borderRadius: "8px",
          }}
        >
          {emoji}
        </div>
      ))}
    </div>
  );
};

export default GameBoard;
