import React, { useEffect, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { sfx } from '../../services/SoundSystem';

/**
 * Mobile Gesture HUD & Tactical Camera Controls
 * 
 * Displays non-intrusive, responsive visual feedback on touch gesture zoom levels,
 * rotation angles, and provides a quick thumb-friendly button to reset camera orientation.
 */
export const MobileGestureHUD: React.FC = () => {
  const {
    cameraZoomFactor = 1.0,
    cameraAzimuthOffset = 0,
    isGestureActive,
    resetCameraGesture
  } = useGameStore();

  const [visible, setVisible] = useState(false);

  // Show badge when gesture is active or rotated away from 0
  const isRotatedOrZoomed = Math.abs(cameraAzimuthOffset) > 0.05 || Math.abs(cameraZoomFactor - 1.0) > 0.05;

  useEffect(() => {
    if (isGestureActive || isRotatedOrZoomed) {
      setVisible(true);
      const timer = setTimeout(() => {
        if (!isGestureActive && !isRotatedOrZoomed) {
          setVisible(false);
        }
      }, 2500);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [isGestureActive, isRotatedOrZoomed]);

  if (!visible && !isRotatedOrZoomed) return null;

  const zoomPercent = Math.round((1 / cameraZoomFactor) * 100);
  const degrees = Math.round(((cameraAzimuthOffset * 180) / Math.PI) % 360);

  return (
    <div className="absolute top-16 right-3 z-30 pointer-events-auto flex items-center gap-1.5 animate-in fade-in duration-200">
      {/* Dynamic Mini Status Pill */}
      <div className="bg-slate-950/75 backdrop-blur-xl border border-white/15 px-3 py-1 rounded-full flex items-center gap-2 shadow-lg text-[10px] font-mono text-slate-300">
        <span className="text-amber-400 font-bold">🔍 {zoomPercent}%</span>
        <span className="text-slate-500">•</span>
        <span className="text-sky-300 font-bold">🧭 {degrees}°</span>
      </div>

      {/* Thumb-friendly Reset Button */}
      {isRotatedOrZoomed && (
        <button
          onClick={() => {
            sfx.playUiClick();
            resetCameraGesture();
          }}
          className="min-w-[44px] min-h-[44px] bg-slate-900/80 hover:bg-slate-800 backdrop-blur-xl border border-white/20 text-amber-300 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform font-bold text-xs"
          title="Restablecer Cámara"
          aria-label="Restablecer Cámara"
        >
          ↺
        </button>
      )}
    </div>
  );
};
