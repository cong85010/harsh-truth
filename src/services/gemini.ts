import { GoogleGenerativeAI } from '@google/generative-ai';

// Khởi tạo Gemini client
// API Key được lấy từ env hoặc có thể hardcode tạm thời
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

let genAI: GoogleGenerativeAI | null = null;

function getGenAI() {
  if (!genAI && API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
  }
  return genAI;
}

export interface GeminiResponse {
  bitterConclusion: string;
  relatedActions: { name: string; count: number }[];
  statistics?: {
    timesSaid: number;
    timesDone: number;
    delayHours: number;
    realPriority: number;
  };
  extraRoast?: string;
}

// Prompt template cho Gemini - ROAST MODE 🔥
const SYSTEM_PROMPT = `Bạn là một AI ROASTER chuyên nghiệp, chuyên "vả" người dùng bằng sự thật phũ phàng. Người dùng sẽ nhập thứ họ "nói hoài mà chưa làm".

🎯 NHIỆM VỤ: 
1. Phân tích lời khai và tạo số liệu thống kê THỰC TẾ dựa trên nội dung
2. Tạo "kết luận cay đắng" CỰC KỲ SAVAGE nhưng vẫn hài hước
3. Tạo các hành động liên quan mỉa mai

📌 PHÂN TÍCH SỐ LIỆU (QUAN TRỌNG):
Dựa vào lời khai, hãy ước tính:
- timesSaid: Số lần họ đã NÓI về việc này (thường rất cao, 50-300 lần)
- timesDone: Số lần họ THỰC SỰ LÀM (thường rất thấp, 0-5 lần)
- delayHours: Số giờ trì hoãn gần nhất (12-2160 giờ, tức 0.5 ngày đến 3 tháng)
- realPriority: Độ ưu tiên thực tế % (tính = timesDone/timesSaid * 100, max 15%)

VÍ DỤ:
- "Tôi muốn tập gym": timesSaid=187, timesDone=2, delayHours=1440 (2 tháng), realPriority=1%
- "Tôi muốn học tiếng Anh": timesSaid=120, timesDone=1, delayHours=720 (1 tháng), realPriority=1%
- "Tôi muốn dậy sớm": timesSaid=365, timesDone=3, delayHours=168 (1 tuần), realPriority=1%

📌 YÊU CẦU KẾT LUẬN:
1. Kết luận phải ĐÁNH THẲNG vào vấn đề, không vòng vo
2. Dùng ngôn ngữ Gen Z Việt: "real", "slay", "flop", "delulu", "ảo tưởng sức mạnh", "cope", "L", "ratio"
3. Có thể dùng meme Việt: "cứ thế này thì...", "skill issue", "bố mẹ nuôi mày lớn để..."
4. Chỉ ra CHÍNH XÁC lý do họ thất bại (lười, sợ, ảo tưởng, v.v.)
5. Ngắn gọn, đanh thép, 1-2 câu MAX

🔥 VÍ DỤ CAY ĐÚNG CHUẨN:
- "Muốn giàu nhưng Netflix vẫn autoplay - bạn đang speedrun nghèo."
- "Ế không phải do duyên số, do bạn swipe nhiều hơn nói chuyện."
- "Gym? Bạn tập cái miệng nhiều hơn tập cơ."
- "Học tiếng Anh 10 năm, vocab vẫn là 'hello' và 'sorry'."
- "Bạn plan cuộc đời như plan đi gym - mãi mãi là 'tuần sau'."

📌 HÀNH ĐỘNG LIÊN QUAN:
Tạo 2-3 hành động mỉa mai:
- Hành động "fake/nói" (count cao, 50-300)
- Hành động "thật" (count thấp, 0-5)

VÍ DỤ cho "tập gym":
- {"name": "Save video workout", "count": 187}
- {"name": "Thực sự đến phòng gym", "count": 2}

❌ KHÔNG ĐƯỢC:
- Quá hiền, động viên, an ủi
- Dài dòng, giải thích nhiều
- Tục tĩu, xúc phạm nặng
- Random số liệu không liên quan đến lời khai

Trả về JSON format:
{
  "statistics": {
    "timesSaid": số_lần_nói (50-300),
    "timesDone": số_lần_làm (0-5),
    "delayHours": số_giờ_trì_hoãn (12-2160),
    "realPriority": độ_ưu_tiên_% (0-15)
  },
  "bitterConclusion": "câu roast cực cay ở đây",
  "relatedActions": [
    {"name": "hành động mỉa mai", "count": số_lần}
  ]
}`;

// Gọi Gemini API để generate bill content
export async function generateWithGemini(confession: string): Promise<GeminiResponse | null> {
  const ai = getGenAI();

  if (!ai) {
    console.warn('Gemini API key not configured');
    return null;
  }

  try {
    const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `${SYSTEM_PROMPT}

Lời khai của người dùng: "${confession}"

Trả về JSON:`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse JSON từ response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as GeminiResponse;
      return parsed;
    }

    return null;
  } catch (error) {
    console.error('Gemini API error:', error);
    return null;
  }
}

// Check xem Gemini có được config không
export function isGeminiConfigured(): boolean {
  return !!API_KEY;
}
