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
  const [selectedCell, setSelectedCell] = useState<number | null>(null); // 선택된 셀 상태

  const { connectToWebSocket, roomState } = useWebSocketForRoom(
    `ws://localhost:8080/ws/game`,
    roomId
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

  // API 호출 및 WebSocket 연결
  useEffect(() => {
    const initializeBoard = async () => {
      connectToWebSocket(roomId); // 먼저 WebSocket 연결

      try {
        await axios.get(`/rooms/${roomId}/next-round?round=${round}`); // API 호출
      } catch (error) {
        console.error("Failed to fetch board data:", error);
      }
    };

    initializeBoard();
    setSelectedCell(null); // 라운드 변경 시 선택된 셀 초기화
  }, [round, roomId]);

  // WebSocket 메시지 처리 및 보드 생성
  useEffect(() => {
    if (roomState?.answerNumber !== undefined) {
      const newBoard = Array.from({ length: gridSize * gridSize }, (_, index) =>
        index === roomState.answerNumber ? "😎" : "😀"
      );
      setBoard(newBoard);
      setLoading(false);
    }
  }, [roomState, gridSize]);

  // 셀 클릭 핸들러
  const handleCellClick = (index: number) => {
    if (selectedCell !== null) return; // 이미 셀이 선택되었으면 클릭 비활성화
    setSelectedCell(index);

    // 클릭한 셀이 정답인지 확인 (추가 서버 호출 가능)
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
          onClick={() => handleCellClick(index)} // 셀 클릭 핸들러 연결
          style={{
            width: "60px",
            height: "60px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            border: "1px solid #ccc",
            borderRadius: "8px",
            cursor: selectedCell === null ? "pointer" : "not-allowed", // 선택 가능 여부에 따라 커서 변경
            backgroundColor: selectedCell === index ? "#d1ffd6" : "white", // 선택된 셀의 배경색 변경
          }}
        >
          {emoji}
        </div>
      ))}
    </div>
  );
};

export default GameBoard;
