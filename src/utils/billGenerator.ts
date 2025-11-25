import type { BillData } from '../types';
import { generateWithGemini, isGeminiConfigured } from '../services/gemini';

// Các hành động liên quan cho từng loại "lời khai" - GEN Z STYLE 🎮
// Format: hành động "fake/talking" trước (count cao), hành động "real action" sau (count thấp)
const actionCategories: Record<string, { name: string; range: [number, number] }[]> = {
  'người yêu': [
    { name: 'Post story than ế', range: [50, 200] },
    { name: 'Watch "how to rizz" videos', range: [30, 100] },
    { name: 'Swipe dating apps vô thức', range: [100, 500] },
    { name: 'Actually nhắn crush first', range: [0, 2] },
    { name: 'Ra ngoài touch grass', range: [0, 3] },
  ],
  'tập gym': [
    { name: 'Save TikTok workout videos', range: [50, 300] },
    { name: 'Flex áo gym trên story', range: [10, 50] },
    { name: 'Nghiên cứu workout plans', range: [20, 100] },
    { name: 'Thực sự đến gym', range: [0, 5] },
    { name: 'Tập đủ 1 set', range: [0, 2] },
  ],
  'học': [
    { name: 'Collect khóa học như gacha', range: [5, 20] },
    { name: 'Vibe "mai mình học"', range: [30, 100] },
    { name: 'Làm Notion template đẹp', range: [10, 30] },
    { name: 'Actually ngồi học', range: [0, 5] },
    { name: 'Complete được 1 bài', range: [0, 2] },
  ],
  'tiết kiệm': [
    { name: 'Order Grab/Shopee Food', range: [20, 80] },
    { name: 'Mua đồ "flash sale hời quá"', range: [10, 50] },
    { name: 'Check banking stress', range: [50, 200] },
    { name: 'Actually tiết kiệm được', range: [0, 3] },
  ],
  'dậy sớm': [
    { name: 'Set 15+ alarms', range: [100, 500] },
    { name: 'Spam nút snooze', range: [50, 300] },
    { name: 'Hứa "tối nay ngủ sớm"', range: [100, 365] },
    { name: 'Dậy đúng alarm đầu tiên', range: [0, 5] },
  ],
  'default': [
    { name: 'Talk về việc này', range: [50, 200] },
    { name: 'Make plans chi tiết', range: [20, 80] },
    { name: 'Farm motivation content', range: [30, 100] },
    { name: 'Actually bắt tay làm', range: [0, 3] },
  ],
};

