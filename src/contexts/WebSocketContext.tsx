import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

// Define message types
interface Message {
  message?: string;
  gameRoomId?: number;
  round?: number;
  answerPosition?: number;
}

interface WebSocketContextProps {
  sendMessage: (message: string) => void;
  gameStartScreenMessages: Message[];
  gameMessages: Message[];
}

const WebSocketContext = createContext<WebSocketContextProps | null>(null);

interface WebSocketProviderProps {
  roomId: number; // roomId는 필수
  children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  roomId,
  children,
}) => {
  const socketRef = useRef<WebSocket | null>(null);
  const [gameStartScreenMessages, setGameStartScreenMessages] = useState<
    Message[]
  >([]);
  const [gameMessages, setGameMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!roomId) {
      console.warn("WebSocketProvider: Invalid roomId provided.");
      return;
    }

    const ws = new WebSocket(`ws://localhost:8080/ws/game?roomId=${roomId}`);
    socketRef.current = ws;

    ws.onopen = () => console.log(`WebSocket connected for room: ${roomId}`);

    ws.onmessage = (event) => {
      try {
        const message: Message = JSON.parse(event.data);
        handleMessage(message);
      } catch (error) {
        console.error("WebSocket message parsing error:", error);
      }
    };

    ws.onerror = (error) => console.error("WebSocket error:", error);
    ws.onclose = () => console.log("WebSocket closed");

    return () => {
      ws.close();
      socketRef.current = null;
    };
  }, [roomId]);

  const handleMessage = (message: Message) => {
    const { message: msg, gameRoomId, round, answerPosition } = message;

    if (msg?.includes("Room") && msg?.includes("is ready!")) {
      setGameStartScreenMessages((prev) => [...prev, message]);
    } else if (gameRoomId && round && answerPosition) {
      setGameMessages((prev) => [...prev, message]);
    } else {
      console.warn("Unrecognized message format:", message);
    }
  };

  const sendMessage = (message: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(message);
    } else {
      console.warn("WebSocket is not open. Message not sent:", message);
    }
  };

  return (
    <WebSocketContext.Provider
      value={{
        sendMessage,
        gameStartScreenMessages,
        gameMessages,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error(
      "useWebSocketContext must be used within a WebSocketProvider"
    );
  }
  return context;
};
