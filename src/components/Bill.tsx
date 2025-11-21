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

      {/* Số liệu */}
      <div className="text-[10px] text-gray-500 mb-2">SỐ LIỆU THỐNG KÊ:</div>

      <div className="space-y-1 mb-3">
        <div className="flex justify-between">
          <span>Số lần nói:</span>
          <span className="font-bold">{data.timesSaid} lần</span>
        </div>
        <div className="flex justify-between">
          <span>Số lần làm:</span>
          <span className="font-bold text-red-600">{data.timesDone} lần</span>
        </div>
        <div className="flex justify-between">
          <span>Trì hoãn gần nhất:</span>
          <span className="font-bold">{formatDelayTime(data.delayHours)}</span>
        </div>
      </div>

      <div className="receipt-divider my-3" />

      {/* Hành động liên quan */}
      <div className="text-[10px] text-gray-500 mb-2">HÀNH ĐỘNG LIÊN QUAN:</div>
      <div className="space-y-1 mb-3">
        {data.relatedActions.map((action, index) => (
          <div key={index} className="flex justify-between">
            <span className="text-[10px]">• {action.name}:</span>
            <span className="font-bold">{action.count} lần</span>
          </div>
        ))}
      </div>

      <div className="receipt-divider my-3" />

      {/* Độ ưu tiên */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-[10px] text-gray-500">ĐỘ ƯU TIÊN THỰC TẾ:</span>
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-gray-200 rounded overflow-hidden">
            <div
              className="h-full bg-black transition-all duration-500"
              style={{ width: `${data.realPriority}%` }}
            />
          </div>
          <span className="font-bold text-red-600">{data.realPriority}%</span>
        </div>
      </div>

      <div className="receipt-divider my-3" />

      {/* === KẾT LUẬN CAY ĐẮNG === */}
      <div className="mb-4">
        <div className="text-[10px] text-gray-500 mb-2">KẾT LUẬN CAY ĐẮNG:</div>
        <div className="text-center py-3 px-2 bg-black text-white text-sm font-bold rounded">
          "{data.bitterConclusion}"
        </div>
      </div>

      <div className="receipt-divider my-3" />

      {/* === FOOTER === */}
      <div className="text-center text-[10px] text-gray-500 mb-4">
        <div className="mb-2">— Hãy quay lại khi bạn chịu làm thật. —</div>
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
