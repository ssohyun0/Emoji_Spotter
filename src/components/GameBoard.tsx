import React, { useState, useEffect } from "react";

interface GameBoardProps {
  roomId: number;
  socket: WebSocket;
}

const GameBoard: React.FC<GameBoardProps> = ({ roomId, socket }) => {
  const [board, setBoard] = useState<string[]>([]);
  const [round, setRound] = useState<number>(0);
  const [answerPosition, setAnswerPosition] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);

        if (message.gameRoomId === roomId) {
          const { round, answerPosition } = message;

          setRound(round);
          setAnswerPosition(answerPosition);

          // Calculate board size and populate board
          const boardSize = (round + 1) * (round + 1);
          const newBoard = Array.from({ length: boardSize }, (_, index) =>
            index === answerPosition ? "😎" : "😀"
          );

          setBoard(newBoard);
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    socket.addEventListener("message", handleMessage);

    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [socket, roomId]);

  const handleCellClick = (index: number) => {
    if (index === answerPosition) {
      console.log("Correct cell clicked!", index);
    } else {
      console.log("Wrong cell clicked!", index);
    }
  };

  if (loading) return <div>Loading...</div>;

  const gridSize = round + 1;

  return (
    <div>
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
            onClick={() => handleCellClick(index)}
            style={{
              width: "60px",
              height: "60px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              border: "1px solid #ccc",
              borderRadius: "8px",
              cursor: "pointer",
              backgroundColor: index === answerPosition ? "#d1ffd6" : "white",
            }}
          >
            {emoji}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameBoard;
