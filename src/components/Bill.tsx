import type { BillData } from '../types';
import { formatDelayTime } from '../utils/billGenerator';

interface BillProps {
  data: BillData;
  isAnimating: boolean;
}

// Component hiển thị bill dạng POS receipt
export default function Bill({ data, isAnimating }: BillProps) {
  return (
    <div
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
        // Tạo hiệu ứng giấy xé ở đầu
        clipPath: 'polygon(0% 2%, 3% 0%, 6% 2%, 9% 0%, 12% 2%, 15% 0%, 18% 2%, 21% 0%, 24% 2%, 27% 0%, 30% 2%, 33% 0%, 36% 2%, 39% 0%, 42% 2%, 45% 0%, 48% 2%, 51% 0%, 54% 2%, 57% 0%, 60% 2%, 63% 0%, 66% 2%, 69% 0%, 72% 2%, 75% 0%, 78% 2%, 81% 0%, 84% 2%, 87% 0%, 90% 2%, 93% 0%, 96% 2%, 100% 0%, 100% 100%, 0% 100%)',
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

      <div className="flex justify-between text-[10px] mb-1">
        <span>📅 {data.date}</span>
        <span>⏰ {data.time}</span>
      </div>
      <div className="text-[10px] mb-3">
        🔢 Check ID: {data.checkId}
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
        harsh-truth-scanner.app
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
}
