"use client";

import React from 'react';
import { LayoutGrid, Book as BookIcon, BarChart2, Plus } from 'lucide-react';

export enum View {
  DASHBOARD = 'DASHBOARD',
  LIBRARY = 'LIBRARY',
  STATS = 'STATS',
}

interface NavigationProps {
  view: View;
  onViewChange: (view: View) => void;
  onAddBook: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ view, onViewChange, onAddBook }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:static md:bg-transparent md:border-0 md:mb-8 z-20">
        <div className="flex justify-around md:justify-start md:gap-4 p-2 md:p-0">
            <button 
                onClick={() => onViewChange(View.DASHBOARD)}
                className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 px-4 py-2 rounded-lg transition-colors ${view === View.DASHBOARD ? 'text-earth-700 bg-earth-100' : 'text-gray-500 hover:text-gray-900'}`}
            >
                <LayoutGrid size={20} />
                <span className="text-xs md:text-sm font-medium">Inicio</span>
            </button>
            <button 
                onClick={() => onViewChange(View.LIBRARY)}
                className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 px-4 py-2 rounded-lg transition-colors ${view === View.LIBRARY ? 'text-earth-700 bg-earth-100' : 'text-gray-500 hover:text-gray-900'}`}
            >
                <BookIcon size={20} />
                <span className="text-xs md:text-sm font-medium">Biblioteca</span>
            </button>
            <button 
                onClick={() => onViewChange(View.STATS)}
                className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 px-4 py-2 rounded-lg transition-colors ${view === View.STATS ? 'text-earth-700 bg-earth-100' : 'text-gray-500 hover:text-gray-900'}`}
            >
                <BarChart2 size={20} />
                <span className="text-xs md:text-sm font-medium">Estadísticas</span>
            </button>
             <button 
                onClick={onAddBook}
                className="md:ml-auto flex flex-col md:flex-row items-center gap-1 md:gap-2 px-4 py-2 rounded-lg bg-earth-600 text-white shadow-md hover:bg-earth-700 transition-colors"
            >
                <Plus size={20} />
                <span className="text-xs md:text-sm font-medium">Añadir</span>
            </button>
        </div>
    </div>
  );
};

export default Navigation;