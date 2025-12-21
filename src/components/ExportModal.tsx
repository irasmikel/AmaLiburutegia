"use client";

import React, { useState } from 'react';
import { X, Download } from 'lucide-react';
import { Book } from '../../types';
import { exportToCsv, exportToPdf } from '../utils/exportUtils';
import { showError, showSuccess } from '../utils/toast';

interface ExportModalProps {
  allBooks: Book[];
  filteredBooks: Book[];
  onClose: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ allBooks, filteredBooks, onClose }) => {
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
  const [exportScope, setExportScope] = useState<'all' | 'filtered'>('filtered');

  const handleExport = () => {
    const dataToExport = exportScope === 'all' ? allBooks : filteredBooks;
    const filename = `libros_${exportScope === 'all' ? 'todos' : 'filtrados'}_${new Date().toISOString().slice(0, 10)}`;

    if (dataToExport.length === 0) {
      showError('No hay libros para exportar con las opciones seleccionadas.');
      return;
    }

    try {
      if (exportFormat === 'csv') {
        exportToCsv(dataToExport, filename);
      } else {
        exportToPdf(dataToExport, filename);
      }
      showSuccess('Libros exportados correctamente.');
      onClose();
    } catch (error: any) {
      showError(`Error al exportar: ${error.message || 'Error desconocido'}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
        <div className="bg-earth-100 p-4 border-b border-earth-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-earth-800 flex items-center gap-2">
            <Download size={24} /> Exportar Libros
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-earth-200 rounded-full transition-colors text-earth-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Export Format */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Formato de Exportación</label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="exportFormat"
                  value="csv"
                  checked={exportFormat === 'csv'}
                  onChange={() => setExportFormat('csv')}
                  className="form-radio h-4 w-4 text-earth-600 focus:ring-earth-500"
                />
                <span className="ml-2 text-gray-700">Excel (CSV)</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="exportFormat"
                  value="pdf"
                  checked={exportFormat === 'pdf'}
                  onChange={() => setExportFormat('pdf')}
                  className="form-radio h-4 w-4 text-earth-600 focus:ring-earth-500"
                />
                <span className="ml-2 text-gray-700">PDF</span>
              </label>
            </div>
          </div>

          {/* Export Scope */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Datos a Exportar</label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="exportScope"
                  value="filtered"
                  checked={exportScope === 'filtered'}
                  onChange={() => setExportScope('filtered')}
                  className="form-radio h-4 w-4 text-earth-600 focus:ring-earth-500"
                />
                <span className="ml-2 text-gray-700">Libros Filtrados/Ordenados</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="exportScope"
                  value="all"
                  checked={exportScope === 'all'}
                  onChange={() => setExportScope('all')}
                  className="form-radio h-4 w-4 text-earth-600 focus:ring-earth-500"
                />
                <span className="ml-2 text-gray-700">Todos los Libros</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100 gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="px-6 py-2 rounded-lg bg-earth-600 hover:bg-earth-700 text-white font-medium shadow-md transition-all transform hover:scale-105 flex items-center gap-2"
            >
              <Download size={18} /> Exportar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;