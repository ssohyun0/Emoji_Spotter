import React, { useState, useEffect } from "react";
import axios from "axios";
import useWebSocketForRoom from "../hooks/useWebSocketForRoom";

type GameBoardProps = {
  round: number;
  roomId: string;
};

const GameBoard: React.FC<GameBoardProps> = ({ round, roomId }) => {
  const [board, setBoard] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [broadAnswerCalled, setBroadAnswerCalled] = useState<boolean>(false);

  const { connectToWebSocket, roomState } = useWebSocketForRoom(
    `ws://localhost:8080/ws/game`
  );

  // 라운드에 따라 그리드 크기 결정
  const calculateGridSize = (round: number): number => {
    if (round === 1) return 2;
    if (round === 2) return 3;
    if (round === 3) return 4;
    if (round >= 4) return 5;
    return 2; // 기본값
  };

  const gridSize = calculateGridSize(round);

  useEffect(() => {
    if (roomId) {
      console.log(`Connecting WebSocket for roomId: ${roomId}`);
      connectToWebSocket(roomId);
    }
  }, [roomId]);

  // API 호출 및 WebSocket 연결
  useEffect(() => {
    const initializeBoard = async () => {
      try {
        // console.log(
        //   `Calling broad-answer API for room: ${roomId}, round: ${round}`
        // );
        const nextRoundResponse = await axios.get(
          `/rooms/${roomId}/next-round?round=${round}`
        );
        console.log("next-round API response:", nextRoundResponse.data);

        const response = await axios.post(
          `/broad-answer/${roomId}?round=${round}`
        );
        console.log("broad-answer API response:", response.data);
        setBroadAnswerCalled(true);
      } catch (error) {
        console.error("Error calling broad-answer API:", error);
      }
    };

    initializeBoard();
  }, [round, roomId]);

  // WebSocket 메시지 처리 및 보드 생성
  useEffect(() => {
    console.log(
      "RoomState:",
      roomState,
      "BroadAnswerCalled:",
      broadAnswerCalled
    );
    if (broadAnswerCalled && roomState?.answerNumber !== undefined) {
      const newBoard = Array.from({ length: gridSize * gridSize }, (_, index) =>
        index === roomState.answerNumber - 1 ? "😎" : "😀"
      );
      console.log("Generated board:", newBoard);
      setBoard(newBoard);
      setLoading(false);
    }
  }, [roomState, broadAnswerCalled, gridSize]);

  // 라운드 변경 시 selectedCell 초기화
  useEffect(() => {
    setSelectedCell(null);
    console.log("Selected cell reset for new round.");
  }, [round]);

  // 셀 클릭 핸들러
  const handleCellClick = (index: number) => {
    if (selectedCell !== null) return; // 이미 셀이 선택되었으면 클릭 비활성화
    setSelectedCell(index);

    if (roomState?.answerNumber === index) {
      console.log("Correct cell clicked!", index);
    } else {
      console.log("Wrong cell clicked!", index);
    }
  };

  if (loading) return <div>Loading...</div>;

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
  );
};

export default GameBoard;
