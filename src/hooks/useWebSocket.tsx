import { useState, useEffect, useRef } from "react";

const useWebSocket = (
  roomId: number | null,
  onMessage: (message: string) => void
): { messages: string[]; sendMessage: (message: string) => void } => {
  const [messages, setMessages] = useState<string[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (roomId == null) {
      console.warn("Invalid roomId provided. Skipping WebSocket connection.");
      return;
    }

    // 이미 연결된 소켓이 있는 경우 닫음
    if (socketRef.current) {
      socketRef.current.close();
    }

    const ws = new WebSocket(`ws://localhost:8080/ws/game?roomId=${roomId}`);
    socketRef.current = ws;

    ws.onopen = () => console.log(`WebSocket connected for room: ${roomId}`);
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data).message;
      console.log("WebSocket message received:", message); // 추가함
      setMessages((prev) => [...prev, message]);
      onMessage(message);
    };
    ws.onerror = (error) => console.error("WebSocket error:", error);
    ws.onclose = () => console.log("WebSocket closed");

    return () => {
      ws.close();
      socketRef.current = null;
    };
  }, [roomId, onMessage]);

  const sendMessage = (message: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(message);
    } else {
      console.warn("WebSocket is not open. Message not sent:", message);
    }
  };
  return { messages, sendMessage };
};

export default useWebSocket;
