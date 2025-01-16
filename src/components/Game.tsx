import React, { useState, useEffect } from "react";
import axios from "axios";
import { useWebSocketContext } from "../contexts/WebSocketContext";
import GameBoard from "./GameBoard";

type GameProps = {
  roomId: number;
  playerId: string;
  onGameEnd: () => void;
};

interface GameData {
  gameRoomId: number;
  round: number;
  answerPosition: number;
}

const Game: React.FC<GameProps> = ({ roomId, playerId, onGameEnd }) => {
  const { gameMessages } = useWebSocketContext();
  const [gameData, setGameData] = useState<GameData | null>(null);

  useEffect(() => {
    const startRound = async () => {
      try {
        const response = await axios.post(
          `/broad-answer-after-3seconds/${roomId}?round=1`
        );
        console.log("API called successfully : ", response.data);
      } catch (error) {
        console.error("Failed to call API : ", error);
      }
    };
    startRound();
  }, [roomId]);

  useEffect(() => {
    gameMessages.forEach((message) => {
      if (
        message.gameRoomId === roomId &&
        message.round &&
        message.answerPosition
      ) {
        console.log("updating game data : ", message);
        setGameData({
          gameRoomId: message.gameRoomId,
          round: message.round,
          answerPosition: message.answerPosition,
        });

        if (message.round === 5) {
          console.log("Final round completed. Ending game in 3 seconds...");
          setTimeout(() => {
            onGameEnd();
          }, 3000);
        }
      }
    });
  }, [gameMessages, roomId, onGameEnd]);

  return (
    <div>
      {gameData ? (
        <GameBoard
          gameRoomId={gameData.gameRoomId}
          round={gameData.round}
          answerPosition={gameData.answerPosition}
          playerId={playerId}
        />
      ) : (
        <div> Loading game data...</div>
      )}
    </div>
  );
};

export default Game;
