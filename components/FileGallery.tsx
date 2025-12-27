import React, { useState, useEffect } from 'react';
import { PAUpload } from '../types';
import { FileText, ExternalLink, Trash2, Calendar, Maximize2, Download, X, Eye, FileImage, FileVideo, Globe, Loader2, Info } from 'lucide-react';

interface FileGalleryProps {
  uploads: PAUpload[];
  onDelete: (id: string) => void;
  readOnly?: boolean;
}

const SafePdfViewer: React.FC<{ url: string; isFullscreen?: boolean }> = ({ url, isFullscreen }) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isExternal, setIsExternal] = useState(false);

  useEffect(() => {
    if (!url) return;

    if (url.startsWith('data:application/pdf;base64,')) {
      // สำหรับไฟล์อัปโหลด: แปลง Base64 เป็น Blob URL เพื่อความเสถียรสูงสุด
      try {
        const base64Content = url.split(',')[1];
        const binaryString = window.atob(base64Content);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const objUrl = URL.createObjectURL(blob);
        setBlobUrl(objUrl);
        setIsExternal(false);
      } catch (e) {
        console.error("PDF Blob error:", e);
      }
    } else {
      // สำหรับลิงก์ภายนอก: ใช้ Google Docs Viewer เพื่อดึงเนื้อหามาแสดงในกรอบ
      setIsExternal(true);
      setBlobUrl(`https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`);
    }

    return () => {
      if (blobUrl && !isExternal) URL.revokeObjectURL(blobUrl);
    };
  }, [url]);

  if (!blobUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-slate-400">
        <Loader2 className="animate-spin mb-2" />
        <span className="text-xs">กำลังจัดเตรียมเอกสาร...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white relative">
      <iframe
        src={blobUrl}
        className="w-full h-full border-0"
        title="Document Viewer"
        key={blobUrl}
        loading="lazy"
      ></iframe>
    </div>
  );
};

