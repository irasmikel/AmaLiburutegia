"use client";

import React from 'react';
import { Book, BookStatus, UserProfile } from '../../types';
import BookCard from './BookCard';
import BookCardSkeleton from './BookCardSkeleton';
import Stats from '../../components/Stats'; // Note: Stats is in the root components folder

enum View {
  DASHBOARD = 'DASHBOARD',
  LIBRARY = 'LIBRARY',
  STATS = 'STATS'
}

interface DashboardViewProps {
  user: UserProfile;
  books: Book[];
  loading: boolean;
  onEditBook: (book: Book) => void;
  onDeleteBook: (id: string) => void;
  onUpdateProgress: (book: Book, newPage: number) => void;
  onViewStats: () => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  books,
  loading,
  onEditBook,
  onDeleteBook,
  onUpdateProgress,
  onViewStats,
}) => {
  const readingBooks = books.filter(b => b.status === BookStatus.LEYENDO);

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-earth-600 to-earth-500 rounded-2xl p-6 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-2">¡Hola, {user}!</h2>
        <p className="opacity-90">
          {readingBooks.length > 0 
            ? `Estás leyendo ${readingBooks.length} libros actualmente. ¡Sigue así!`
            : 'No estás leyendo nada ahora mismo. ¿Buscamos algo en la estantería?'}
        </p>
      </div>

      {loading ? (
        <div>
          <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
            Leyendo Ahora
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <BookCardSkeleton key={i} />)}
          </div>
        </div>
      ) : readingBooks.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
            Leyendo Ahora
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {readingBooks.map(book => (
              <BookCard 
                key={book.id} 
                book={book} 
                onEdit={onEditBook} 
                onDelete={onDeleteBook}
                onUpdateProgress={onUpdateProgress}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats Preview */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
            <span className="w-2 h-6 bg-earth-500 rounded-full"></span>
            Resumen Rápido
          </h3>
          <button onClick={onViewStats} className="text-sm text-earth-600 hover:underline">Ver todo</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-stone-100 text-center">
            <p className="text-3xl font-bold text-stone-800">{books.filter(b => b.status === BookStatus.TERMINADO).length}</p>
            <p className="text-xs text-stone-500 uppercase tracking-wider mt-1">Leídos</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-stone-100 text-center">
            <p className="text-3xl font-bold text-stone-800">{books.filter(b => b.status === BookStatus.POR_LEER).length}</p>
            <p className="text-xs text-stone-500 uppercase tracking-wider mt-1">Pendientes</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;