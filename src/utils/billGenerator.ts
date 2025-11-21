import type { BillData } from '../types';
import { generateWithGemini, isGeminiConfigured } from '../services/gemini';

// Các hành động liên quan cho từng loại "lời khai" phổ biến
// Format: hành động "fake/nói" trước (count cao), hành động "thật" sau (count thấp)
const actionCategories: Record<string, { name: string; range: [number, number] }[]> = {
  'người yêu': [
    { name: 'Than ế trên mạng', range: [50, 200] },
    { name: 'Xem video "cách tán gái"', range: [30, 100] },
    { name: 'Nhắn tin crush trước', range: [0, 2] },
    { name: 'Ra ngoài gặp người mới', range: [0, 3] },
  ],
  'tập gym': [
    { name: 'Save video workout', range: [50, 300] },
    { name: 'Mua đồ tập mới', range: [3, 15] },
    { name: 'Thực sự đến phòng gym', range: [0, 5] },
    { name: 'Tập đủ 1 tiếng', range: [0, 2] },
  ],
  'học': [
    { name: 'Mua khóa học online', range: [5, 20] },
    { name: 'Lên lịch học "mai bắt đầu"', range: [30, 100] },
    { name: 'Thực sự ngồi học', range: [0, 5] },
    { name: 'Hoàn thành 1 bài', range: [0, 2] },
  ],
  'tiết kiệm': [
    { name: 'Order đồ ăn online', range: [20, 80] },
    { name: 'Mua "đồ sale quá rẻ"', range: [10, 50] },
    { name: 'Check số dư lo lắng', range: [50, 200] },
    { name: 'Thực sự để dành tiền', range: [0, 3] },
  ],
  'dậy sớm': [
    { name: 'Đặt 10+ báo thức', range: [100, 500] },
    { name: 'Snooze báo thức', range: [50, 300] },
    { name: 'Hứa "mai dậy sớm"', range: [100, 365] },
    { name: 'Thực sự dậy đúng giờ', range: [0, 5] },
  ],
  'default': [
    { name: 'Nói về việc này', range: [50, 200] },
    { name: 'Lên kế hoạch chi tiết', range: [20, 80] },
    { name: 'Tìm motivation', range: [30, 100] },
    { name: 'Thực sự bắt tay làm', range: [0, 3] },
  ],
};

// Các kết luận cay đắng theo category (fallback khi không có Gemini)
const bitterConclusions: Record<string, string[]> = {
  'người yêu': [
    'Bạn ế vì bạn không ra khỏi phòng.',
    'Crush không tự nhiên rơi vào inbox đâu.',
    'Swipe phải 1000 lần nhưng không bao giờ nhắn trước.',
    'Bạn muốn có người yêu hay muốn than thở có người yêu?',
    'WiFi nhà bạn không có tính năng kết nối crush.',
  ],
  'tập gym': [
    'Cơ bắp không tự mọc từ video motivation.',
    'Bạn đã follow 50 fitness influencer nhưng chưa nâng 1 quả tạ.',
    'Áo tập đẹp lắm, tiếc là chưa có giọt mồ hôi nào.',
    '"Tuần sau bắt đầu" đã được nói 52 lần/năm.',
    'Protein shake không có tác dụng nếu không tập.',
  ],
  'học': [
    'Khóa học đã mua 2 năm, tiến độ: 0%.',
    'Bạn học giỏi nhất môn... mua sách.',
    'Deadline là motivation duy nhất của bạn.',
    'Tất cả kế hoạch học đều chết trên Google Calendar.',
    'Não bạn chỉ active khi scroll TikTok.',
  ],
  'tiết kiệm': [
    'Bạn tiết kiệm rất giỏi... cho các app delivery.',
    '"Đây là lần mua cuối" - đã nói 47 lần tháng này.',
    'Ví của bạn cần therapy.',
    'Flash sale là kẻ thù số 1 của tài khoản bạn.',
    'Bạn giàu trong mơ và nghèo khi check số dư.',
  ],
  'dậy sớm': [
    'Nút Snooze là người bạn thân nhất của bạn.',
    '5:00 AM chỉ tồn tại trong kế hoạch, không trong thực tế.',
    'Bạn có 15 báo thức và không cái nào có tác dụng.',
    '"Đi ngủ sớm tối nay" - lời nói dối hàng ngày.',
    'Bạn dậy sớm... lúc 11:59 AM.',
  ],
  'default': [
    'Nói thì hay, làm thì... không thấy đâu.',
    'Kế hoạch của bạn đẹp như mơ và xa vời như mơ.',
    'Motivation của bạn có tuổi thọ 3 phút.',
    'Bạn là chuyên gia lên kế hoạch, nghiệp dư trong thực hiện.',
    'Ý tưởng: 100. Hành động: Error 404.',
    'Bạn nói nhiều hơn bạn làm. Nhiều hơn rất nhiều.',
    'Tomorrow never comes cho bạn.',
  ],
};