// Các kết luận cay đắng theo category (fallback khi không có Gemini) - GEN Z EDITION 🔥
const bitterConclusions: Record<string, string[]> = {
  'người yêu': [
    'Bro nghĩ mình ế vì số đen, nhưng thật ra là vì inbox bạn khô hơn sa mạc Sahara 💀',
    'Swipe phải cả ngày như kiếm side quest, nhưng nhắn tin = 0 lần. Bro đang farm ghost à? 👻',
    'Plot twist: Bạn không muốn có người yêu, bạn chỉ thích vibe "than ế trên mạng" thôi 🤡',
    'Crush của bạn đang vibe với ai đó còn bạn vibe với... nút refresh inbox 💔',
    'Bro ơi, WiFi nhà bạn không có tính năng auto-match crush đâu, out đi bro 🚶',
    'Relationship status: Committed... với việc than ế trên story 24/7 😭',
  ],
  'tập gym': [
    'Save video workout nhiều hơn squat, bro là gym content curator à? 🏋️‍♂️📱',
    'Áo tập còn nguyên nhãn mác, nhưng TikTok workout đã xem hết rồi - priorities sai bét 💀',
    'Gym membership đắt vãi nhưng dùng ít hơn cả acc Netflix free trial 🤡',
    'Bro nói "tập từ T2 này" cả năm rồi - bro đang farm lời hứa hay sao? 📅',
    'Protein shake của bro là... trà sữa đường 100%. Abs đâu mất tiêu rồi? 🧋',
    'Cơ bắp của bro chỉ active lúc... flex trên camera trước 📸',
  ],
  'học': [
    'Mua khóa học như mua gacha, nhưng progress bar mãi 0% - bro nghiện collector à? 🎮',
    'Deadline là sensei duy nhất của bro - panic mode = god mode activated 🔥',
    'Bro học giỏi nhất môn "Mai học", môn phụ là "Tuần sau làm" 📚',
    'Não của bro: 100% RAM cho TikTok, 0% cho Notion - ưu tiên chuẩn Gen Z 🧠',
    'Kế hoạch học của bro đẹp hơn cả Notion template, nhưng cũng chỉ... để ngắm 🎨',
    'Bro học "sorry" và "bruh" thuộc lòng hơn cả bảng Cửu Chương 💀',
  ],
  'tiết kiệm': [
    'Bro nói tiết kiệm nhưng Grab/Shopee đang tưởng niệm bro hàng tháng 🛵',
    'Flash sale là boss cuối của ví bro - và bro thua... 247 lần 💸',
    'Ví của bro cần đi therapy, nó bị PTSD vì bro tổn hại tâm lý quá 😭',
    'Bro rich trong dreams, broke khi check banking - đó gọi là duality of life 🏦',
    '"Đây là lần mua cuối" - câu nói kinh điển được spam 365 ngày/năm 🔄',
    'Bro tiết kiệm giỏi lắm... tiết kiệm sức ra ngoài thôi, order hết 🍔',
  ],
  'dậy sớm': [
    'Snooze button là bestie của bro - toxic relationship nhưng không thể rời xa 😴',
    '5 AM chỉ là concept art trong plans của bro thôi, thực tế thì 12 PM mới chạm giường 🌅',
    'Bro có 15 báo thức nhưng tất cả đều... vô dụng. Skill issue nghiêm trọng 🚨',
    '"Tối nay ngủ sớm" - biggest lie của năm, còn sắp top trending đấy 🤥',
    'Bro đặt báo thức nhiều hơn người yêu cũ gửi tin nhắn - nhưng đều bị... ghost 💀',
    'Bro dậy sớm... ở timeline khác. Đúng nghĩa multiverse luôn 🌌',
  ],
  'default': [
    'Bro speedrun "Nói suông" any% - WR holder đấy, congrats! 🏆',
    'Talk/Action ratio: 247:1 = Bro đang farm lời hứa hay sao? 📊',
    'Motivation của bro expire nhanh hơn story Instagram - 3 phút là cùng 💀',
    'Bro là CEO của Planning Inc. nhưng... công ty chưa làm được gì 🏢',
    'Ideas: SSS tier. Execution: Not found 404 - perfectly balanced 🎮',
    'Plot twist: "Mai làm" của bro và "tomorrow" không cùng timeline 📅',
    'Main character energy nhưng stuck ở arc 1 mãi - when is the timeskip? ⏱️',
    'Bro đang grinding... lời hứa. Đã đủ XP lên level "Thực sự làm" chưa? 🎯',
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

  // Base data (fallback values)
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
        // Sử dụng statistics từ AI nếu có, nếu không thì dùng fallback
        const statistics = aiResponse.statistics || {
          timesSaid: baseData.timesSaid,
          timesDone: baseData.timesDone,
          delayHours: baseData.delayHours,
          realPriority: baseData.realPriority,
        };

        // Sử dụng relatedActions từ AI nếu có, nếu không thì dùng local
        const relatedActions = aiResponse.relatedActions && aiResponse.relatedActions.length > 0
          ? aiResponse.relatedActions
          : generateBillDataLocal(confession).relatedActions;

        return {
          ...baseData,
          timesSaid: statistics.timesSaid,
          timesDone: statistics.timesDone,
          delayHours: statistics.delayHours,
          realPriority: statistics.realPriority,
          relatedActions,
          bitterConclusion: aiResponse.bitterConclusion,
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
  } else if (hours < 720) {
    const weeks = Math.floor(hours / 168);
    return `${weeks} tuần`;
  } else {
    const months = Math.floor(hours / 720);
    return `${months} tháng`;
  }
}

// Export helper để check Gemini status
export { isGeminiConfigured };
