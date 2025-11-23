"use client";

import React, { useState, useEffect } from 'react';
import { Upload, FileText, Download, Trash2, Loader2, AlertCircle } from 'lucide-react';
import * as DataService from '../../services/dataService';
import { showSuccess, showError, showConfirmation } from '../utils/toast';
import { SharedFile } from '../../types';

const SharedFiles: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [files, setFiles] = useState<SharedFile[]>([]);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setLoadingFiles(true);
    try {
      const fetchedFiles = await DataService.getSharedFiles();
      setFiles(fetchedFiles);
    } catch (err: any) {
      showError(`Error al cargar archivos: ${err.message}`);
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showError('Por favor, selecciona un archivo para subir.');
      return;
    }

    setUploading(true);
    try {
      await DataService.uploadFile(selectedFile);
      showSuccess('Archivo subido correctamente.');
      setSelectedFile(null);
      await fetchFiles(); // Refresh the list
    } catch (err: any) {
      showError(`Error al subir archivo: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = (file: SharedFile) => {
    showConfirmation(
      `¿Estás seguro de que quieres eliminar "${file.name}"?`,
      async () => {
        try {
          await DataService.deleteSharedFile(file.name); // Supabase storage remove uses the file name as path
          showSuccess('Archivo eliminado correctamente.');
          await fetchFiles(); // Refresh the list
        } catch (err: any) {
          showError(`Error al eliminar archivo: ${err.message}`);
        }
      },
      () => {
        showError('Eliminación cancelada.');
      }
    );
  };

  const formatFileSize = (bytes?: number) => {
    if (bytes === undefined) return 'N/A';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="bg-gradient-to-r from-earth-600 to-earth-500 rounded-2xl p-6 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Archivos Compartidos</h2>
        <p className="opacity-90">Sube y comparte documentos con otros usuarios.</p>
      </div>

      {/* File Upload Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100 space-y-4">
        <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
          <Upload size={20} className="text-earth-600" /> Subir Nuevo Archivo
        </h3>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <label className="flex-1 w-full cursor-pointer bg-earth-50 border border-earth-200 rounded-lg px-4 py-2 text-earth-700 hover:bg-earth-100 transition-colors flex items-center justify-center gap-2">
            <input type="file" className="hidden" onChange={handleFileChange} />
            <FileText size={18} />
            {selectedFile ? selectedFile.name : 'Seleccionar archivo...'}
          </label>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="w-full sm:w-auto px-6 py-2 bg-earth-600 text-white rounded-lg font-medium shadow-md hover:bg-earth-700 transition-all flex items-center justify-center gap-2"
          >
            {uploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
            {uploading ? 'Subiendo...' : 'Subir Archivo'}
          </button>
        </div>
        {selectedFile && (
          <p className="text-sm text-gray-600 mt-2">Archivo seleccionado: <span className="font-medium">{selectedFile.name}</span> ({formatFileSize(selectedFile.size)})</p>
        )}
      </div>

      {/* List of Shared Files */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100 space-y-4">
        <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
          <FileText size={20} className="text-earth-600" /> Archivos Disponibles
        </h3>
        {loadingFiles ? (
          <div className="text-center py-10 text-stone-400 flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 border-4 border-earth-200 border-t-earth-500 rounded-full animate-spin" />
            <p>Cargando archivos...</p>
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-10 text-stone-500">
            <AlertCircle size={48} className="mx-auto mb-4 text-stone-300" />
            <p className="text-lg">No hay archivos compartidos aún.</p>
            <p className="text-sm mt-2">¡Sube el primero para empezar!</p>
          </div>
        ) : (
          <ul className="divide-y divide-stone-100">
            {files.map((file) => (
              <li key={file.path} className="flex items-center justify-between py-3 gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileText size={20} className="text-earth-500 flex-shrink-0" />
                  <span className="font-medium text-stone-800 truncate" title={file.name}>{file.name}</span>
                  <span className="text-sm text-stone-500 flex-shrink-0">({formatFileSize(file.size)})</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-md text-earth-600 hover:bg-earth-100 transition-colors"
                    title="Descargar"
                  >
                    <Download size={18} />
                  </a>
                  <button
                    onClick={() => handleDeleteFile(file)}
                    className="p-2 rounded-md text-red-600 hover:bg-red-100 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SharedFiles;