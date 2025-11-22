"use client";

import React, { useState } from 'react';
import { Book, BookStatus, UserProfile } from '../../types';
import { GENRES } from '../../constants';
import BookCard from '../../components/BookCard'; // Corrected import path
import BookCardSkeleton from './BookCardSkeleton';
import { Search, BookOpen as BookOpenIcon } from 'lucide-react';

interface LibraryViewProps {
  user: UserProfile;
  books: Book[];
  loading: boolean;
  onEditBook: (book: Book) => void;
  onDeleteBook: (id: string) => void;
  onUpdateProgress: (book: Book, newPage: number) => void;
  onAddFirstBook: () => void;
}

const LibraryView: React.FC<LibraryViewProps> = ({
  user,
  books,
  loading,
  onEditBook,
  onDeleteBook,
  onUpdateProgress,
  onAddFirstBook,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<BookStatus | 'ALL'>('ALL');
  const [filterGenre, setFilterGenre] = useState<string>('ALL');

  const filteredBooks = books.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || b.status === filterStatus;
    const matchesGenre = filterGenre === 'ALL' || b.genre === filterGenre;
    return matchesSearch && matchesStatus && matchesGenre;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por título o autor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-earth-300 transition-all"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-700 focus:outline-none hover:border-earth-300 transition-colors"
          >
            <option value="ALL">Todos los estados</option>
            <option value={BookStatus.POR_LEER}>Por Leer</option>
            <option value={BookStatus.LEYENDO}>Leyendo</option>
            <option value={BookStatus.TERMINADO}>Terminados</option>
          </select>
          <select 
            value={filterGenre} 
            onChange={(e) => setFilterGenre(e.target.value)}
            className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-700 focus:outline-none hover:border-earth-300 transition-colors"
          >
            <option value="ALL">Todos los géneros</option>
            {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => <BookCardSkeleton key={i} />)}
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-stone-100 p-8">
          <BookOpenIcon size={48} className="text-stone-300 mx-auto mb-4" />
          <p className="text-stone-500 text-lg mb-4">
            {searchTerm || filterStatus !== 'ALL' || filterGenre !== 'ALL'
              ? "No se encontraron libros que coincidan con los filtros."
              : "Aún no tienes libros en tu biblioteca."}
          </p>
          <button 
            onClick={onAddFirstBook}
            className="px-4 py-2 bg-earth-600 text-white rounded-lg hover:bg-earth-700 transition-colors shadow-md"
          >
            Añadir el primero
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredBooks.map(book => (
            <BookCard 
              key={book.id} 
              book={book} 
              onEdit={onEditBook} 
              onDelete={onDeleteBook}
              onUpdateProgress={onUpdateProgress}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LibraryView;