import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import UploadForm from './components/UploadForm';
import FileGallery from './components/FileGallery';
import { MENU_STRUCTURE, USER_PROFILE } from './constants';
import { getUploads, deleteUpload, publishData } from './services/storage';
import { PAUpload } from './types';
import { Menu, Globe, AlertCircle, RefreshCcw, Eye, Settings, Briefcase, Award, Star, BookOpen, Layers, Target, Users, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [activeMenuId, setActiveMenuId] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [uploads, setUploads] = useState<PAUpload[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  
  // State for toggling between Admin (Owner) and Public (Viewer) modes
  const [isPublicView, setIsPublicView] = useState(false);

  const activeMenuItem = MENU_STRUCTURE.find(item => item.id === activeMenuId) || MENU_STRUCTURE[0];

  const fetchData = async () => {
    // Only show loading on initial load to prevent flashing during updates
    if (uploads.length === 0) setIsLoading(true);
    try {
      const data = await getUploads();
      setUploads(data);
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('คุณต้องการลบรายการนี้ใช่หรือไม่?')) {
      // 1. Optimistic Update: Remove from UI immediately so it feels instant
      const previousUploads = [...uploads];
      setUploads(prev => prev.filter(item => item.id !== id));

      try {
        // 2. Call Backend to delete from Sheets
        await deleteUpload(id);

        // 3. Delay needed for Google Sheets consistency (Read-after-Write lag)
        // Increased to 3500ms to be safe
        await new Promise(resolve => setTimeout(resolve, 3500));

        // 4. Refetch to ensure sync
        await fetchData();
      } catch (error) {
        console.error("Delete failed", error);
        alert("เกิดข้อผิดพลาดในการลบข้อมูลที่ Server");
        // Revert UI if failed
        setUploads(previousUploads);
      }
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
        await publishData();
        alert("อัปเดตข้อมูลหน้าเว็บสำเร็จ (Mock)");
    } catch (e) {
        alert("เกิดข้อผิดพลาด");
    } finally {
        setIsPublishing(false);
    }
  };

  // Helper to determine header theme based on domain
  const getHeaderTheme = (id: string) => {
    // Domain 1: Orange-Yellow Gradient
    if (id.startsWith('d1')) {
      return {
        wrapper: "bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-white shadow-orange-200",
        icon: <BookOpen size={200} />,
        iconColor: "text-white",
        subText: "text-orange-50",
        badge: "bg-white/20 text-white border-white/30",
        watermarkClass: "text-white opacity-10 -rotate-12",
        glow: "bg-yellow-400"
      };
    }
    // Domain 2: Blue-Sky Gradient
    if (id.startsWith('d2')) {
      return {
        wrapper: "bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 text-white shadow-blue-200",
        icon: <Users size={200} />,
        iconColor: "text-white",
        subText: "text-blue-50",
        badge: "bg-white/20 text-white border-white/30",
        watermarkClass: "text-white opacity-10 rotate-12",
        glow: "bg-cyan-400"
      };
    }
    // Domain 3: Gray-Gold Gradient
    if (id.startsWith('d3')) {
      return {
        wrapper: "bg-gradient-to-r from-slate-800 via-slate-700 to-yellow-600 text-white shadow-slate-200",
        icon: <Sparkles size={200} />,
        iconColor: "text-yellow-400",
        subText: "text-slate-200",
        badge: "bg-white/10 text-yellow-100 border-white/20",
        watermarkClass: "text-yellow-500 opacity-10 -rotate-6",
        glow: "bg-yellow-500"
      };
    }
    // Default (Challenge, Home, etc.)
    return {
      wrapper: "bg-white border border-purple-100 text-slate-800 shadow-sm",
      icon: <Layers size={200} />,
      iconColor: "text-purple-600",
      subText: "text-slate-500",
      badge: "bg-purple-50 text-purple-600 border-purple-100",
      watermarkClass: "text-purple-500 opacity-[0.03]",
      glow: "bg-purple-500"
    };
  };

  const theme = getHeaderTheme(activeMenuId);
  const isDefaultTheme = !activeMenuId.startsWith('d1') && !activeMenuId.startsWith('d2') && !activeMenuId.startsWith('d3');

  // Filter uploads for current view
  const currentUploads = uploads.filter(u => u.indicator === activeMenuId);

  return (
    <div className={`flex h-screen bg-[#fdf8fc] font-sans selection:bg-pink-200 selection:text-pink-900 overflow-hidden`}>
      <Sidebar 
        activeId={activeMenuId} 
        onSelect={setActiveMenuId} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Unified Sticky Header (Visible on Mobile & Desktop) */}
        <header className="bg-white/90 backdrop-blur-md border-b border-purple-100 shadow-sm z-30 sticky top-0 w-full shrink-0 h-[72px] flex items-center justify-between px-4 md:px-8 transition-all">
           {/* Background Pattern */}
           <div className="absolute inset-0 bg-gradient-to-r from-purple-50/50 to-pink-50/50 opacity-50 pointer-events-none"></div>
           <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{backgroundImage: 'radial-gradient(circle at 1px 1px, black 1px, transparent 0)', backgroundSize: '16px 16px'}}></div>
           
           {/* Left Content */}
           <div className="relative z-10 flex items-center gap-4">
              {/* Mobile Menu Button */}
              <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-purple-800 p-2 hover:bg-white/50 rounded-lg transition-colors shadow-sm bg-white/50 backdrop-blur">
                <Menu size={24} />
              </button>
              
              {/* Mobile Name */}
              <div className="md:hidden">
                   <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Teacher PA</span>
                   <span className="block font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-600 truncate max-w-[160px]">
                     {USER_PROFILE.name}
                   </span>
              </div>

              {/* Desktop Page Title */}
              <div className="hidden md:flex flex-col animate-in fade-in slide-in-from-left-2 duration-300">
                  <h2 className="text-lg font-bold text-slate-800 leading-tight">
                    {activeMenuItem.title}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {isPublicView ? 'มุมมองเผยแพร่ผลงาน' : 'ระบบจัดการข้อมูล PA'}
                  </p>
              </div>
           </div>
           
           {/* Right Content */}
           <div className="relative z-10 flex items-center gap-3">
              <div className="flex items-center bg-white/60 backdrop-blur-sm p-1 rounded-xl border border-purple-100 shadow-sm transition-all hover:shadow-md hover:bg-white/80">
                  <span className="hidden md:block text-xs font-bold text-slate-500 px-3 select-none">
                     {isPublicView ? 'มุมมองบุคคลทั่วไป' : 'มุมมองเจ้าของผลงาน'}
                  </span>
                  <button 
                    onClick={() => setIsPublicView(!isPublicView)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm transform active:scale-95
                        ${isPublicView 
                            ? 'bg-slate-800 text-white hover:bg-slate-700' 
                            : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90'
                        }`}
                  >
                    {isPublicView ? (
                        <><Settings size={14} /> <span className="hidden sm:inline">แก้ไข</span></>
                    ) : (
                        <><Eye size={14} /> <span className="hidden sm:inline">ดูตัวอย่าง</span></>
                    )}
                  </button>
              </div>
           </div>
           
           {/* Bottom Gradient Line */}
           <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200 opacity-50"></div>
        </header>

        {/* Main Content Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-10 relative scroll-smooth bg-slate-50/50">
          <div className="max-w-6xl mx-auto pb-20">
            
            {/* Page Header Logic */}
            {activeMenuId === 'home' ? (
               /* Home Header (Only visible in Admin mode now, as public home shows Hero) */
               !isPublicView && (
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-purple-100/50">
                    <div className="flex-1">
                        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-2 tracking-tight leading-snug">
                            ยินดีต้อนรับ
                        </h1>
                        <p className="text-slate-500 font-medium text-sm md:text-base">
                            เริ่มต้นจัดการข้อมูลผลงานทางวิชาการของคุณ
                        </p>
                    </div>
                    <button 
                        onClick={handlePublish}
                        disabled={isPublishing}
                        className="self-start md:self-end flex items-center gap-2 bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50 px-5 py-2.5 rounded-xl transition-all text-sm font-bold shadow-sm whitespace-nowrap active:scale-95"
                    >
                        {isPublishing ? <RefreshCcw className="animate-spin" size={18}/> : <Globe size={18} />}
                        เผยแพร่ข้อมูล
                    </button>
                  </div>
               )
            ) : (
               /* Indicator Page Header - Dynamic Themes */
               <div className={`relative rounded-2xl p-8 mb-8 overflow-hidden text-center group transition-all duration-500 ${theme.wrapper} ${!isDefaultTheme ? 'shadow-lg border-0' : ''}`}>
                  
                  {/* Watermark Graphic */}
                  <div className={`absolute -right-10 -bottom-10 pointer-events-none transform transition-transform duration-700 group-hover:scale-110 ${theme.watermarkClass}`}>
                     {theme.icon}
                  </div>
                  
                  {/* Abstract Background Elements (Only for colored themes) */}
                  {!isDefaultTheme && (
                      <>
                        <div className="absolute top-0 left-0 w-full h-full opacity-20" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px'}}></div>
                        <div className={`absolute top-0 right-0 w-64 h-64 ${theme.glow} rounded-full blur-[100px] opacity-30 -mr-20 -mt-20`}></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-[80px] opacity-20 -ml-10 -mb-10"></div>
                      </>
                  )}
                  
                  <div className="relative z-10 flex flex-col items-center">
                     {/* Icon Badge */}
                     <span className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 shadow-sm border backdrop-blur-sm ${theme.badge}`}>
                        {activeMenuId.startsWith('d1') ? <BookOpen size={28} /> : 
                         activeMenuId.startsWith('d2') ? <Users size={28} /> : 
                         activeMenuId.startsWith('d3') ? <Sparkles size={28} /> : 
                         activeMenuId === 'challenge' ? <Target size={28} /> :
                         <Layers size={28} />}
                     </span>
                     
                     <h1 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight drop-shadow-sm">
                        {activeMenuItem.title}
                     </h1>
                     
                     <div className={`h-1 w-24 rounded-full mb-4 opacity-50 ${isDefaultTheme ? 'bg-gradient-to-r from-transparent via-purple-300 to-transparent' : 'bg-white/40'}`}></div>
                     
                     <p className={`font-medium text-sm md:text-base max-w-2xl leading-relaxed ${theme.subText}`}>
                        {activeMenuItem.description || 'หลักฐานและร่องรอยการปฏิบัติงานเพื่อประกอบการพิจารณาประเมินผลการปฏิบัติงาน (PA)'}
                     </p>
                  </div>

                  {/* Publish Button for Indicator Pages (Admin only) */}
                  {!isPublicView && (
                     <div className="absolute top-4 right-4 z-20">
                        <button 
                            onClick={handlePublish}
                            disabled={isPublishing}
                            className={`p-2 rounded-lg transition-colors backdrop-blur-sm border border-white/20 hover:bg-white/20 ${isDefaultTheme ? 'text-emerald-600 hover:bg-emerald-50' : 'text-white'}`}
                            title="บันทึกและเผยแพร่ข้อมูล"
                        >
                            {isPublishing ? <RefreshCcw className="animate-spin" size={20}/> : <Globe size={20} />}
                        </button>
                     </div>
                  )}
               </div>
            )}

            {/* Dashboard / Home View */}
            {activeMenuId === 'home' && (
              <div className="space-y-8 animate-in fade-in zoom-in duration-500">
                {/* Hero Section for Public View */}
                {isPublicView && (
                    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#2e1065] to-[#701a75] text-white shadow-2xl mb-10 border border-white/10 group">
                        {/* Background Effects */}
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-pink-500 rounded-full blur-3xl opacity-20"></div>
                        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                        
                        <div className="relative z-10 flex flex-col items-center justify-center p-8 md:p-16 gap-10 text-center">
                            
                            {/* Text Content */}
                            <div className="max-w-4xl z-20">
                                <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-pink-200 text-xs font-bold mb-6 tracking-widest border border-white/10 shadow-sm">
                                    PERFORMANCE AGREEMENT (PA)
                                </span>
                                <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight drop-shadow-lg">
                                    รายงานผลการปฏิบัติงาน<br/>
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-200 to-indigo-200">
                                       {USER_PROFILE.name}
                                    </span>
                                </h1>
                                
                                <div className="text-base md:text-lg text-purple-100 font-light leading-relaxed max-w-2xl mx-auto bg-white/5 p-6 rounded-2xl backdrop-blur-sm border border-white/10 shadow-lg">
                                    <p className="font-semibold text-white text-lg">ตำแหน่ง {USER_PROFILE.position}</p>
                                    <p className="mt-1 text-pink-200 opacity-90">{USER_PROFILE.school}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Stat Card 1 */}
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-purple-50 relative overflow-hidden group hover:shadow-lg transition-all hover:-translate-y-1">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-100 rounded-full -mr-8 -mt-8 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                            <Briefcase size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700">ผลงานทั้งหมด</h3>
                        <p className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mt-2">{uploads.length}</p>
                        <p className="text-xs text-slate-400 mt-2 font-medium">รายการไฟล์ในระบบ</p>
                    </div>
                  </div>

                  {/* Stat Card 2 */}
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-pink-50 relative overflow-hidden group hover:shadow-lg transition-all hover:-translate-y-1">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-pink-100 rounded-full -mr-8 -mt-8 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center mb-4 text-pink-600 group-hover:bg-pink-600 group-hover:text-white transition-colors">
                            <Award size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700">ตัวชี้วัดที่ดำเนินการ</h3>
                        <p className="text-4xl font-extrabold text-slate-800 mt-2">
                             {new Set(uploads.map(u => u.indicator)).size} <span className="text-lg text-slate-400 font-normal">/ 15</span>
                        </p>
                        <p className="text-xs text-slate-400 mt-2 font-medium">ความก้าวหน้า</p>
                    </div>
                  </div>

                  {/* Stat Card 3 */}
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-2xl shadow-lg text-white relative overflow-hidden group hover:shadow-xl transition-all">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl opacity-20 -mr-10 -mt-10 group-hover:opacity-30 transition-opacity"></div>
                     <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-4 text-white">
                            <Star size={24} />
                        </div>
                        <h3 className="text-lg font-bold opacity-90">อัปเดตล่าสุด</h3>
                        <p className="text-xl font-bold mt-2">
                            {uploads.length > 0 ? new Date(uploads[0].uploadDate).toLocaleDateString('th-TH') : 'ยังไม่มีข้อมูล'}
                        </p>
                        <p className="text-xs opacity-60 mt-2">วันที่บันทึกข้อมูลล่าสุด</p>
                     </div>
                  </div>
                </div>

                {!isPublicView && (
                    <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-2xl flex flex-col md:flex-row items-start gap-4">
                    <div className="bg-blue-100 text-blue-600 p-3 rounded-full shrink-0">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-blue-800 text-lg">ยินดีต้อนรับ คุณครูอภิชาติ ชุมพล</h4>
                        <p className="text-sm text-blue-600/80 mt-2 leading-relaxed">
                        ระบบนี้จะช่วยรวบรวมและจัดระเบียบผลงานทางวิชาการของคุณให้ง่ายและสวยงาม<br/>
                        1. เลือกตัวชี้วัดจากเมนูซ้ายมือ<br/>
                        2. อัปโหลดรูปภาพ วิดีโอ หรือลิงก์ Google Drive<br/>
                        3. ใช้ AI เขียนคำอธิบายให้ดูเป็นมืออาชีพ<br/>
                        4. เมื่อเสร็จสิ้น สามารถกดปุ่ม <span className="font-bold">ดูหน้าเว็บจริง</span> ด้านบนขวาเพื่อดูรูปแบบที่จะเผยแพร่
                        </p>
                    </div>
                    </div>
                )}
              </div>
            )}

            {/* Content Views */}
            {activeMenuId !== 'home' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Upload Form (Only visible in Admin Mode) */}
                {!isPublicView && (
                    <UploadForm 
                    indicator={activeMenuItem} 
                    onUploadComplete={fetchData} 
                    />
                )}
                
                {isLoading ? (
                  <div className="text-center py-20 bg-white/50 rounded-2xl border border-purple-50">
                    <RefreshCcw className="animate-spin mx-auto text-purple-300 mb-4" size={32} />
                    <p className="text-slate-400 font-medium">กำลังโหลดข้อมูล...</p>
                  </div>
                ) : (
                  <FileGallery 
                    uploads={currentUploads} 
                    onDelete={handleDelete}
                    readOnly={isPublicView}
                  />
                )}
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default App;