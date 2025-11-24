"use client";

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react';
import * as DataService from '../../services/dataService';
import { showError, showSuccess, showConfirmation } from '../utils/toast';
import { Genre } from '../../types';

interface GenreManagerProps {
  onClose: () => void;
  onGenreUpdated: () => void; // Callback to refresh genres in parent
}

const GenreManager: React.FC<GenreManagerProps> = ({ onClose, onGenreUpdated }) => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [newGenreName, setNewGenreName] = useState('');
  const [loading, setLoading] = useState(true);
  const [addingGenre, setAddingGenre] = useState(false);

  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchGenres = async () => {
    setLoading(true);
    try {
      const fetchedGenres = await DataService.getGenres();
      setGenres(fetchedGenres);
    } catch (err: any) {
      showError(`Error al cargar géneros: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGenre = async () => {
    if (!newGenreName.trim()) {
      showError('El nombre del género no puede estar vacío.');
      return;
    }
    setAddingGenre(true);
    try {
      await DataService.addGenre(newGenreName.trim());
      showSuccess(`Género "${newGenreName.trim()}" añadido.`);
      setNewGenreName('');
      await fetchGenres();
      onGenreUpdated(); // Notify parent
    } catch (err: any) {
      showError(`Error al añadir género: ${err.message}`);
    } finally {
      setAddingGenre(false);
    }
  };

  const handleDeleteGenre = (genre: Genre) => {
    showConfirmation(
      `¿Estás seguro de que quieres eliminar el género "${genre.name}"? Los libros con este género no se verán afectados, pero el género ya no estará disponible para nuevas selecciones.`,
      async () => {
        try {
          await DataService.deleteGenre(genre.id);
          showSuccess(`Género "${genre.name}" eliminado.`);
          await fetchGenres();
          onGenreUpdated(); // Notify parent
        } catch (err: any) {
          showError(`Error al eliminar género: ${err.message}`);
        }
      },
      () => {
        showError('Eliminación de género cancelada.');
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
        <div className="bg-earth-100 p-4 border-b border-earth-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-earth-800 flex items-center gap-2">
            Gestionar Géneros
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-earth-200 rounded-full transition-colors text-earth-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Add New Genre */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Añadir Nuevo Género</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newGenreName}
                onChange={(e) => setNewGenreName(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-earth-400 focus:border-transparent outline-none transition-all"
                placeholder="Nombre del género"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddGenre();
                  }
                }}
              />
              <button
                onClick={handleAddGenre}
                disabled={addingGenre || !newGenreName.trim()}
                className="px-4 py-2 bg-earth-600 text-white rounded-lg font-medium shadow-md hover:bg-earth-700 transition-all flex items-center justify-center gap-2"
              >
                {addingGenre ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                Añadir
              </button>
            </div>
          </div>

          {/* Existing Genres List */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-stone-800">Géneros Existentes</h3>
            {loading ? (
              <div className="text-center py-4 text-stone-400 flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin" />
                <p>Cargando géneros...</p>
              </div>
            ) : genres.length === 0 ? (
              <div className="text-center py-4 text-stone-500">
                <AlertCircle size={24} className="mx-auto mb-2 text-stone-300" />
                <p className="text-sm">No hay géneros personalizados aún.</p>
              </div>
            ) : (
              <ul className="divide-y divide-stone-100 max-h-60 overflow-y-auto rounded-lg border border-stone-200 bg-stone-50">
                {genres.map((genre) => (
                  <li key={genre.id} className="flex items-center justify-between py-2 px-4">
                    <span className="text-stone-700">{genre.name}</span>
                    <button
                      onClick={() => handleDeleteGenre(genre)}
                      className="p-1 rounded-md text-red-600 hover:bg-red-100 transition-colors"
                      title={`Eliminar ${genre.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg bg-earth-600 hover:bg-earth-700 text-white font-medium shadow-md transition-all transform hover:scale-105"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenreManager;