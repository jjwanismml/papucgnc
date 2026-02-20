import { useState, useEffect } from 'react';

const LoadingScreen = ({ onFinish }) => {
  const [phase, setPhase] = useState('enter'); // enter, pulse, exit

  useEffect(() => {
    // Logo giriş animasyonu
    const enterTimer = setTimeout(() => {
      setPhase('pulse');
    }, 400);

    // Çıkış animasyonu
    const exitTimer = setTimeout(() => {
      setPhase('exit');
    }, 2000);

    // Tamamen kaldır
    const finishTimer = setTimeout(() => {
      onFinish?.();
    }, 2800);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-opacity duration-700 ${
        phase === 'exit' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Logo Container */}
      <div
        className={`relative transition-all duration-700 ease-out ${
          phase === 'enter'
            ? 'scale-50 opacity-0'
            : phase === 'pulse'
            ? 'scale-100 opacity-100'
            : 'scale-150 opacity-0'
        }`}
      >
        <div className="w-[500px] h-[500px] md:w-[650px] md:h-[650px] rounded-full overflow-hidden relative">
          <img
            src="/logo.png"
            alt="PAPUÇGNC"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[20000px] h-[20000px] object-contain"
          />
        </div>

        {/* Pulse Ring */}
        {phase === 'pulse' && (
          <>
            <div className="absolute inset-0 rounded-full border-2 border-black/20 animate-loading-ping" />
            <div className="absolute inset-0 rounded-full border-2 border-black/10 animate-loading-ping-delay" />
          </>
        )}
      </div>

      {/* Brand Name */}
      <div
        className={`mt-6 transition-all duration-500 delay-300 ${
          phase === 'enter'
            ? 'opacity-0 translate-y-4'
            : phase === 'pulse'
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-4'
        }`}
      >
        <h1 className="text-2xl md:text-3xl font-black italic tracking-tight">
          PAPUÇ<span className="text-red-600">GNC</span>.
        </h1>
      </div>

      {/* Loading Bar */}
      <div
        className={`mt-8 w-32 md:w-48 h-[2px] bg-gray-200 rounded-full overflow-hidden transition-opacity duration-500 ${
          phase === 'exit' ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div className="h-full bg-black animate-loading-bar rounded-full" />
      </div>
    </div>
  );
};

export default LoadingScreen;

