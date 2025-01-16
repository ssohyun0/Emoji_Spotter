import React, { useState, useEffect } from "react";
import axios from "axios";

type GameBoardProps = {
  gameRoomId: number;
  round: number;
  answerPosition: number;
  playerId: string;
};

const GameBoard: React.FC<GameBoardProps> = ({
  round,
  answerPosition,
  playerId,
}) => {
  const gridSize = round === 5 ? round * round : (round + 1) * (round + 1);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  useEffect(() => {
    setSelectedIndex(null);
    setIsAnswered(false);
  }, [round]);

  const handleCellClick = async (index: number) => {
    if (selectedIndex !== null || isAnswered) return;
    setSelectedIndex(index);

    const isCorrect = index === answerPosition - 1;
    console.log(`Cell ${index} selected. Answer: ${answerPosition - 1}`);

    if (isCorrect) {
      try {
        setIsAnswered(true);
        const response = await axios.post(`/players/${playerId}/score`);
        console.log("Score updated successfully:", response.data);
      } catch (error) {
        console.error("Failed to update score:", error);
      }
    }
  };
  const board = Array.from({ length: gridSize }, (_, index) => {
    return index === answerPosition - 1 ? "😎" : "😀";
  });

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${round === 5 ? round : round + 1}, 1fr)`,
        gap: "5px",
        maxWidth: "400px",
        margin: "0 auto",
      }}
    >
      {board.map((emoji, index) => (
        <div
          key={index}
          onClick={() => handleCellClick(index)}
          style={{
            width: "50px",
            height: "50px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            border: "1px solid #ddd",
            borderRadius: "5px",
            backgroundColor:
              index === selectedIndex
                ? index === answerPosition - 1
                  ? "#d4edda" // 정답
                  : "#f8d7da" // 오답
                : "#fff",
            cursor: selectedIndex === null ? "pointer" : "not-allowed",
          }}
        >
          {emoji}
        </div>
      ))}
    </div>
  );
};

export default GameBoard;
