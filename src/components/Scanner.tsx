import { useState, useRef, useCallback } from 'react';
import type { BillData } from '../types';
import { generateBillDataWithAI } from '../utils/billGenerator';
import Bill, { type BillRef } from './Bill';

// Component máy scan chính - 3D POS Machine Style
export default function Scanner() {
  const [input, setInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [showBill, setShowBill] = useState(false);
  const [billData, setBillData] = useState<BillData | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);

  const beepAudioRef = useRef<HTMLAudioElement | null>(null);
  const printAudioRef = useRef<HTMLAudioElement | null>(null);
  const billRef = useRef<BillRef>(null);

  const playBeepSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 800;
      oscillator.type = 'square';
      gainNode.gain.value = 0.1;
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
      }, 100);
    } catch {
      // Audio not supported
    }
  }, []);

  const playPrintSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const bufferSize = audioContext.sampleRate * 0.5;
      const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = audioContext.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      const bandpass = audioContext.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.value = 1000;
      const gainNode = audioContext.createGain();
      gainNode.gain.value = 0.05;
      whiteNoise.connect(bandpass);
      bandpass.connect(gainNode);
      gainNode.connect(audioContext.destination);
      whiteNoise.start();
      setTimeout(() => {
        whiteNoise.stop();
        audioContext.close();
      }, 500);
    } catch {
      // Audio not supported
    }
  }, []);

  const handleScan = async () => {
    if (!input.trim() || isScanning) return;
    setIsScanning(true);
    setShowBill(false);
    setBillData(null);
    setIsShaking(true);
    setIsBlinking(true);

    for (let i = 0; i < 4; i++) {
      setTimeout(() => playBeepSound(), i * 300);
    }

    setTimeout(async () => {
      setIsShaking(false);
      setIsBlinking(false);
      const newBillData = await generateBillDataWithAI(input);
      setBillData(newBillData);
      playPrintSound();
      setShowBill(true);
      setIsScanning(false);
    }, 1800);
  };

  const handleReset = () => {
    setInput('');
    setShowBill(false);
    setBillData(null);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* === 3D POS MACHINE === */}
      <div className={`relative z-10 ${isShaking ? 'animate-shake' : ''}`}>
        {/* Machine Shadow on ground */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[85%] h-6 bg-black/40 blur-xl rounded-full pointer-events-none" />

        {/* Main Machine Body */}
        <div
          className="relative"
          style={{
            background: 'linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 50%, #0d0d0d 100%)',
            borderRadius: '20px 20px 10px 10px',
            padding: '24px',
            boxShadow: `
              0 25px 50px -12px rgba(0, 0, 0, 0.8),
              0 0 0 1px rgba(255,255,255,0.05),
              inset 0 1px 0 rgba(255,255,255,0.1),
              inset 0 -2px 0 rgba(0,0,0,0.3)
            `,
          }}
        >
          {/* Top Edge Highlight */}
          <div
            className="absolute top-0 left-4 right-4 h-[2px]"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            }}
          />

          {/* Brand Logo Area */}
          <div
            className="mb-4 py-2 text-center"
            style={{
              background: 'linear-gradient(180deg, #1f1f1f 0%, #151515 100%)',
              borderRadius: '8px',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            <div className="text-white text-xl font-black tracking-[0.3em]"
              style={{ textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>
              HARSH TRUTH
            </div>
            <div className="text-gray-500 text-[10px] tracking-[0.5em] mt-1">
              SCANNER™ PRO
            </div>
          </div>

          {/* LED Indicator Panel */}
          <div
            className="flex justify-center gap-4 mb-4 py-3 px-4"
            style={{
              background: 'linear-gradient(180deg, #0a0a0a 0%, #151515 100%)',
              borderRadius: '6px',
              boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.8)',
            }}
          >
            {/* Power LED */}
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${isBlinking ? 'animate-blink' : ''}`}
                style={{
                  background: isBlinking
                    ? 'radial-gradient(circle at 30% 30%, #ff6b6b, #dc2626)'
                    : 'radial-gradient(circle at 30% 30%, #4a1515, #2a0a0a)',
                  boxShadow: isBlinking
                    ? '0 0 10px #dc2626, 0 0 20px #dc262660'
                    : 'inset 0 1px 2px rgba(0,0,0,0.5)',
                }}
              />
              <span className="text-[8px] text-gray-600 uppercase tracking-wider">PWR</span>
            </div>

            {/* Status LED */}
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  background: isScanning
                    ? 'radial-gradient(circle at 30% 30%, #4ade80, #22c55e)'
                    : 'radial-gradient(circle at 30% 30%, #0a2a0a, #051505)',
                  boxShadow: isScanning
                    ? '0 0 10px #22c55e, 0 0 20px #22c55e60'
                    : 'inset 0 1px 2px rgba(0,0,0,0.5)',
                }}
              />
              <span className="text-[8px] text-gray-600 uppercase tracking-wider">RDY</span>
            </div>

            {/* Activity LED */}
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${isBlinking ? 'animate-blink' : ''}`}
                style={{
                  background: isBlinking
                    ? 'radial-gradient(circle at 30% 30%, #fbbf24, #f59e0b)'
                    : 'radial-gradient(circle at 30% 30%, #2a2a0a, #151505)',
                  boxShadow: isBlinking
                    ? '0 0 10px #f59e0b, 0 0 20px #f59e0b60'
                    : 'inset 0 1px 2px rgba(0,0,0,0.5)',
                }}
              />
              <span className="text-[8px] text-gray-600 uppercase tracking-wider">ACT</span>
            </div>
          </div>

          {/* LCD Screen with bezel */}
          <div
            className="mb-4 p-1"
            style={{
              background: 'linear-gradient(145deg, #1a1a1a, #0a0a0a)',
              borderRadius: '8px',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            <div
              className="p-3 rounded-md"
              style={{
                background: 'linear-gradient(180deg, #0a1a0a 0%, #051505 100%)',
                boxShadow: 'inset 0 0 20px rgba(0,255,0,0.1)',
              }}
            >
              <div className="text-green-400 text-[11px] font-mono tracking-wide"
                style={{ textShadow: '0 0 8px rgba(74, 222, 128, 0.8)' }}>
                {isScanning ? (
                  <span className="animate-pulse">▶ ĐANG QUÉT REALITY...</span>
                ) : showBill ? (
                  <span>✓ SCAN HOÀN TẤT</span>
                ) : (
                  <span>◉ SẴN SÀNG QUÉT</span>
                )}
              </div>
            </div>
          </div>

          {/* Input Area with 3D effect */}
          <div
            className="mb-4 p-1"
            style={{
              background: 'linear-gradient(145deg, #1a1a1a, #0a0a0a)',
              borderRadius: '8px',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.8)',
            }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập thứ bạn nói hoài mà chưa làm..."
              disabled={isScanning}
              className="w-full bg-gray-800 text-white placeholder-gray-500 rounded-md p-3 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-green-500/50 disabled:opacity-50 border-0"
              style={{
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
              }}
              rows={2}
            />
          </div>

          {/* 3D SCAN Button */}
          <div className="relative z-10">
            <button
              onClick={handleScan}
              disabled={!input.trim() || isScanning}
              className="relative z-10 w-full text-white font-bold py-4 px-6 text-sm tracking-wider disabled:opacity-50 disabled:cursor-not-allowed transition-all active:translate-y-1 cursor-pointer"
              style={{
                background: !input.trim() || isScanning
                  ? 'linear-gradient(180deg, #4a4a4a 0%, #3a3a3a 100%)'
                  : 'linear-gradient(180deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)',
                borderRadius: '8px',
                boxShadow: !input.trim() || isScanning
                  ? 'none'
                  : `
                    0 6px 0 #7f1d1d,
                    0 8px 10px rgba(0,0,0,0.4),
                    inset 0 1px 0 rgba(255,255,255,0.2)
                  `,
                transform: 'translateY(0)',
              }}
            >
              <span style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                {isScanning ? '⏳ ĐANG QUÉT...' : '🔍 SCAN REALITY'}
              </span>
            </button>
          </div>

          {/* Paper Slot - 3D Depth Effect */}
          <div className="mt-5 relative">
            {/* Slot frame - top edge */}
            <div
              className="h-3 mx-4 rounded-sm relative z-30"
              style={{
                background: 'linear-gradient(180deg, #000 0%, #0a0a0a 100%)',
                boxShadow: `
                  inset 0 3px 6px rgba(0,0,0,0.9),
                  0 2px 4px rgba(0,0,0,0.5)
                `,
              }}
            />

            {/* === BILL prints out from slot === */}
            {showBill && billData && (
              <div className="flex flex-col items-center">
                {/* Bill container - clips bill while it slides out */}
                <div className="bill-container">
                  <div className="animate-print-bill">
                    <div className="relative">
                      {/* Shadow behind bill */}
                      <div className="absolute inset-0 bg-black/30 blur-lg translate-y-3 translate-x-1 pointer-events-none" />
                      <Bill ref={billRef} data={billData} isAnimating={false} />
                    </div>
                  </div>
                </div>

                {/* Action buttons - 3D style */}
                <div className="flex gap-3 mt-6 mb-4 w-full max-w-[320px]">
                  <button
                    onClick={() => billRef.current?.shareImage()}
                    className="flex-1 py-3 px-2 font-mono text-[11px] font-bold tracking-wide text-white cursor-pointer transition-all duration-100 active:translate-y-1"
                    style={{
                      background: 'linear-gradient(180deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)',
                      borderRadius: '8px',
                      boxShadow: '0 4px 0 #1e40af, 0 6px 10px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                      border: 'none',
                    }}
                  >
                    ĐI KHOE
                  </button>

                  <button
                    onClick={() => billRef.current?.downloadImage()}
                    className="flex-1 py-3 px-2 font-mono text-[11px] font-bold tracking-wide text-white cursor-pointer transition-all duration-100 active:translate-y-1"
                    style={{
                      background: 'linear-gradient(180deg, #22c55e 0%, #16a34a 50%, #15803d 100%)',
                      borderRadius: '8px',
                      boxShadow: '0 4px 0 #166534, 0 6px 10px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                      border: 'none',
                    }}
                  >
                    HỐT VỀ
                  </button>

                  <button
                    onClick={handleReset}
                    className="flex-1 py-3 px-2 font-mono text-[11px] font-bold tracking-wide text-white cursor-pointer transition-all duration-100 active:translate-y-1"
                    style={{
                      background: 'linear-gradient(180deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
                      borderRadius: '8px',
                      boxShadow: '0 4px 0 #991b1b, 0 6px 10px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                      border: 'none',
                    }}
                  >
                    QUAY ĐẦU
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom screws decoration */}
          {!showBill && (
            <div className="flex justify-between px-2 mt-4">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: 'linear-gradient(145deg, #3a3a3a, #1a1a1a)',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.05)',
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Machine Side Shadow */}
        <div
          className="absolute top-4 -right-2 bottom-4 w-4 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, #0a0a0a, transparent)',
            borderRadius: '0 10px 10px 0',
            opacity: 0.5,
          }}
        />
      </div>

      <audio ref={beepAudioRef} preload="auto" />
      <audio ref={printAudioRef} preload="auto" />
    </div>
  );
}
