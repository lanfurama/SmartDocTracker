import { GoogleGenAI } from "@google/genai";
import { Document } from '../../domain/entities/Document';

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getDocInsights = async (doc: Document): Promise<string> => {
    const ai = getAI();

    const historyText = doc.history
        .map(h => `- ${h.timestamp}: ${h.action} tại ${h.location} bởi ${h.user} (${h.notes || 'Không ghi chú'})`)
        .join('\n');

    const prompt = `
    Dựa trên lịch sử luân chuyển của hồ sơ sau, hãy phân tích tình trạng hiện tại và đưa ra lời khuyên.
    Hồ sơ: ${doc.title} (${doc.id})
    Trạng thái hiện tại: ${doc.currentStatus}
    Người đang giữ: ${doc.currentHolder}
    
    Lịch sử chi tiết:
    ${historyText}

    Nếu thời gian ở bước cuối cùng > 24 giờ, hãy cảnh báo là "Điểm nghẽn".
    Trả về kết quả bằng Tiếng Việt, ngắn gọn, xúc tích.
  `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                temperature: 0.7,
                topP: 0.95,
            }
        });
        return response.text || "Không thể phân tích hồ sơ lúc này.";
    } catch (error) {
        console.error("Gemini Error:", error);
        return "Không thể phân tích hồ sơ lúc này.";
    }
};

export const generateStatusUpdateNote = async (action: string, context: string): Promise<string> => {
    const ai = getAI();
    const prompt = `Tạo một ghi chú ngắn gọn (dưới 20 từ) cho hành động "${action}" trong bối cảnh "${context}". Ví dụ: "Hồ sơ đầy đủ, chuyển bước tiếp theo".`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
        });
        return response.text || "";
    } catch {
        return "";
    }
};
