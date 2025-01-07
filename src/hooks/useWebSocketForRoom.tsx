import { useEffect, useRef, useState } from "react";

type PlayerState = {
  playerId: string;
  score: number;
};

type RoomState = {
  players: PlayerState[];
  roomId: string;
  isRoomReady: boolean;
};

const useWebSocketForRoom = (url: string, roomId: string | null) => {
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [serverMessage, setServerMessage] = useState<string | null>(null); // 서버 메시지를 저장할 상태
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!roomId) {
      setRoomState(null); // roomId가 없으면 상태 초기화
      return;
    }

    const socket = new WebSocket(`${url}?roomId=${roomId}`);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("Connected to WebSocket server");
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const message = event.data; // 메시지가 단순 텍스트일 경우
        console.log("Message received from server:", message);

        if (message.includes("is ready!")) {
          setServerMessage(message); // 메시지를 상태에 저장
          console.log("Server message:", message);
        }
      } catch (error) {
        console.error("Failed to handle WebSocket message:", event.data);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };

    socket.onclose = () => {
      console.log("Disconnected from WebSocket server");
      setIsConnected(false);
    };

    // WebSocket 정리
    return () => {
      if (socket) {
        socket.onopen = null;
        socket.onmessage = null;
        socket.onclose = null;
        socket.onerror = null;
        socket.close();
      }
    };
  }, [url, roomId]);

  const isWebSocketOpen = () =>
    socketRef.current && socketRef.current.readyState === WebSocket.OPEN;

  const sendReadyState = (isReady: boolean) => {
    if (isWebSocketOpen()) {
      socketRef.current!.send(
        JSON.stringify({
          type: "ready",
          roomId,
          isReady,
        })
      );
    }
  };

  return {
    roomState,
    isConnected,
    sendReadyState,
    serverMessage, // 서버 메시지를 반환
  };
};

export default useWebSocketForRoom;
