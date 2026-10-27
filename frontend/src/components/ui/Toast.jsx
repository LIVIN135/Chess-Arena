import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

let toastListeners = [];
let toastIdCounter = 0;

export const toast = {
  success: (message, duration = 3500) => emitToast({ type: 'success', message, duration }),
  error: (message, duration = 4000) => emitToast({ type: 'error', message, duration }),
  info: (message, duration = 3500) => emitToast({ type: 'info', message, duration }),
};

const emitToast = (toastObj) => {
  const id = ++toastIdCounter;
  const item = { id, ...toastObj };
  toastListeners.forEach((listener) => listener((prev) => [...prev, item]));
  if (toastObj.duration) {
    setTimeout(() => {
      removeToast(id);
    }, toastObj.duration);
  }
};

const removeToast = (id) => {
  toastListeners.forEach((listener) =>
    listener((prev) => prev.filter((item) => item.id !== id))
  );
};

export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    toastListeners.push(setToasts);

    const handleSessionExpired = (e) => {
      toast.error(e.detail?.message || 'Session expired. Please log in again.');
    };
    window.addEventListener('session-expired', handleSessionExpired);

    return () => {
      toastListeners = toastListeners.filter((l) => l !== setToasts);
      window.removeEventListener('session-expired', handleSessionExpired);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        const isSuccess = t.type === 'success';
        const isError = t.type === 'error';

        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-xl backdrop-blur-md transition-all duration-200 animate-slide-up ${
              isSuccess
                ? 'bg-[#161B22]/95 border-[#7FB069]/40 text-[#F0F6FC]'
                : isError
                ? 'bg-[#161B22]/95 border-rose-500/40 text-[#F0F6FC]'
                : 'bg-[#161B22]/95 border-[#21262D] text-[#F0F6FC]'
            }`}
          >
            {isSuccess && <CheckCircle2 className="h-5 w-5 text-[#7FB069] shrink-0 mt-0.5" />}
            {isError && <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />}
            {!isSuccess && !isError && <Info className="h-5 w-5 text-sky-400 shrink-0 mt-0.5" />}
            
            <p className="text-xs font-medium leading-relaxed flex-1">{t.message}</p>
            
            <button
              onClick={() => removeToast(t.id)}
              className="text-[#8B949E] hover:text-[#F0F6FC] transition-colors -mr-1 -mt-1 p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
