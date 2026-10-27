import React from 'react';

export const EvaluationBar = ({
  score = 0, // In pawns, positive favors white, negative favors black
  visible = true,
  playerColor = 'white',
}) => {
  if (!visible) return null;

  // Clamp score between -10 and +10 for visual bar
  const clamped = Math.max(-10, Math.min(10, score));
  // White percentage: 0 at -10, 50 at 0, 100 at +10
  const whitePercent = 50 + (clamped / 20) * 100;
  // If player is black, invert bar orientation so bottom matches player's side
  const bottomPercent = playerColor === 'black' ? 100 - whitePercent : whitePercent;

  const displayScore = score > 0 ? `+${score.toFixed(1)}` : score.toFixed(1);

  return (
    <div
      className="relative flex flex-col justify-end w-2.5 sm:w-3 h-full min-h-[280px] rounded-full overflow-hidden bg-[#21262D] border border-[#30363D] shadow-inner select-none transition-all duration-300"
      title={`Evaluation: ${displayScore}`}
    >
      <div
        className="w-full bg-[#F0D9B5] transition-all duration-300 ease-out"
        style={{ height: `${bottomPercent}%` }}
      />
    </div>
  );
};

export default EvaluationBar;
