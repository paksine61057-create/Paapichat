import React, { useState } from 'react';
import { FileType, MenuItem } from '../types';
import { UploadCloud, Link as LinkIcon, FileText, Image as ImageIcon, Video, Loader2, Sparkles, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { saveUpload } from '../services/storage';
import { generateCaption } from '../services/gemini';
import { v4 as uuidv4 } from 'uuid';

interface UploadFormProps {
  indicator: MenuItem;
  onUploadComplete: () => void;
}

const UploadForm: React.FC<UploadFormProps> = ({ indicator, onUploadComplete }) => {
  const [fileType, setFileType] = useState<FileType>('LINK'); // Change default to LINK as it is the most reliable method
  const [file, setFile] = useState<File | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const handleAIHelp = async () => {
    if (!caption && !file && !urlInput) return;
    setIsGeneratingAI(true);
    try {
      const fileName = file ? file.name : (urlInput ? 'ลิงก์ภายนอก' : 'ยังไม่ได้ระบุไฟล์');
      const suggestion = await generateCaption(indicator.title, fileName, caption);
      setCaption(suggestion);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Helper to convert file to Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let finalUrl = '';

      if (fileType === 'LINK') {
        if (!urlInput.trim()) {
            alert('กรุณาวางลิงก์ผลงาน');
            setIsUploading(false);
            return;
        }
        finalUrl = urlInput;
      } else if (file) {
        // Convert to Base64
        try {
            finalUrl = await fileToBase64(file);
            
            // GOOGLE SHEETS LIMIT CHECK
            // Google Sheets cell limit is 50,000 characters.
            // A base64 string length is approx 1.33 * file size.
            // 35KB file ~ 47,000 chars. 
            // We set a safety limit of 45,000 chars.
            if (finalUrl.length > 45000) {
                alert(
                    "⚠️ บันทึกไม่ได้: ไฟล์มีขนาดใหญ่เกินไปสำหรับ Google Sheets\n\n" +
                    "Google Sheets รับข้อมูลได้ไม่เกิน 50,000 ตัวอักษร/ช่อง (ประมาณ 30KB)\n\n" +
                    "✅ วิธีแก้ไข: กรุณานำไฟล์ไปอัปโหลดที่ Google Drive แล้วนำ 'ลิงก์' มาวางแทนครับ"
                );
                setIsUploading(false);
                return;
            }

        } catch (err) {
            console.error("Error converting file", err);
            alert("ไม่สามารถอ่านไฟล์ได้");
            setIsUploading(false);
            return;
        }
      } else {
        alert('กรุณาเลือกไฟล์หรือใส่ลิงก์');
        setIsUploading(false);
        return;
      }

      await saveUpload({
        id: uuidv4(),
        indicator: indicator.id,
        fileUrl: finalUrl,
        fileType,
        uploadDate: new Date().toISOString(),
        caption: caption || 'ไม่มีคำอธิบาย',
        thumbnailUrl: fileType === 'IMAGE' ? finalUrl : undefined
      });

      // DELAY: Wait for 2 seconds to allow Google Sheets to finish writing
      // This prevents the "missing data" issue due to race conditions
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Reset form
      setFile(null);
      setUrlInput('');
      setCaption('');
      onUploadComplete();
      alert('บันทึกข้อมูลสำเร็จ!'); 
    } catch (error: any) {
      console.error("Upload failed", error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg shadow-purple-100 border border-purple-50 p-6 mb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-transparent rounded-bl-[100px] -mr-8 -mt-8 opacity-50 pointer-events-none"></div>
      
      <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 relative z-10">
        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg text-white shadow-md">
           <UploadCloud size={20} />
        </div>
        เพิ่มผลงานใหม่
        <span className="text-sm font-normal text-slate-500 ml-2">({indicator.title})</span>
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        {/* Type Selector */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">เลือกประเภทข้อมูล</label>
          <div className="flex gap-2 flex-wrap">
            {(['LINK', 'IMAGE', 'PDF', 'VIDEO', 'DOCX'] as FileType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                    setFileType(type);
                    setFile(null);
                    setUrlInput('');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-200 flex items-center gap-2
                  ${fileType === type 
                    ? 'bg-purple-600 text-white border-purple-600 shadow-md transform scale-105' 
                    : 'bg-white text-slate-600 border-slate-200 hover:border-purple-300 hover:text-purple-600'}`}
              >
                {type === 'LINK' && <LinkIcon size={16} />}
                {type === 'IMAGE' && <ImageIcon size={16} />}
                {type === 'PDF' && <FileText size={16} />}
                {type === 'DOCX' && <FileText size={16} />}
                {type === 'VIDEO' && <Video size={16} />}
                {type === 'LINK' ? 'ลิงก์ (แนะนำ)' : type}
              </button>
            ))}
          </div>
          {fileType !== 'LINK' && (
              <p className="text-xs text-orange-500 mt-2 flex items-center gap-1">
                 <AlertTriangle size={12} />
                 คำเตือน: การแนบไฟล์โดยตรงรองรับเฉพาะไฟล์ขนาดเล็กมาก (ไม่เกิน 30KB) หากไฟล์ใหญ่แนะนำให้ใช้แบบ "ลิงก์"
              </p>
          )}
           {fileType === 'DOCX' && (
              <p className="text-xs text-blue-500 mt-1 flex items-center gap-1">
                 <AlertTriangle size={12} />
                 ไฟล์ DOCX ที่อัปโหลดโดยตรง จะไม่แสดงตัวอย่างหน้าเว็บ (ต้องดาวน์โหลด) แนะนำให้อัปโหลด Google Drive แล้วใช้แบบ "ลิงก์" แทน
              </p>
          )}
        </div>

        {/* Input Area */}
        <div className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors group cursor-pointer ${fileType === 'LINK' ? 'border-purple-200 bg-purple-50/30' : 'border-slate-200 bg-slate-50'}`}>
          {fileType === 'LINK' ? (
            <div className="w-full">
               <label className="block text-xs font-medium text-slate-500 mb-1 flex justify-between">
                   <span>วางลิงก์ผลงาน (YouTube / Google Drive / Website)</span>
                   <a href="https://drive.google.com" target="_blank" rel="noreferrer" className="text-purple-600 flex items-center gap-1 hover:underline">
                      ไปที่ Google Drive <ExternalLink size={10}/>
                   </a>
               </label>
               <input
                type="url"
                placeholder="https://..."
                className="w-full p-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                required
              />
              <p className="text-[10px] text-slate-400 mt-2 text-center">
                  รองรับลิงก์จาก Google Drive (ตั้งค่าเป็น 'ทุกคนที่มีลิงก์'), YouTube หรือเว็บไซต์อื่นๆ
              </p>
            </div>
          ) : (
            <div className="text-center w-full relative">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept={
                  fileType === 'IMAGE' ? 'image/*' :
                  fileType === 'VIDEO' ? 'video/*' :
                  fileType === 'PDF' ? '.pdf' :
                  '.doc,.docx'
                }
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center w-full py-4">
                {file ? (
                  <div className="text-purple-700 font-bold flex flex-col items-center gap-2 animate-in fade-in zoom-in duration-300">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 size={24} className="text-purple-600"/>
                    </div>
                    {file.name}
                    <span className="text-xs font-normal text-purple-400">คลิกเพื่อเปลี่ยนไฟล์</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${file.size > 30000 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                        {(file.size / 1024).toFixed(2)} KB {file.size > 30000 && '(เกินขีดจำกัด)'}
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                         <UploadCloud className="text-slate-400 group-hover:text-purple-600 transition-colors" size={32} />
                    </div>
                    <span className="text-sm font-semibold text-slate-600 group-hover:text-purple-700">คลิกเพื่อเลือกไฟล์ {fileType}</span>
                    <span className="text-xs text-slate-400 mt-1">ขนาดไม่เกิน 30KB (ข้อจำกัด Google Sheets)</span>
                  </>
                )}
              </label>
            </div>
          )}
        </div>

        {/* Caption & AI */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-semibold text-slate-700">คำอธิบายผลงาน (Caption)</label>
            <button
              type="button"
              onClick={handleAIHelp}
              disabled={isGeneratingAI}
              className="text-xs bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1.5 rounded-full hover:shadow-md transition-all flex items-center gap-1.5 disabled:opacity-70"
            >
              {isGeneratingAI ? <Loader2 className="animate-spin" size={12} /> : <Sparkles size={12} />}
              ใช้ AI ช่วยเขียน
            </button>
          </div>
          <div className="relative">
            <textarea
              className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm min-h-[100px] bg-slate-50 focus:bg-white transition-colors"
              placeholder="อธิบายรายละเอียดของผลงานนี้..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isUploading}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-purple-200 hover:shadow-purple-300 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-70 flex justify-center items-center gap-2"
        >
          {isUploading && <Loader2 className="animate-spin" size={20} />}
          {isUploading ? 'กำลังบันทึกข้อมูล...' : 'บันทึกข้อมูล'}
        </button>
      </form>
    </div>
  );
};

export default UploadForm;