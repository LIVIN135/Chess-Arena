import React from 'react';
import { useAnalysisStore } from '../../store/useAnalysisStore';

export const EvaluationChart = () => {
  const { analysisData, currentMoveIndex, goToMove } = useAnalysisStore();

  if (!analysisData || !analysisData.moves || analysisData.moves.length === 0) {
    return null;
  }

  const moves = analysisData.moves;
  const numPoints = moves.length;

  // Chart dimensions
  const width = 600;
  const height = 120;
  const paddingY = 16;
  const usableHeight = height - paddingY * 2;
  const centerY = height / 2;

  // Clamp evaluation between -5 and +5 for graph display
  const clampEval = (val) => Math.max(-5, Math.min(5, val || 0));

  // Compute points
  const points = moves.map((m, idx) => {
    const x = (idx / (numPoints - 1 || 1)) * (width - 24) + 12;
    const clamped = clampEval(m.evaluation);
    // Positive eval goes UP (smaller Y in SVG)
    const y = centerY - (clamped / 5) * (usableHeight / 2);
    return { x, y, eval: m.evaluation, index: idx, classification: m.classification };
  });

  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  // Fill path for area
  const areaPathD = numPoints > 0
    ? `${pathD} L ${points[numPoints - 1].x} ${centerY} L ${points[0].x} ${centerY} Z`
    : '';

  const activePoint = currentMoveIndex >= 0 && currentMoveIndex < points.length ? points[currentMoveIndex] : null;

  return (
    <div className="w-full p-4 rounded-xl bg-[#151921] border border-[#262c3b] space-y-2">
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span className="font-semibold uppercase tracking-wider text-[10px]">
          Game Evaluation Flow
        </span>
        <span className="font-mono text-[11px]">
          {activePoint ? `Move ${activePoint.index + 1}: ${activePoint.eval > 0 ? '+' : ''}${activePoint.eval.toFixed(1)}` : 'Click graph to jump to move'}
        </span>
      </div>

      <div className="relative w-full overflow-hidden rounded-lg bg-[#0b0e14] border border-[#1f2430]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-24 select-none cursor-pointer"
          preserveAspectRatio="none"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const ratio = clickX / rect.width;
            const targetIdx = Math.round(ratio * (numPoints - 1));
            goToMove(targetIdx);
          }}
        >
          {/* Zero baseline */}
          <line
            x1="0"
            y1={centerY}
            x2={width}
            y2={centerY}
            stroke="#2e3748"
            strokeDasharray="4 4"
            strokeWidth="1.5"
          />

          {/* Area fill */}
          <path d={areaPathD} fill="rgba(105, 146, 62, 0.15)" />

          {/* Evaluation curve */}
          <path
            d={pathD}
            fill="none"
            stroke="#7fa650"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Active Move Cursor / Pin */}
          {activePoint && (
            <g>
              <line
                x1={activePoint.x}
                y1="0"
                x2={activePoint.x}
                y2={height}
                stroke="#60a5fa"
                strokeWidth="2"
                strokeDasharray="2 2"
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="5"
                fill="#3b82f6"
                stroke="#ffffff"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};
