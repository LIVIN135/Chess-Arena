import { useEffect, useRef } from 'react';

export const formatClockTime = (ms) => {
  if (ms === null || ms === undefined) return '∞';
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0 && totalSeconds < 10 && ms > 0) {
    const tenths = Math.floor((ms % 1000) / 100);
    return `${seconds}.${tenths}s`;
  }

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const useClockDisplay = ({ timeMs, isTurn, isRunning, onTimeout }) => {
  const displayRef = useRef(null);
  const timeMsRef = useRef(timeMs);
  const lastTimeRef = useRef(performance.now());
  const animationFrameRef = useRef(null);
  const hasTimedOutRef = useRef(false);

  useEffect(() => {
    timeMsRef.current = timeMs;
    hasTimedOutRef.current = false;
    if (displayRef.current) {
      displayRef.current.textContent = formatClockTime(timeMs);
    }
  }, [timeMs]);

  useEffect(() => {
    if (!isRunning || !isTurn || timeMs === null) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    lastTimeRef.current = performance.now();

    const tick = (now) => {
      const delta = now - lastTimeRef.current;
      lastTimeRef.current = now;

      timeMsRef.current = Math.max(0, timeMsRef.current - delta);
      if (displayRef.current) {
        displayRef.current.textContent = formatClockTime(timeMsRef.current);
      }

      if (timeMsRef.current <= 0) {
        if (!hasTimedOutRef.current && onTimeout) {
          hasTimedOutRef.current = true;
          onTimeout();
        }
        return;
      }

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isRunning, isTurn, timeMs, onTimeout]);

  return displayRef;
};

export default useClockDisplay;
