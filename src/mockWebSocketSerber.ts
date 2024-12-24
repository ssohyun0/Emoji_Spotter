import { Server } from "mock-socket";

export const createMockServer = () => {
  const mockServer = new Server("ws://localhost:4000");

  mockServer.on("connection", (socket) => {
    console.log("Client connected to Mock WebSocket Server");

    // 방 참가 메시지 처리
    socket.on("message", (data) => {
      const parsedData = JSON.parse(data as string);

      if (parsedData.type === "join") {
        console.log(`Player joined room: ${parsedData.roomId}`);
        socket.send(
          JSON.stringify({
            type: "roomUpdate",
            players: [
              { playerId: "Player1", isReady: true },
              { playerId: "Player2", isReady: false },
            ],
            isRoomReady: false,
          })
        );
      }

      if (parsedData.type === "ready") {
        console.log(`Player is ready: ${parsedData.isReady}`);
        socket.send(
          JSON.stringify({
            type: "roomUpdate",
            players: [
              { playerId: "Player1", isReady: true },
              { playerId: "Player2", isReady: true },
            ],
            isRoomReady: true,
          })
        );
      }
    });
  });

  return mockServer;
};
