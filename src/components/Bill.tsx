import { useRef, forwardRef, useImperativeHandle } from 'react';
import { toPng } from 'html-to-image';
import type { BillData } from '../types';
import { formatDelayTime } from '../utils/billGenerator';

interface BillProps {
  data: BillData;
  isAnimating: boolean;
}

export interface BillRef {
  downloadImage: () => Promise<void>;
  shareImage: () => Promise<void>;
}

// Component hiển thị bill dạng POS receipt
const Bill = forwardRef<BillRef, BillProps>(({ data, isAnimating }, ref) => {
  const billRef = useRef<HTMLDivElement>(null);

  // Download bill as image
  const downloadImage = async () => {
    if (!billRef.current) return;
    try {
      const dataUrl = await toPng(billRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });
      const link = document.createElement('a');
      link.download = `harsh-truth-${data.checkId}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download image:', err);
    }
  };

  // Share bill (mobile) or copy to clipboard (desktop)
  const shareImage = async () => {
    if (!billRef.current) return;
    try {
      const dataUrl = await toPng(billRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });

      // Convert to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], `harsh-truth-${data.checkId}.png`, { type: 'image/png' });

      // Try native share first (mobile)
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Harsh Truth Receipt',
          text: `Sự thật cay đắng: "${data.bitterConclusion}"`,
        });
      } else {
        // Fallback: copy image to clipboard
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        alert('Đã copy hình vào clipboard!');
      }
    } catch (err) {
      console.error('Failed to share:', err);
      // Ultimate fallback: download
      downloadImage();
    }
  };

  useImperativeHandle(ref, () => ({
    downloadImage,
    shareImage,
  }));

  return (
    <div
      ref={billRef}
      className={`
        receipt-paper
        w-full max-w-[320px]
        bg-white text-black
        p-4 pt-6
        font-mono text-xs
        leading-relaxed
        ${isAnimating ? 'animate-slide-down' : ''}
      `}
      style={{
        // Tạo hiệu ứng giấy xé ở đầu và cuối
        clipPath: `polygon(
          0% 2%, 3% 0%, 6% 2%, 9% 0%, 12% 2%, 15% 0%, 18% 2%, 21% 0%, 24% 2%, 27% 0%, 30% 2%, 33% 0%, 36% 2%, 39% 0%, 42% 2%, 45% 0%, 48% 2%, 51% 0%, 54% 2%, 57% 0%, 60% 2%, 63% 0%, 66% 2%, 69% 0%, 72% 2%, 75% 0%, 78% 2%, 81% 0%, 84% 2%, 87% 0%, 90% 2%, 93% 0%, 96% 2%, 100% 0%,
          100% 98%, 97% 100%, 94% 98%, 91% 100%, 88% 98%, 85% 100%, 82% 98%, 79% 100%, 76% 98%, 73% 100%, 70% 98%, 67% 100%, 64% 98%, 61% 100%, 58% 98%, 55% 100%, 52% 98%, 49% 100%, 46% 98%, 43% 100%, 40% 98%, 37% 100%, 34% 98%, 31% 100%, 28% 98%, 25% 100%, 22% 98%, 19% 100%, 16% 98%, 13% 100%, 10% 98%, 7% 100%, 4% 98%, 0% 100%
        )`,
      }}
    >
      {/* === HEADER === */}
      <div className="text-center mb-4">
        <div className="text-lg font-bold mb-1">🧾 HARSH TRUTH RECEIPT</div>
        <div className="text-[10px] text-gray-600">
          Reality Check System v1.0
        </div>
      </div>

      <div className="receipt-divider my-3" />

      <div className="flex justify-between text-[10px] mb-2">
        <span>📅 {data.date}</span>
        <span>⏰ {data.time}</span>
      </div>
      <div className="text-[10px] mb-3">
        🔢 Check ID: <span className="font-bold">{data.checkId}</span>
      </div>

      <div className="receipt-divider my-3" />

      {/* === BODY === */}
      <div className="mb-3">
        <div className="text-[10px] text-gray-500 mb-1">LỜI KHAI:</div>
        <div className="text-sm font-medium bg-gray-100 p-2 rounded">
          "{data.confession}"
        </div>
      </div>

      <div className="receipt-divider my-3" />

      {/* Stats Card - ULTRA GEN Z */}
      <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-lg p-3 mb-3 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
        <div className="text-[11px] font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2 text-center tracking-wide">
          ✨ REALITY CHECK STATS ✨
        </div>
        <div className="text-[7px] text-center text-gray-600 mb-3 font-bold">
          (NO CAP FR FR 💯)
        </div>

        {/* Talk vs Action Ratio - MEGA HIGHLIGHT */}
        <div className="bg-white rounded-xl p-3 mb-3 border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 text-6xl opacity-5">💀</div>

          <div className="text-center mb-2 relative z-10">
            <div className="text-[8px] font-bold text-gray-500 mb-2 tracking-widest">
              ⚔️ TALK vs ACTION RATIO ⚔️
            </div>
            <div className="flex items-end justify-center gap-3 mb-2">
              <div className="text-center">
                <div className="text-3xl font-black text-blue-600 leading-none">{data.timesSaid}</div>
                <div className="text-[7px] text-blue-400 font-bold mt-1">TALKING 💬</div>
              </div>
              <div className="text-2xl font-black text-gray-800 mb-1">VS</div>
              <div className="text-center">
                <div className="text-3xl font-black text-red-600 leading-none">{data.timesDone}</div>
                <div className="text-[7px] text-red-400 font-bold mt-1">DOING ⚡</div>
              </div>
            </div>
          </div>

          {/* Success Rate BRUTAL */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-2 border-2 border-red-200">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[8px] font-bold text-gray-700">Win Rate:</span>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black text-red-600">
                  {((data.timesDone / data.timesSaid) * 100).toFixed(1)}%
                </span>
                <span className="text-sm">💀</span>
              </div>
            </div>
            <div className="text-[7px] text-center font-black uppercase tracking-wide">
              {data.realPriority < 1
                ? "🚨 MASSIVE SKILL ISSUE DETECTED"
                : data.realPriority < 2
                ? "😭 BRO IS COOKED"
                : data.realPriority < 5
                ? "📉 MID AF NGL"
                : data.realPriority < 10
                ? "🎯 ACCEPTABLE I GUESS"
                : "⭐ RARE W"}
            </div>
          </div>
        </div>

        {/* Procrastination Level - GAMER STYLE */}
        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-2.5 mb-2 border-2 border-orange-400 shadow-[2px_2px_0px_0px_rgba(251,146,60,1)]">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1">
              <span className="text-lg">⏰</span>
              <span className="text-[8px] font-black text-orange-900">DELAY TIMER</span>
            </div>
            <div className="text-right">
              <div className="text-base font-black text-orange-700">{formatDelayTime(data.delayHours)}</div>
            </div>
          </div>
          <div className="bg-orange-200 rounded-full px-2 py-0.5 text-center">
            <div className="text-[7px] font-black text-orange-900 uppercase">
              {data.delayHours > 720
                ? "🏆 LEGENDARY PROCRASTINATOR"
                : data.delayHours > 360
                ? "⭐ MASTER DELAYER"
                : data.delayHours > 168
                ? "📅 PRO POSTPONER"
                : "📝 ROOKIE NUMBERS"}
            </div>
          </div>
        </div>

        {/* Priority Progress - GAMING UI */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-2.5 border-2 border-slate-600 shadow-[2px_2px_0px_0px_rgba(71,85,105,1)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[8px] font-black text-slate-300 tracking-wider">PRIORITY METER</span>
            <span className="text-[7px] font-mono text-slate-400">LVL {Math.floor(data.realPriority / 10)}</span>
          </div>
          <div className="relative h-7 bg-slate-950 rounded-lg overflow-hidden border-2 border-slate-700">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>

            <div
              className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 transition-all duration-700 flex items-center justify-center relative"
              style={{ width: `${Math.max(data.realPriority, 10)}%` }}
            >
              <span className="text-[9px] font-black text-white drop-shadow-lg z-10">
                {data.realPriority}%
              </span>
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
            </div>
          </div>
          <div className="text-center mt-1.5 bg-slate-950 rounded px-2 py-0.5">
            <div className="text-[7px] font-black text-red-400 uppercase tracking-wide">
              {data.realPriority < 0.5
                ? "👻 GHOST PROTOCOL ACTIVE"
                : data.realPriority < 1
                ? "💀 CRITICAL SKILL ISSUE"
                : data.realPriority < 3
                ? "😴 AFK ENERGY DETECTED"
                : data.realPriority < 7
                ? "🤷 MID COMMITMENT"
                : data.realPriority < 15
                ? "📈 SLIGHT PROGRESS"
                : "🔥 RARE W MOMENT"}
            </div>
          </div>
        </div>
      </div>

      <div className="receipt-divider my-3" />

      {/* Actions - GAMING LOG STYLE */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] font-black text-gray-700 tracking-wider">🎮 ACTIVITY LOG</span>
          <span className="text-[6px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">RECORDED</span>
        </div>
        <div className="space-y-1.5">
          {data.relatedActions.map((action, index) => {
            const isActual = action.name.toLowerCase().includes('actual');
            const isHigh = action.count > 100;
            const isMid = action.count > 20 && action.count <= 100;

            return (
              <div
                key={index}
                className={`
                  flex justify-between items-center rounded-lg px-2.5 py-1.5 border-2
                  ${isActual
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300'
                    : 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-300'}
                  shadow-sm
                `}
              >
                <span className="text-[8px] font-medium text-gray-800 flex items-center gap-1">
                  <span className={isActual ? 'text-green-600' : 'text-gray-400'}>
                    {isActual ? '✓' : '•'}
                  </span>
                  {action.name}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className={`
                    font-black text-[10px] px-1.5 py-0.5 rounded
                    ${isHigh ? 'bg-red-100 text-red-700' : isMid ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}
                  `}>
                    {action.count}x
                  </span>
                  {isHigh && <span className="text-[9px]">💀</span>}
                  {isMid && !isActual && <span className="text-[9px]">📈</span>}
                  {isActual && action.count < 5 && <span className="text-[9px]">😭</span>}
                  {isActual && action.count >= 5 && <span className="text-[9px]">🎯</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="receipt-divider my-3" />

      {/* === FINAL ROAST === */}
      <div className="mb-4">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-red-300 to-transparent"></div>
          <span className="text-[8px] font-black text-red-600 tracking-widest">⚡ FINAL VERDICT ⚡</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-red-300 to-transparent"></div>
        </div>

        {/* Main roast card - MEGA IMPACT */}
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 blur-sm opacity-20 rounded-xl"></div>

          <div className="relative bg-gradient-to-br from-red-600 via-red-700 to-red-800 rounded-xl p-4 border-2 border-red-950 shadow-[4px_4px_0px_0px_rgba(127,29,29,1)]">
            {/* Corner decorations */}
            <div className="absolute top-1 left-1 text-red-300/20 text-xl">💀</div>
            <div className="absolute bottom-1 right-1 text-red-300/20 text-xl">🔥</div>

            <div className="relative z-10">
              <div className="text-center mb-2">
                <div className="inline-block bg-red-950/50 px-3 py-1 rounded-full border border-red-400/30">
                  <span className="text-[7px] font-black text-red-200 tracking-widest">REALITY CHECK COMPLETE</span>
                </div>
              </div>

              <div className="text-center text-white font-black text-sm leading-relaxed px-2">
                "{data.bitterConclusion}"
              </div>

              {/* Rating bar */}
              <div className="mt-3 pt-3 border-t border-red-500/30">
                <div className="flex items-center justify-center gap-1">
                  <span className="text-[7px] text-red-200">PAIN LEVEL:</span>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-xs">
                        {i < 4 ? '🔥' : '💀'}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="receipt-divider my-3" />

      {/* === FOOTER - GEN Z STYLE === */}
      <div className="text-center mb-4">
        <div className="bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
          <div className="text-[8px] font-black text-gray-700 mb-2 tracking-wide">
            📌 NEXT STEPS (IF YOU DARE)
          </div>
          <div className="text-[7px] text-gray-600 space-y-1">
            <div>1. Accept the truth 💀</div>
            <div>2. Stop capping 🧢</div>
            <div>3. Actually do something 🎯</div>
            <div className="text-[6px] italic text-gray-500 mt-2">(or come back for another roast lol)</div>
          </div>
        </div>
      </div>

      {/* QR Code placeholder */}
      <div className="flex justify-center mb-3">
        <div className="w-16 h-16 bg-black p-1">
          <div className="w-full h-full bg-white grid grid-cols-5 grid-rows-5 gap-[1px]">
            {/* Simple QR pattern */}
            {Array(25).fill(0).map((_, i) => (
              <div
                key={i}
                className={`
                  ${[0, 1, 2, 4, 5, 6, 10, 14, 18, 19, 20, 22, 23, 24].includes(i)
                    ? 'bg-black'
                    : 'bg-white'
                  }
                `}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="text-center text-[8px] text-gray-400">
        {typeof window !== 'undefined' ? window.location.host : 'harsh-truth-scanner.app'}
      </div>

      {/* Decorative bottom */}
      <div className="text-center text-[10px] mt-4 text-gray-400">
        ********************************
      </div>
      <div className="text-center text-[8px] text-gray-400 mt-1">
        THANK YOU FOR YOUR HONESTY
      </div>
    </div>
  );
});

export default Bill;
