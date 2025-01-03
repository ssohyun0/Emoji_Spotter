import React, { useState, useEffect } from "react";

type GameBoardProps = {
  round: number;
};

const GameBoard: React.FC<GameBoardProps> = ({ round }) => {
  const gridSize = round < 5 ? round + 1 : 5;
  const totalCells = gridSize * gridSize;

  const [board, setBoard] = useState<string[]>([]);

  useEffect(() => {
    const newBoard = Array.from({ length: totalCells }, (_, index) =>
      index === Math.floor(Math.random() * totalCells) ? "😎" : "😀"
    );
    setBoard(newBoard);
  }, [round]);

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
