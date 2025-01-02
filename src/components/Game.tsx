import React, { useState } from "react";
import GameBoard from "./GameBoard";

const Game: React.FC = () => {
  const [round, setRound] = useState<number>(1); // 현재 라운드 상태
  const [isGameOver, setIsGameOver] = useState<boolean>(false); // 게임 종료 상태

  // 다음 라운드로 진행
  const handleNextRound = () => {
    if (round < 5) {
      setRound(round + 1); // 라운드 증가
    } else {
      setIsGameOver(true); // 마지막 라운드 종료 후 게임 종료 상태로 변경
    }
  };

  return (
    <div>
      {!isGameOver ? (
        <>
          <GameBoard round={round} />
        </>
      ) : (
        <div>Game Over</div>
      )}
    </div>
  );
};

export default Game;