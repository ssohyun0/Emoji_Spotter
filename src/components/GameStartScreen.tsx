const GameStartScreen = ({ onStart }: { onStart: () => void }) => {
  return (
    <div>
      <h1>Emoji Game</h1>
      <button onClick={onStart}>Game Start</button>
    </div>
  );
};

export default GameStartScreen;
