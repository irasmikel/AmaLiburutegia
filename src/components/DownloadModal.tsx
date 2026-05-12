"use client";

import React, { useState } from 'react';
import { X, FileText, Download, Calendar } from 'lucide-react';

interface DownloadModalProps {
  availableYears: (number | 'ALL')[];
  onClose: () => void;
  onDownload: (year: number | 'ALL', includeNotes: boolean) => void;
}

const DownloadModal: React.FC<DownloadModalProps> = ({ availableYears, onClose, onDownload }) => {
  const [selectedYear, setSelectedYear] = useState<number | 'ALL'>('ALL');
  const [reportType, setReportType] = useState<'short' | 'long'>('short');

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
        <div className="bg-earth-600 p-4 text-white flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Download size={20} /> Opciones de Informe
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Calendar size={16} className="text-earth-600" /> Seleccionar Año
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-earth-400 outline-none bg-white"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>
                  {year === 'ALL' ? 'Todos los años (Total)' : year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FileText size={16} className="text-earth-600" /> Tipo de Informe
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setReportType('short')}
                className={`p-3 rounded-xl border-2 transition-all text-left ${
                  reportType === 'short' 
                    ? 'border-earth-500 bg-earth-50 text-earth-700' 
                    : 'border-gray-100 hover:border-gray-200 text-gray-500'
                }`}
              >
                <p className="font-bold text-sm">Corto</p>
                <p className="text-xs opacity-80">Datos actuales y fechas.</p>
              </button>
              <button
                onClick={() => setReportType('long')}
                className={`p-3 rounded-xl border-2 transition-all text-left ${
                  reportType === 'long' 
                    ? 'border-earth-500 bg-earth-50 text-earth-700' 
                    : 'border-gray-100 hover:border-gray-200 text-gray-500'
                }`}
              >
                <p className="font-bold text-sm">Largo</p>
                <p className="text-xs opacity-80">Incluye tus notas y reseñas.</p>
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-600 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => onDownload(selectedYear, reportType === 'long')}
              className="flex-1 px-4 py-2 bg-earth-600 text-white rounded-lg font-bold hover:bg-earth-700 transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Download size={18} /> Generar PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadModal;