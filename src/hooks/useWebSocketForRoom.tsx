import { useState, useEffect, useRef } from "react";

type RoomState = {
  boardSize: number;
  answerNumber: number;
};

const useWebSocketForRoom = (url: string, roomId: string | null) => {
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  const connectToWebSocket = (roomId: string) => {
    // 기존 연결이 닫히지 않았으면 닫기
    if (socketRef.current) {
      if (socketRef.current.readyState === WebSocket.OPEN) {
        console.warn("Closing existing WebSocket connection...");
        socketRef.current.close();
      }
    }

    const socket = new WebSocket(`${url}?roomId=${roomId}`);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connected");
    };

    socket.onmessage = (event) => {
      const rawMessage = event.data;
      console.log("Message received:", event.data);
      try {
        const parsedMessage = parseTextMessage(rawMessage);
        if (parsedMessage) {
          setRoomState(parsedMessage);
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", rawMessage);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };
  };

  // 텍스트 메시지를 파싱하여 boardSize와 answerNumber 추출
  const parseTextMessage = (message: string): RoomState | null => {
    const regex = /방 번호: \d+\s+Round\d+\s+정답 위치: (\d+)/;
    const match = message.match(regex);
    if (match) {
      const [, answerNumber] = match;
      const boardSize = Math.sqrt(parseInt(answerNumber, 10) + 1); // 동적 계산
      return {
        boardSize,
        answerNumber: parseInt(answerNumber, 10),
      };
    }
    return null;
  };

  return { roomState, connectToWebSocket };
};

export default useWebSocketForRoom;
