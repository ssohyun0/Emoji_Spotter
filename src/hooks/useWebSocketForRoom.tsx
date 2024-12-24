import { useState, useEffect, useRef } from "react";

type PlayerState = {
  playerId: string;
  isReady: boolean;
};

type RoomState = {
  players: PlayerState[];
  roomId: string;
  isRoomReady: boolean;
};

const useWebSocketForRoom = (url: string, roomId: string) => {
  const [roomState, setRoomState] = useState<RoomState>({
    players: [],
    roomId,
    isRoomReady: false,
  });

  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket(url);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("Connected to WebSocket server");
      setIsConnected(true);

      socket.send(
        JSON.stringify({
          type: "join",
          roomId,
        })
      );
    };
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Message from server : ", data);

      if (data.type === "roomUpdate") {
        setRoomState((prev: RoomState) => ({
          ...prev,
          players: data.players,
          isRoomReady: data.players.length === 2,
        }));
      }
    };

    socket.onclose = () => {
      console.log("Disconnected from WebSocket server");
      setIsConnected(false);
    };

    return () => {
      socket.close();
    };
  }, [url, roomId]);

  const sendReadyState = (isReady: boolean) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
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
