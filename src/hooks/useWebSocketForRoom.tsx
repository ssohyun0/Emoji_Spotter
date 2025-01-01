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

type ServerMessage = {
  type: "roomUpdate";
  roomId: string;
  players: PlayerState[];
  isRoomReady: boolean;
};

const useWebSocketForRoom = (url: string, roomId: string | null) => {
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
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
      const data = JSON.parse(event.data) as ServerMessage;
      console.log("Message from server:", data);

      if (data.type === "roomUpdate") {
        setRoomState(data); // 서버에서 받은 방 상태 업데이트
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false); // 연결 실패로 상태 업데이트
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
  };
};

export default useWebSocketForRoom;
