import React, { useState, useEffect } from 'react';
import { Book, BookStatus, UserProfile } from '../types';
import { GENRES } from '../constants';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { suggestBookDetails } from '../services/geminiService';

interface BookFormProps {
  userId: UserProfile;
  initialData?: Book;
  onClose: () => void;
  onSave: (book: Omit<Book, 'id' | 'createdAt'> | Book) => void;
}

const BookForm: React.FC<BookFormProps> = ({ userId, initialData, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Book>>({
    userId: userId,
    status: BookStatus.POR_LEER,
    currentPage: 0,
    genre: GENRES[0],
    ...initialData
  });

  const [aiLoading, setAiLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'totalPages' || name === 'year' || name === 'currentPage' || name === 'rating' 
        ? Number(value) 
        : value
    }));
  };

  const handleMagicFill = async () => {
    if (!formData.title) { // Changed condition to only check for title
      alert("Introduce el Título para usar la IA"); // Updated alert message
      return;
    }
    setAiLoading(true);
    // Pass author as optional, it will be used if available
    const suggestion = await suggestBookDetails(formData.title, formData.author); 
    setAiLoading(false);

    if (suggestion) {
      setFormData(prev => ({
        ...prev,
        genre: suggestion.genre || prev.genre,
        totalPages: suggestion.totalPages || prev.totalPages,
        year: suggestion.year || prev.year,
        notes: prev.notes ? prev.notes : suggestion.summary // Only fill if empty or append? Just fill if empty.
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.author || !formData.totalPages) return;
    
    // Logic to set correct status based on pages/dates
    let finalStatus = formData.status;
    if (formData.currentPage && formData.currentPage > 0 && formData.currentPage < (formData.totalPages || 0)) {
        finalStatus = BookStatus.LEYENDO;
    }
    if (formData.currentPage === formData.totalPages) {
        finalStatus = BookStatus.TERMINADO;
    }

    onSave({
      ...formData,
      userId,
      status: finalStatus
    } as any);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-fade-in">
        <div className="bg-earth-100 p-4 border-b border-earth-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-earth-800 flex items-center gap-2">
            {initialData ? '✏️ Editar Libro' : '➕ Añadir Nuevo Libro'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-earth-200 rounded-full transition-colors text-earth-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-earth-400 focus:border-transparent outline-none transition-all"
                  placeholder="Ej. Cien años de soledad"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Autor *</label>
                <input
                  type="text"
                  name="author"
                  required
                  value={formData.author || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-earth-400 focus:border-transparent outline-none transition-all"
                  placeholder="Ej. Gabriel García Márquez"
                />
              </div>

               {/* AI Magic Button */}
               {!initialData && process.env.API_KEY && (
                <button
                  type="button"
                  onClick={handleMagicFill}
                  disabled={aiLoading}
                  className="w-full py-2 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2 text-sm font-medium shadow-md"
                >
                  {aiLoading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                  Autocompletar con IA
                </button>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Páginas *</label>
                  <input
                    type="number"
                    name="totalPages"
                    required
                    min="1"
                    value={formData.totalPages || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-earth-400 outline-none"
                  />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-earth-400 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Género</label>
                <select
                  name="genre"
                  value={formData.genre}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-earth-400 outline-none bg-white"
                >
                  {GENRES.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  {Object.values(BookStatus).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, status }))}
                      className={`flex-1 py-2 text-xs md:text-sm font-medium rounded-md transition-all ${
                        formData.status === status
                          ? 'bg-white text-earth-700 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {status === BookStatus.POR_LEER ? 'Pendiente' : status === BookStatus.LEYENDO ? 'Leyendo' : 'Terminado'}
                    </button>
                  ))}
                </div>
              </div>

              {formData.status === BookStatus.LEYENDO && (
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Página Actual</label>
                    <input
                      type="number"
                      name="currentPage"
                      min="0"
                      max={formData.totalPages}
                      value={formData.currentPage || 0}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-earth-400 outline-none"
                    />
                     <label className="block text-sm font-medium text-gray-700 mt-2 mb-1">Fecha Inicio</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate || ''}
                      onChange={handleChange}
                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-earth-400 outline-none"
                    />
                 </div>
              )}

              {formData.status === BookStatus.TERMINADO && (
                <div className="animate-fade-in space-y-3">
                   <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
                        <input
                        type="date"
                        name="finishDate"
                        value={formData.finishDate || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-earth-400 outline-none"
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Valoración (1-5)</label>
                        <input
                        type="number"
                        name="rating"
                        min="1"
                        max="5"
                        value={formData.rating || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-earth-400 outline-none"
                        />
                    </div>
                   </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas / Reseña</label>
                <textarea
                  name="notes"
                  rows={4}
                  value={formData.notes || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-earth-400 focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Mis pensamientos sobre el libro..."
                />
              </div>
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
              type="submit"
              className="px-6 py-2 rounded-lg bg-earth-600 hover:bg-earth-700 text-white font-medium shadow-md transition-all transform hover:scale-105"
            >
              {initialData ? 'Guardar Cambios' : 'Añadir Libro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookForm;