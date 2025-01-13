import React, { useState, useEffect } from "react";
import axios from "axios";
import useWebSocketForRoom from "../hooks/useWebSocketForRoom";

type GameBoardProps = {
  round: number;
  roomId: string;
};

const GameBoard: React.FC<GameBoardProps> = ({ round, roomId, setRound }) => {
  const [board, setBoard] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [broadAnswerCalled, setBroadAnswerCalled] = useState<boolean>(false);

  const { connectToWebSocket, roomState } = useWebSocketForRoom(
    `ws://localhost:8080/ws/game`
  );

  const calculateGridSize = (round: number): number => {
    if (round === 1) return 2;
    if (round === 2) return 3;
    if (round === 3) return 4;
    if (round >= 4) return 5;
    return 2;
  };

  const gridSize = calculateGridSize(round);

  useEffect(() => {
    if (roomId) {
      console.log(`Connecting WebSocket for roomId: ${roomId}`);
      connectToWebSocket(roomId);
    }
  }, [roomId]);

  useEffect(() => {
    const initializeBoard = async () => {
      try {
        if (round === 1 || broadAnswerCalled) {
          const nextRoundResponse = await axios.get(
            `/rooms/${roomId}/next-round?round=${round}`
          );
          console.log("next-round API response:", nextRoundResponse.data);

          const response = await axios.post(
            `/broad-answer/${roomId}?round=${round}`
          );
          console.log("broad-answer API response:", response.data);
          setBroadAnswerCalled(true);
        }
      } catch (error) {
        console.error("Error calling broad-answer API:", error);
      }
    };

    initializeBoard();
  }, [round, roomId]);

  useEffect(() => {
    if (broadAnswerCalled && roomState?.answerNumber !== undefined) {
      const newBoard = Array.from({ length: gridSize * gridSize }, (_, index) =>
        index === roomState.answerNumber - 1 ? "😎" : "😀"
      );
      setBoard(newBoard);
      setLoading(false);

      // 5초 후 자동으로 다음 라운드로 이동 (2~5 라운드만)
      if (round >= 2 && round <= 5) {
        const timer = setTimeout(() => {
          setRound(round + 1);
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [roomState, broadAnswerCalled, gridSize, round, setRound]);

  useEffect(() => {
    setSelectedCell(null);
  }, [round]);

  const handleCellClick = (index: number) => {
    if (selectedCell !== null) return;
    setSelectedCell(index);

    if (roomState?.answerNumber === index) {
      console.log("Correct cell clicked!", index);
    } else {
      console.log("Wrong cell clicked!", index);
    }
  };

  if (loading) return <div>Loading...</div>;

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
              cursor: selectedCell === null ? "pointer" : "not-allowed",
              backgroundColor: selectedCell === index ? "#d1ffd6" : "white",
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
