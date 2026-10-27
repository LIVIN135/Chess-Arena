import React from 'react';

export const EvalBar = ({ evaluation = 0, orientation = 'white' }) => {
  // Convert centipawn / pawn evaluation into percentage between 5% and 95%
  // Sigmoid-like scaling: 1/(1 + 10^(-eval/4))
  const clampEval = Math.max(-10, Math.min(10, evaluation));
  const whiteWinningPercentage = 1 / (1 + Math.pow(10, -clampEval / 4));
  const whitePercent = Math.round(whiteWinningPercentage * 100);

  // If orientation is black, flip percentage
  const fillPercent = orientation === 'white' ? whitePercent : 100 - whitePercent;

  const displayScore = Math.abs(evaluation) >= 100
    ? (evaluation > 0 ? '#M' : '-#M')
    : (evaluation > 0 ? `+${evaluation.toFixed(1)}` : evaluation.toFixed(1));

  return (
    <div className="relative flex flex-col items-center justify-between w-6 h-[440px] sm:h-[500px] rounded-lg overflow-hidden bg-[#1f2430] border border-[#262c3b] shadow-inner select-none">
      {/* Black's portion (top if White is bottom) */}
      <div
        className="w-full bg-[#11141a] transition-all duration-300 ease-out"
        style={{ height: `${100 - fillPercent}%` }}
      />

      {/* White's portion (bottom if White is bottom) */}
      <div
        className="w-full bg-white transition-all duration-300 ease-out"
        style={{ height: `${fillPercent}%` }}
      />

      {/* Evaluation text badge in middle */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span
          className={`text-[9px] font-mono font-bold px-1 py-0.5 rounded shadow ${
            fillPercent >= 50
              ? 'bg-[#151921] text-white border border-[#262c3b]'
              : 'bg-white text-gray-950 border border-gray-300'
          }`}
        >
          {displayScore}
        </span>
      </div>
    </div>
  );
};
