"use client";

import React from 'react';
import { LogOut, Download } from 'lucide-react';
import { UserProfile } from '../../types';

interface HeaderProps {
  user: UserProfile;
  selectedYear: number | 'ALL';
  availableYears: (number | 'ALL')[];
  onYearChange: (year: number | 'ALL') => void;
  onDownloadReport: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  user, 
  selectedYear, 
  availableYears, 
  onYearChange, 
  onDownloadReport, 
  onLogout 
}) => {
  return (
    <header className="bg-white border-b border-earth-100 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📚</span>
          <span className="font-serif font-bold text-xl text-earth-900 hidden sm:inline">Liburutegia</span>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
           <select
              value={selectedYear}
              onChange={(e) => onYearChange(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              className="px-2 sm:px-3 py-1.5 bg-earth-100 border border-earth-200 rounded-lg text-xs sm:text-sm text-earth-700 focus:outline-none"
           >
              {availableYears.map(year => (
                  <option key={year} value={year}>
                      {year === 'ALL' ? 'Total' : year}
                  </option>
              ))}
           </select>

           <button 
              onClick={onDownloadReport}
              className="p-2 hover:bg-earth-100 rounded-full transition-colors text-earth-700"
              title="Descargar Informe PDF"
           >
              <Download size={20} />
           </button>

           <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-earth-100 rounded-full">
              <span className="text-sm font-medium text-earth-800">{user}</span>
           </div>
           <button 
              onClick={onLogout}
              className="p-2 hover:bg-earth-100 rounded-full transition-colors text-earth-700"
              title="Cerrar Sesión"
           >
              <LogOut size={20} />
           </button>
        </div>
      </div>
    </header>
  );
};

export default Header;