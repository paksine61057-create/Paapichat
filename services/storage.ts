import { PAUpload } from '../types';

// ============================================================================
// เชื่อมต่อกับ Google Sheets ผ่าน Google Apps Script
// ============================================================================
const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwflqvOSKvyOdNBPg84ceNReiCIq1gM18ddNxDVyU7il-RDc-4Gt9iE7qtraizMxBoAVA/exec"; 

export const getUploads = async (): Promise<PAUpload[]> => {
  // หาก URL ไม่ถูกต้อง ให้ใช้ข้อมูลจำลอง
  if (!GOOGLE_APPS_SCRIPT_URL || GOOGLE_APPS_SCRIPT_URL.includes("วาง_URL")) {
     console.warn("ยังไม่ได้เชื่อมต่อ Google Sheets: กำลังใช้ข้อมูลจำลอง LocalStorage");
     return getLocalUploads();
  }

  try {
    // เพิ่ม redirect: 'follow' เพื่อให้แน่ใจว่าตามลิงก์ของ Google ไปได้ถูกต้อง
    // เพิ่ม Timestamp เพื่อป้องกัน Caching (Cache Busting)
    const nocacheUrl = `${GOOGLE_APPS_SCRIPT_URL}?t=${new Date().getTime()}`;

    const response = await fetch(nocacheUrl, {
        method: 'GET',
        redirect: 'follow'
    });

    if (!response.ok) throw new Error(`Network response was not ok: ${response.status}`);
    
    // ตรวจสอบว่าเป็น JSON หรือไม่ (บางครั้ง Google ส่ง HTML หน้า Login มาถ้าสิทธิ์ผิด)
    const text = await response.text();
    try {
        const data = JSON.parse(text);
        return data;
    } catch (e) {
        console.error("ได้รับข้อมูลที่ไม่ใช่ JSON (อาจเกิดจากสิทธิ์การเข้าถึงไม่ใช่ 'Everyone'):", text.substring(0, 100));
        throw new Error("Invalid JSON response");
    }
  } catch (error) {
    console.error("Error fetching from Google Sheets:", error);
    // กรณีโหลดไม่ได้ ให้ลองดึงจาก LocalStorage แทนชั่วคราว
    return getLocalUploads();
  }
};

export const saveUpload = async (upload: PAUpload): Promise<void> => {
  if (!GOOGLE_APPS_SCRIPT_URL || GOOGLE_APPS_SCRIPT_URL.includes("วาง_URL")) {
     return saveLocalUpload(upload);
  }

  try {
    // ส่งข้อมูลแบบ POST
    // สำคัญ: Google Apps Script Web App ต้องการ redirect: 'follow' ในบางกรณี
    await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors", // จำเป็นสำหรับ Web App
      cache: "no-cache",
      redirect: "follow",
      headers: {
        "Content-Type": "text/plain;charset=utf-8", // บังคับ text/plain เพื่อกัน CORS Preflight
      },
      body: JSON.stringify({
        action: "save",
        payload: upload
      }),
    });
    
    // เนื่องจากโหมด no-cors จะไม่ส่งค่า Response กลับมา เราจึงสมมติว่าสำเร็จถ้าไม่มี Error
    console.log("Sent data to Sheets via no-cors");
  } catch (error) {
    console.error("Error saving to Google Sheets:", error);
    throw error;
  }
};

export const deleteUpload = async (id: string): Promise<void> => {
  if (!GOOGLE_APPS_SCRIPT_URL || GOOGLE_APPS_SCRIPT_URL.includes("วาง_URL")) {
     return deleteLocalUpload(id);
  }

  try {
    await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      cache: "no-cache",
      redirect: "follow",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "delete",
        id: id
      }),
    });
    console.log("Sent delete request for ID:", id);
  } catch (error) {
    console.error("Error deleting from Google Sheets:", error);
    throw error;
  }
};

export const publishData = async (): Promise<string> => {
    return GOOGLE_APPS_SCRIPT_URL;
}

// --- Local Storage Fallback Functions (สำรองข้อมูลกรณีเน็ตหลุด) ---
const STORAGE_KEY = 'pa_web_data_uploads';
const MOCK_INITIAL_DATA = [
  {
    id: 'mock-1',
    indicator: 'd1-4',
    fileUrl: 'https://picsum.photos/800/600',
    fileType: 'IMAGE',
    uploadDate: new Date().toISOString(),
    caption: 'สื่อการสอน PowerPoint เรื่องพลังงานทดแทน (ตัวอย่าง)',
    thumbnailUrl: 'https://picsum.photos/800/600'
  }
];

const getLocalUploads = (): PAUpload[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_INITIAL_DATA));
    return MOCK_INITIAL_DATA as PAUpload[];
  }
  return JSON.parse(stored);
}

const saveLocalUpload = async (upload: PAUpload) => {
   const current = getLocalUploads();
   const updated = [upload, ...current];
   localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

const deleteLocalUpload = async (id: string) => {
   const current = getLocalUploads();
   const updated = current.filter((item: any) => item.id !== id);
   localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}