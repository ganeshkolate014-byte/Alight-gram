import React from 'react';
import { UserProfile, ViewState } from '../types';
import { Plus, Home, User } from 'lucide-react';

interface NavbarProps {
  user: UserProfile;
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
  onUploadClick: () => void;
  onProfileClick: () => void; // Keeps the prop, but we'll use onViewChange('profile') mostly
}

const Navbar: React.FC<NavbarProps> = ({ user, currentView, onViewChange, onUploadClick }) => {
  return (
    <>
      {/* Top Header (Desktop & Mobile) */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5 transition-all duration-500 supports-[backdrop-filter]:bg-black/60">
        <div className="max-w-2xl mx-auto px-5 h-14 flex items-center justify-between">
          <div 
            className="flex items-center space-x-3 cursor-pointer active:opacity-70 transition-opacity duration-300" 
            onClick={() => onViewChange('feed')}
          >
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
              AlightGram
            </span>
          </div>

          <div className="flex items-center space-x-3">
             {/* Profile Icon Button - Navigates to Profile Page */}
             <button
              onClick={() => onViewChange('profile')}
              className={`w-9 h-9 flex items-center justify-center rounded-full border transition-all duration-300 active:scale-95 ${currentView === 'profile' ? 'bg-white text-black border-white' : 'bg-white/5 text-zinc-400 border-white/5 hover:text-white hover:bg-white/10'}`}
              title="Profile"
            >
              <User size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Bottom Navigation (Mobile Only) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden">
        {/* Gradient Fade for seamless look */}
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-black via-black/90 to-transparent pointer-events-none"></div>
        
        <div className="relative bg-black/80 backdrop-blur-2xl border-t border-white/5 pb-safe rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
          <div className="flex justify-around items-center h-[64px] px-2">
            
            {/* Home Tab */}
            <button
              onClick={() => onViewChange('feed')}
              className={`relative flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300 group ${currentView === 'feed' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <div className={`absolute inset-0 bg-white/5 rounded-2xl scale-0 transition-transform duration-300 ${currentView === 'feed' ? 'scale-100' : ''}`}></div>
              <Home 
                size={24} 
                strokeWidth={currentView === 'feed' ? 2.5 : 2} 
                className={`relative z-10 transition-transform duration-300 ${currentView === 'feed' ? 'scale-110' : 'group-active:scale-90'}`}
              />
              <span className={`text-[10px] font-medium mt-1 relative z-10 transition-opacity duration-300 ${currentView === 'feed' ? 'opacity-100' : 'opacity-0'}`}>
                Home
              </span>
            </button>

            {/* Create Button (Floating) */}
            <button
              onClick={onUploadClick}
              className="relative -top-5 group"
            >
              <div className="absolute inset-0 bg-white blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full"></div>
              <div className="relative bg-white text-black w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-white/10 transition-transform duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) group-hover:scale-110 group-active:scale-95 border-4 border-black">
                <Plus size={26} strokeWidth={3} className="transition-transform duration-500 group-hover:rotate-90" />
              </div>
            </button>

            {/* Profile Tab */}
            <button
              onClick={() => onViewChange('profile')}
              className={`relative flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300 group ${currentView === 'profile' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
               <div className={`absolute inset-0 bg-white/5 rounded-2xl scale-0 transition-transform duration-300 ${currentView === 'profile' ? 'scale-100' : ''}`}></div>
              <User 
                size={24} 
                strokeWidth={currentView === 'profile' ? 2.5 : 2}
                 className={`relative z-10 transition-transform duration-300 ${currentView === 'profile' ? 'scale-110' : 'group-active:scale-90'}`}
              />
               <span className={`text-[10px] font-medium mt-1 relative z-10 transition-opacity duration-300 ${currentView === 'profile' ? 'opacity-100' : 'opacity-0'}`}>
                Profile
              </span>
            </button>

          </div>
        </div>
      </nav>

      {/* Desktop Navigation */}
      <nav className="hidden sm:block fixed bottom-8 left-1/2 -translate-x-1/2 z-40 animate-fade-in">
        <div className="bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-full p-1.5 flex items-center space-x-1 shadow-2xl shadow-black/50">
           <button
            onClick={() => onViewChange('feed')}
            className={`px-6 py-2.5 rounded-full flex items-center space-x-2 transition-all duration-300 ${currentView === 'feed' ? 'bg-white text-black font-semibold shadow-lg scale-105' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
          >
            <Home size={18} strokeWidth={currentView === 'feed' ? 2.5 : 2} />
            <span>Home</span>
          </button>

          <button
            onClick={onUploadClick}
            className="px-6 py-2.5 rounded-full flex items-center space-x-2 text-white hover:bg-white/10 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <Plus size={20} />
            <span>Create</span>
          </button>
          
          <button
            onClick={() => onViewChange('profile')}
            className={`px-6 py-2.5 rounded-full flex items-center space-x-2 transition-all duration-300 ${currentView === 'profile' ? 'bg-white text-black font-semibold shadow-lg scale-105' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
          >
            <User size={18} strokeWidth={currentView === 'profile' ? 2.5 : 2} />
            <span>Profile</span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default Navbar;