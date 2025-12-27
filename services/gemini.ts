import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || ''; // Ensure this is set in your environment
const ai = new GoogleGenAI({ apiKey });

export const generateCaption = async (
  indicatorTitle: string,
  fileName: string,
  userNotes: string
): Promise<string> => {
  if (!apiKey) {
    console.warn("API Key is missing for Gemini");
    return "API Key missing. Please configure your environment.";
  }

  try {
    const prompt = `
      คุณคือผู้ช่วยครูวิชาชีพ (Teacher PA). 
      เขียนคำอธิบาย (Caption) สั้นๆ แต่เป็นทางการ สำหรับใช้ในรายงานผลการปฏิบัติงาน (PA)
      
      บริบท:
      - ตัวชี้วัด: ${indicatorTitle}
      - ชื่อไฟล์: ${fileName}
      - บันทึกย่อจากครู: ${userNotes}
      
      สิ่งที่ต้องการ:
      - เขียนคำอธิบายความยาว 1-2 ประโยค
      - ภาษาไทยทางการ
      - เน้นผลลัพธ์ที่เกิดกับผู้เรียนหรือการพัฒนาการสอน
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    return "ไม่สามารถสร้างคำอธิบายได้ในขณะนี้";
  }
};