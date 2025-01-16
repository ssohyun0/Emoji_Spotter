import React, { useEffect, useState } from "react";
import axios from "axios";

type GameEndScreenProps = {
  roomId: number;
  playerId: string;
};

const GameEndScreen: React.FC<GameEndScreenProps> = ({ roomId, playerId }) => {
  const [scores, setScores] = useState<{ [key: string]: number } | null>(null);
  const [result, setResult] = useState<string>("");

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const response = await axios.get(`/rooms/${roomId}/scores`);
        setScores(response.data);
      } catch (error) {
        console.error("Failed to fetch scores:", error);
      }
    };

    fetchScores();
  }, [roomId]);

  useEffect(() => {
    if (scores) {
      const player1Id = Object.keys(scores)[0];
      const player2Id = Object.keys(scores)[1];
      const player1Score = scores[player1Id];
      const player2Score = scores[player2Id];

      let resultMessage = "";

      if (player1Score > player2Score) {
        resultMessage = playerId === player1Id ? "Victory!" : "Defeat!";
      } else if (player1Score < player2Score) {
        resultMessage = playerId === player2Id ? "Victory!" : "Defeat!";
      } else {
        resultMessage = "Draw!";
      }

      setResult(`${resultMessage} ${player1Score} : ${player2Score}`);
    }
  }, [scores, playerId]);

  if (!scores) {
    return <div>Loading scores...</div>;
  }

  return (
    <div>
      <h2>Game Over</h2>
      <p>{result}</p>
    </div>
  );
};

export default GameEndScreen;