const FileGallery: React.FC<FileGalleryProps> = ({ uploads, onDelete, readOnly = false }) => {
  const [fullscreenFile, setFullscreenFile] = useState<PAUpload | null>(null);

  if (uploads.length === 0) {
    return (
      <div className="text-center py-16 bg-white/50 rounded-2xl border-2 border-dashed border-purple-100 backdrop-blur-sm animate-in fade-in duration-500">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-50 mb-4">
          <FileText className="text-purple-300" size={32} />
        </div>
        <p className="text-slate-500 font-medium">ยังไม่มีข้อมูลผลงานในหัวข้อนี้</p>
      </div>
    );
  }

  // ตัวแปลงลิงก์ Google Drive ให้แสดงผลได้ทันที
  const getGoogleDriveEmbedUrl = (url: string) => {
    try {
      if (!url.includes('google.com')) return null;
      
      let id = '';
      // ค้นหา ID จากรูปแบบต่างๆ ของ Google Drive
      const dMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (dMatch) id = dMatch[1];
      
      if (!id) {
        const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (idMatch) id = idMatch[1];
      }
      
      if (!id) return null;

      // ปรับรูปแบบตามประเภทบริการ
      if (url.includes('/document/')) return `https://docs.google.com/document/d/${id}/preview`;
      if (url.includes('/presentation/')) return `https://docs.google.com/presentation/d/${id}/preview`;
      if (url.includes('/spreadsheets/')) return `https://docs.google.com/spreadsheets/d/${id}/preview`;
      if (url.includes('/forms/')) return `https://docs.google.com/forms/d/${id}/viewform?embedded=true`;
      
      // ไฟล์ทั่วไป (PDF, Video, etc.)
      return `https://drive.google.com/file/d/${id}/preview`;
    } catch (e) { return null; }
  };

  const getYoutubeEmbedUrl = (url: string) => {
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
    } catch (e) { return null; }
  };

  const isImageLink = (url: string) => /\.(jpeg|jpg|gif|png|webp|svg|bmp)$/i.test(url.split('?')[0]);

  const renderInlineContent = (file: PAUpload, isFullscreen = false) => {
    const containerClass = `w-full bg-white relative group overflow-hidden ${isFullscreen ? 'h-full' : 'h-[600px] md:h-[750px]'}`;

    // 1. IMAGE (Upload / Link)
    if (file.fileType === 'IMAGE') {
      return (
        <div className={`w-full bg-slate-100 flex justify-center h-full ${!isFullscreen ? 'cursor-pointer' : ''}`} onClick={() => !isFullscreen && setFullscreenFile(file)}>
          <img src={file.fileUrl} alt={file.caption} className="w-full h-full object-contain" />
        </div>
      );
    }
    
    // 2. VIDEO (Upload)
    if (file.fileType === 'VIDEO') {
      return (
        <div className="w-full h-full bg-black flex items-center justify-center">
          <video controls preload="metadata" className="w-full max-h-full">
            <source src={file.fileUrl} />
          </video>
        </div>
      );
    }
    
    // 3. PDF (Upload)
    if (file.fileType === 'PDF') {
      return (
        <div className={containerClass}>
          <SafePdfViewer url={file.fileUrl} isFullscreen={isFullscreen} />
        </div>
      );
    }

    // 4. DOCX (Upload / Link)
    if (file.fileType === 'DOCX') {
      if (file.fileUrl.startsWith('data:')) {
        return (
          <div className="w-full bg-slate-50 flex flex-col items-center justify-center p-12 text-center h-full border-2 border-dashed border-slate-200">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <FileText size={48} className="text-blue-600" />
            </div>
            <h4 className="text-xl font-bold text-slate-800">เอกสาร Microsoft Word</h4>
            <p className="text-slate-500 mt-2 mb-8 max-w-sm">ไฟล์ Word ที่อัปโหลดโดยตรงไม่สามารถพรีวิวได้ <br/> แนะนำให้อัปโหลดผ่าน Google Drive เพื่อแสดงผลที่นี่</p>
            <a href={file.fileUrl} download="document.docx" className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2">
              <Download size={20}/> ดาวน์โหลดเอกสาร
            </a>
          </div>
        );
      }
      return (
        <div className={containerClass}>
          <SafePdfViewer url={file.fileUrl} isFullscreen={isFullscreen} />
        </div>
      );
    }

    // 5. LINK (YouTube / Drive / General)
    if (file.fileType === 'LINK') {
      // 5.1 YouTube
      const youtubeUrl = getYoutubeEmbedUrl(file.fileUrl);
      if (youtubeUrl) {
        return (
          <div className={`w-full bg-black ${isFullscreen ? 'h-full flex items-center' : 'aspect-video'}`}>
            <iframe src={youtubeUrl} className="w-full h-full" allowFullScreen title="YouTube"></iframe>
          </div>
        );
      }

      // 5.2 Google Drive (Smart Detection)
      const driveUrl = getGoogleDriveEmbedUrl(file.fileUrl);
      if (driveUrl) {
        return (
          <div className={containerClass}>
            <iframe src={driveUrl} className="w-full h-full" title="Drive Preview" allow="autoplay" loading="lazy"></iframe>
            {/* Note for Drive Links */}
            <div className="absolute top-4 left-4 z-20 pointer-events-none">
              <div className="bg-black/60 backdrop-blur text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                แสดงผลผ่าน Google Drive
              </div>
            </div>
          </div>
        );
      }

      // 5.3 Image Link
      if (isImageLink(file.fileUrl)) {
        return (
          <div className="w-full h-full bg-slate-100 flex justify-center">
            <img src={file.fileUrl} alt={file.caption} className="w-full h-full object-contain" />
          </div>
        );
      }

      // 5.4 Fallback: General Website Iframe
      return (
        <div className={containerClass}>
          <iframe src={file.fileUrl} className="w-full h-full" title="Web Preview" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" loading="lazy"></iframe>
          <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-30 flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity">
             <div className="text-white">
                <p className="text-xs font-bold flex items-center gap-1"><Globe size={12}/> ลิงก์ภายนอก</p>
                <p className="text-[10px] opacity-70">หากหน้าจอว่างเปล่า ให้กดปุ่มเปิดเว็บไซต์</p>
             </div>
             <a href={file.fileUrl} target="_blank" rel="noreferrer" className="bg-white text-blue-600 px-5 py-2.5 rounded-full text-sm font-bold shadow-xl hover:bg-blue-50 transition-all flex items-center gap-2">
                <ExternalLink size={16}/> เปิดเว็บไซต์ต้นทาง
             </a>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex items-center justify-between border-b-2 border-purple-100 pb-4">
        <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-4">
          <div className="w-2 h-10 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full shadow-sm"></div>
          รายการหลักฐานและผลงาน ({uploads.length})
        </h3>
        {uploads.length > 0 && (
           <div className="hidden md:flex items-center gap-2 text-xs font-medium text-purple-400 bg-purple-50 px-3 py-1.5 rounded-full">
              <Info size={14} /> แนะนำ: ตั้งค่าลิงก์ Drive เป็น "ทุกคนที่มีลิงก์" เพื่อการแสดงผลที่ถูกต้อง
           </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 gap-16">
        {uploads.map((item) => (
          <div key={item.id} className="bg-white rounded-[2rem] shadow-2xl shadow-purple-900/5 border border-slate-100 overflow-hidden flex flex-col transition-all hover:shadow-purple-500/10 hover:-translate-y-1 duration-500">
            {/* Control Header */}
            <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <div className="flex items-center gap-4">
                <span className={`text-[11px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border-2 ${
                  item.fileType === 'IMAGE' ? 'bg-purple-100 text-purple-700 border-purple-200' : 
                  item.fileType === 'VIDEO' ? 'bg-pink-100 text-pink-700 border-pink-200' :
                  item.fileType === 'PDF' ? 'bg-red-100 text-red-700 border-red-200' :
                  item.fileType === 'DOCX' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                }`}>{item.fileType}</span>
                <span className="text-sm text-slate-400 font-bold flex items-center gap-2"><Calendar size={16} /> {new Date(item.uploadDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setFullscreenFile(item)} className="p-3 text-slate-400 hover:text-purple-600 hover:bg-white rounded-2xl transition-all shadow-sm border border-transparent hover:border-purple-100" title="ขยายเต็มจอ"><Maximize2 size={20} /></button>
                {!readOnly && <button onClick={() => onDelete(item.id)} className="p-3 text-slate-400 hover:text-white hover:bg-red-500 rounded-2xl transition-all shadow-sm border border-transparent hover:border-red-100" title="ลบรายการ"><Trash2 size={20} /></button>}
              </div>
            </div>

            {/* Main Content Display */}
            <div className="flex-1 bg-slate-50 relative min-h-[400px]">
              {renderInlineContent(item)}
            </div>

            {/* Information Footer */}
            <div className="p-10 bg-white">
              <div className="flex items-start gap-4">
                 <div className="mt-1.5 bg-gradient-to-br from-purple-500 to-pink-500 p-2.5 rounded-2xl text-white shadow-lg shadow-purple-200">
                    <FileText size={20}/>
                 </div>
                 <div className="flex-1">
                    <p className="text-xl text-slate-800 font-bold leading-relaxed mb-2">{item.caption}</p>
                    <div className="flex items-center gap-4 mt-4">
                       <a href={item.fileUrl} target="_blank" rel="noreferrer" className="text-sm font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1.5 group">
                          ดูไฟล์ต้นฉบับ <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"/>
                       </a>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Fullscreen Overlay */}
      {fullscreenFile && (
        <div className="fixed inset-0 z-[100] bg-slate-900/98 backdrop-blur-xl flex flex-col animate-in fade-in duration-300">
          <div className="flex items-center justify-between px-10 py-6 border-b border-white/10">
            <div>
               <h3 className="text-white font-bold text-xl truncate pr-10">{fullscreenFile.caption}</h3>
               <p className="text-white/40 text-xs mt-1">โหมดแสดงผลเต็มหน้าจอ</p>
            </div>
            <button onClick={() => setFullscreenFile(null)} className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-2xl transition-all border border-white/10"><X size={32} /></button>
          </div>
          <div className="flex-1 overflow-hidden p-6 md:p-12 flex items-center justify-center">
            <div className="w-full max-w-[95vw] h-full shadow-2xl rounded-3xl overflow-hidden bg-white">
              {renderInlineContent(fullscreenFile, true)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileGallery;