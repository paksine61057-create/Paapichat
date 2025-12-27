import React from 'react';
import { MENU_STRUCTURE, USER_PROFILE } from '../constants';
import { MenuItem } from '../types';
import { LayoutDashboard, BookOpen, Target, FileText, Award, X, Star, School, GraduationCap } from 'lucide-react';

interface SidebarProps {
  activeId: string;
  onSelect: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeId, onSelect, isOpen, onClose }) => {
  
  const getIcon = (id: string) => {
    if (id === 'home') return <LayoutDashboard size={20} />;
    if (id === 'challenge') return <Target size={20} />;
    if (id.startsWith('domain-1')) return <BookOpen size={20} />;
    if (id.startsWith('domain-2')) return <Award size={20} />;
    if (id.startsWith('domain-3')) return <FileText size={20} />;
    return <Star size={20} />;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed top-0 left-0 z-50 h-full w-72 
        bg-[#2e1065]
        text-white transform transition-transform duration-300 ease-in-out shadow-2xl
        md:translate-x-0 md:static md:h-screen overflow-hidden flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Deep Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#4c1d95] via-[#831843] to-[#500724] opacity-90 z-0"></div>
        
        {/* Abstract Pattern overlay */}
        <div className="absolute inset-0 opacity-10 z-0" 
             style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px'}}>
        </div>

        {/* Header Section */}
        <div className="relative z-10 pt-10 pb-8 px-6 border-b border-white/10 bg-gradient-to-b from-white/10 to-transparent overflow-hidden">
          {/* Watermark 1 */}
          <Award className="absolute -top-4 -right-4 w-32 h-32 text-white opacity-[0.03] rotate-12 pointer-events-none" />
          
          {/* Glow Effect */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500 rounded-full blur-[50px] opacity-30 -mr-5 -mt-5 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col items-center text-center">
             {/* Profile Image Wrapper with Smoky Mist Effect */}
             <div className="relative mb-6 group">
                {/* Smoke/Glow Background Layer 1 */}
                <div className="absolute inset-0 bg-pink-400 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-700"></div>
                {/* Smoke/Glow Background Layer 2 (Pulse) */}
                <div className="absolute -inset-4 bg-white/20 rounded-full blur-xl opacity-30 animate-pulse"></div>
                
                <div className="w-28 h-28 rounded-full p-1 relative z-10">
                   <div className="w-full h-full rounded-full overflow-hidden border-2 border-white/50 shadow-2xl relative bg-slate-800">
                      <img 
                        src={USER_PROFILE.imageUrl} 
                        alt={USER_PROFILE.name} 
                        className="w-full h-full object-cover object-[50%_5%] transform group-hover:scale-110 transition-transform duration-700" 
                      />
                      {/* Inner shadow overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 via-transparent to-transparent"></div>
                   </div>
                </div>
                {/* Decoration Badge */}
                <div className="absolute bottom-0 right-0 bg-gradient-to-r from-amber-300 to-amber-500 text-amber-900 p-2 rounded-full border-2 border-[#3b0764] shadow-lg z-20">
                    <GraduationCap size={16} />
                </div>
             </div>

             <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-100 to-pink-200 leading-tight drop-shadow-sm">
                {USER_PROFILE.name}
             </h1>
             <p className="text-[10px] font-bold text-pink-300/90 uppercase tracking-[0.2em] mt-1 mb-2">
                Teacher PA Portfolio
             </p>
             
             <div className="w-full bg-white/5 rounded-lg p-2 backdrop-blur-sm border border-white/5">
                <p className="text-xs text-pink-100/90 font-light leading-relaxed">
                  {USER_PROFILE.position}
                </p>
                <div className="h-px w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent mx-auto my-1"></div>
                <p className="text-xs text-pink-100/80 font-light">
                  {USER_PROFILE.school}
                </p>
             </div>
          </div>

          <button onClick={onClose} className="absolute top-4 right-4 md:hidden text-pink-200 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Navigation - Scrollable Area */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 relative z-10 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {MENU_STRUCTURE.map((item: MenuItem) => {
            if (item.isHeader) {
              return (
                <div key={item.id} className="mt-6 mb-2 px-4 flex items-center gap-2">
                   <span className="w-1 h-1 rounded-full bg-pink-400 box-shadow-glow"></span>
                   <span className="text-[10px] font-bold text-pink-200/60 uppercase tracking-widest">
                     {item.title}
                   </span>
                   <div className="h-px flex-1 bg-gradient-to-r from-pink-500/20 to-transparent"></div>
                </div>
              );
            }
            
            const isActive = activeId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelect(item.id);
                  onClose(); 
                }}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-300 flex items-center gap-3 relative overflow-hidden group
                  ${isActive 
                    ? 'bg-gradient-to-r from-white/10 to-white/5 text-white shadow-lg border border-white/10' 
                    : 'text-pink-100/80 hover:bg-white/5 hover:text-white border border-transparent'
                  }`}
              >
                {/* Active Indicator Line */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-pink-400 rounded-r-full shadow-[0_0_10px_rgba(244,114,182,0.6)]"></div>
                )}

                <span className={`relative z-10 transition-transform duration-300 ${isActive ? 'scale-110 text-pink-300' : 'group-hover:scale-110'}`}>
                  {getIcon(item.id)}
                </span>
                <span className={`font-medium truncate relative z-10 transition-all ${isActive ? 'translate-x-1' : ''}`}>
                  {item.title}
                </span>
                
                {/* Hover Light Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              </button>
            );
          })}
        </nav>
        
        {/* Footer Section */}
        <div className="relative z-10 p-4 bg-gradient-to-t from-black/40 to-transparent">
           {/* Watermark 2 */}
           <School className="absolute bottom-2 right-2 w-24 h-24 text-white opacity-[0.03] -rotate-12 pointer-events-none" />
           
           <div className="bg-black/20 backdrop-blur-md rounded-xl p-4 border border-white/5 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
               
               <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                     <School size={16} className="text-pink-200" />
                  </div>
                  <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">ระบบรายงาน PA</p>
                      <p className="text-[10px] text-pink-200/60 truncate">Version 1.0.0</p>
                  </div>
               </div>
               
               <div className="text-[10px] text-center text-pink-200/40 font-light mt-2 pt-2 border-t border-white/5">
                 © 2024 {USER_PROFILE.school}<br/>
                 พัฒนาเพื่อการศึกษา
               </div>
           </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;