// Helper: random number trong range
function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper: detect category từ input
function detectCategory(input: string): string {
  const lowerInput = input.toLowerCase();

  if (lowerInput.includes('yêu') || lowerInput.includes('crush') || lowerInput.includes('hẹn hò') || lowerInput.includes('ế')) {
    return 'người yêu';
  }
  if (lowerInput.includes('gym') || lowerInput.includes('tập') || lowerInput.includes('thể dục') || lowerInput.includes('giảm cân')) {
    return 'tập gym';
  }
  if (lowerInput.includes('học') || lowerInput.includes('đọc') || lowerInput.includes('sách') || lowerInput.includes('khóa học')) {
    return 'học';
  }
  if (lowerInput.includes('tiền') || lowerInput.includes('tiết kiệm') || lowerInput.includes('giàu') || lowerInput.includes('mua')) {
    return 'tiết kiệm';
  }
  if (lowerInput.includes('dậy sớm') || lowerInput.includes('ngủ') || lowerInput.includes('sáng sớm') || lowerInput.includes('báo thức')) {
    return 'dậy sớm';
  }

  return 'default';
}

// Generate random Check ID
function generateCheckId(): string {
  return `#RLT-${randomInRange(1000, 9999)}`;
}

// Format date và time hiện tại
function getCurrentDateTime(): { date: string; time: string } {
  const now = new Date();
  const date = now.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const time = now.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return { date, time };
}

// Fallback: Generate bill data locally (không dùng AI)
function generateBillDataLocal(confession: string): BillData {
  const category = detectCategory(confession);
  const { date, time } = getCurrentDateTime();

  // Logic châm biếm: nói nhiều, làm ít, trì hoãn dài
  const timesSaid = randomInRange(47, 365); // Nói gần như mỗi ngày trong năm
  const timesDone = randomInRange(0, 3); // Làm được vài lần thôi
  const successRate = timesDone / timesSaid * 100;

  // Trì hoãn: "tuần sau" = 168h, "tháng sau" = 720h, "năm sau" = 8760h
  const delayOptions = [168, 336, 720, 1440, 2160]; // 1 tuần, 2 tuần, 1 tháng, 2 tháng, 3 tháng
  const delayHours = delayOptions[randomInRange(0, delayOptions.length - 1)];

  // Priority thấp vì nếu quan trọng thì đã làm rồi
  const realPriority = Math.max(1, Math.min(15, Math.round(successRate * 5))); // Max 15%

  const categoryActions = actionCategories[category] || actionCategories['default'];
  const shuffledActions = [...categoryActions].sort(() => Math.random() - 0.5);
  const selectedActions = shuffledActions.slice(0, randomInRange(2, 3));

  // Actions: hành động "fake" nhiều, hành động thật ít
  const relatedActions = selectedActions.map((action, index) => ({
    name: action.name,
    // Action đầu tiên (thường là hành động giả) có count cao, action sau thấp dần
    count: index === 0
      ? randomInRange(Math.max(action.range[0], 20), action.range[1] + 30)
      : randomInRange(0, Math.min(5, action.range[1])),
  }));

  const conclusions = bitterConclusions[category] || bitterConclusions['default'];
  const bitterConclusion = conclusions[randomInRange(0, conclusions.length - 1)];

  return {
    checkId: generateCheckId(),
    date,
    time,
    confession,
    timesSaid,
    timesDone,
    delayHours,
    relatedActions,
    realPriority,
    bitterConclusion,
  };
}

// Main function: Generate bill data (với Gemini AI nếu có)
export async function generateBillDataWithAI(confession: string): Promise<BillData> {
  const { date, time } = getCurrentDateTime();

  // Base data
  const baseData: BillData = {
    checkId: generateCheckId(),
    date,
    time,
    confession,
    timesSaid: randomInRange(15, 200),
    timesDone: randomInRange(0, 5),
    delayHours: randomInRange(12, 720),
    relatedActions: [],
    realPriority: randomInRange(5, 40),
    bitterConclusion: '',
  };

  // Nếu có Gemini, dùng AI để generate
  if (isGeminiConfigured()) {
    try {
      const aiResponse = await generateWithGemini(confession);

      if (aiResponse) {
        return {
          ...baseData,
          bitterConclusion: aiResponse.bitterConclusion,
          // relatedActions: aiResponse.relatedActions
          relatedActions: generateBillDataLocal(confession).relatedActions, // Tạm thời dùng local cho relatedActions
        };
      }
    } catch (error) {
      console.error('AI generation failed, using fallback:', error);
    }
  }

  // Fallback to local generation
  return generateBillDataLocal(confession);
}

// Sync version (backward compatible) - dùng local generation
export function generateBillData(confession: string): BillData {
  return generateBillDataLocal(confession);
}

// Format delay time cho hiển thị
export function formatDelayTime(hours: number): string {
  if (hours < 24) {
    return `${hours} giờ`;
  } else if (hours < 168) {
    const days = Math.floor(hours / 24);
    return `${days} ngày`;
  } else {
    const weeks = Math.floor(hours / 168);
    return `${weeks} tuần`;
  }
}

// Export helper để check Gemini status
export { isGeminiConfigured };
