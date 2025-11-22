"use client";

import React from 'react';
import { UserProfile } from '../../types';
import { Book as BookIcon, BarChart2, Plus, LogOut, LayoutGrid, AlertCircle } from 'lucide-react';

enum View {
  DASHBOARD = 'DASHBOARD',
  LIBRARY = 'LIBRARY',
  STATS = 'STATS'
}

interface MainLayoutProps {
  user: UserProfile;
  view: View;
  setView: (view: View) => void;
  onLogout: () => void;
  onAddBook: () => void;
  errorMsg: string | null;
  setErrorMsg: (msg: string | null) => void;
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  user,
  view,
  setView,
  onLogout,
  onAddBook,
  errorMsg,
  setErrorMsg,
  children,
}) => {
  return (
    <div className="min-h-screen bg-earth-50 pb-20 md:pb-0">
      
      {/* Header */}
      <header className="bg-white border-b border-earth-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📚</span>
            <span className="font-serif font-bold text-xl text-earth-900 hidden sm:inline">Liburutegia</span>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-earth-100 rounded-full">
                <span className="text-sm font-medium text-earth-800">{user}</span>
                <button 
                    onClick={onLogout}
                    className="p-1 hover:bg-earth-200 rounded-full text-earth-600 transition-colors"
                    title="Cambiar usuario"
                >
                    <LogOut size={14} />
                </button>
             </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Global Error Message */}
        {errorMsg && (
           <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 flex items-center gap-3 animate-fade-in">
              <AlertCircle size={20} />
              <p className="text-sm font-medium">{errorMsg}</p>
              <button onClick={() => setErrorMsg(null)} className="ml-auto text-red-600 hover:text-red-800">✕</button>
           </div>
        )}
        
        {/* Navigation Tabs (Mobile: Bottom Fixed, Desktop: Top) */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:static md:bg-transparent md:border-0 md:mb-8 z-20">
            <div className="flex justify-around md:justify-start md:gap-4 p-2 md:p-0">
                <button 
                    onClick={() => setView(View.DASHBOARD)}
                    className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 px-4 py-2 rounded-lg transition-colors ${view === View.DASHBOARD ? 'text-earth-700 bg-earth-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                >
                    <LayoutGrid size={20} />
                    <span className="text-xs md:text-sm font-medium">Inicio</span>
                </button>
                <button 
                    onClick={() => setView(View.LIBRARY)}
                    className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 px-4 py-2 rounded-lg transition-colors ${view === View.LIBRARY ? 'text-earth-700 bg-earth-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                >
                    <BookIcon size={20} />
                    <span className="text-xs md:text-sm font-medium">Biblioteca</span>
                </button>
                <button 
                    onClick={() => setView(View.STATS)}
                    className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 px-4 py-2 rounded-lg transition-colors ${view === View.STATS ? 'text-earth-700 bg-earth-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                >
                    <BarChart2 size={20} />
                    <span className="text-xs md:text-sm font-medium">Estadísticas</span>
                </button>
                 <button 
                    onClick={onAddBook}
                    className="md:ml-auto flex flex-col md:flex-row items-center gap-1 md:gap-2 px-4 py-2 rounded-lg bg-earth-600 text-white shadow-md hover:bg-earth-700 transition-colors transform hover:scale-105"
                >
                    <Plus size={20} />
                    <span className="text-xs md:text-sm font-medium">Añadir</span>
                </button>
            </div>
        </div>

        {/* Children (View specific content) */}
        <div className="animate-fade-in min-h-[calc(100vh-200px)]">
            {children}
        </div>

      </main>
    </div>
  );
};

export default MainLayout;