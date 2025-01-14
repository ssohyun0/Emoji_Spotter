import { useEffect, useState } from "react";
import axios from "axios";

const GameStartScreen = ({ onGameStart }) => {
  const [roomData, setRoomData] = useState<null | {
    roomId: number;
    players: { playerId: string; score: number }[];
    roomReady: boolean;
  }>(null);
  const [isPlayer1, setIsPlayer1] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Connecting...");

  useEffect(() => {
    const connect = async () => {
      try {
        const response = await axios.post("/connect");
        setRoomData(response.data);
        setIsPlayer1(response.data.players.length === 1);
        setStatusMessage(
          response.data.players.length === 1
            ? "Plz wait. Find another player."
            : "Waiting... The game will be running soon."
        );
      } catch (error) {
        console.error("Failed to connect:", error);
        setStatusMessage("Connection failed. Please retry.");
      }
    };
    connect();
  }, []);

  useEffect(() => {
    if (!roomData) return;

    const socket = new WebSocket(
      `ws://localhost:8080/ws/game?roomId=${roomData.roomId}`
    );

    socket.onopen = () => {
      console.log("WebSocket connected for room:", roomData.roomId);
    };

    socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      console.log("WebSocket message received:", message);

      if (
        isPlayer1 &&
        message.message.includes("Room") &&
        message.message.includes("is ready!")
      ) {
        console.log("Calling broad-room-ready API in 3 seconds...");
        setTimeout(async () => {
          try {
            await axios.post(`/broad-room-ready/${roomData.roomId}`);
            console.log("Broad-room-ready API called successfully.");
          } catch (error) {
            console.error("Failed to call broad-room-ready API:", error);
          }
        }, 3000);

        // Update status message for Player 1
        setStatusMessage("Waiting... The game will be running soon.");
      }

      if (message.message.includes("(모두한테 알림)")) {
        console.log("Game is starting...");
        onGameStart();
      }
    };

    return () => socket.close();
  }, [roomData, isPlayer1, onGameStart]);

  return <div>{statusMessage}</div>;
};

export default GameStartScreen;
