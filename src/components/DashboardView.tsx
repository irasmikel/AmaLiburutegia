"use client";

import React from 'react';
import { AlertCircle, Star } from 'lucide-react';
import { Book, UserProfile } from '../../types';
import BookCard from '../../components/BookCard';
import CollapsibleSection from './CollapsibleSection';

interface DashboardViewProps {
  user: UserProfile;
  selectedYear: number | 'ALL';
  finishedBooks: Book[];
  toReadBooks: Book[];
  booksByRating: Record<number, Book[]>;
  onEditBook: (book: Book) => void;
  onDeleteBook: (id: string) => void;
  onUpdateProgress: (book: Book, newPage: number) => void;
  onViewStats: () => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  selectedYear,
  finishedBooks,
  toReadBooks,
  booksByRating,
  onEditBook,
  onDeleteBook,
  onUpdateProgress,
  onViewStats
}) => {
  return (
    <div className="space-y-8">
         <div className="bg-gradient-to-r from-earth-600 to-earth-500 rounded-2xl p-6 text-white shadow-lg">
            <h2 className="text-2xl font-bold mb-2">¡Hola, {user}!</h2>
            <p className="opacity-90">
                {toReadBooks.length > 0 
                    ? `Tienes ${toReadBooks.length} libros pendientes. ¡A por ellos!`
                    : 'No tienes libros pendientes ahora mismo. ¡Añade uno nuevo!'}
            </p>
         </div>

         <div>
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                    <span className="w-2 h-6 bg-earth-500 rounded-full"></span>
                    Resumen Rápido {selectedYear !== 'ALL' ? `(${selectedYear})` : '(Total)'}
                </h3>
                <button onClick={onViewStats} className="text-sm text-earth-600 hover:underline">Ver todo</button>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-stone-100 text-center">
                    <p className="text-3xl font-bold text-stone-800">{finishedBooks.length}</p>
                    <p className="text-xs text-stone-500 uppercase tracking-wider mt-1">Leídos</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-stone-100 text-center">
                    <p className="text-3xl font-bold text-stone-800">{toReadBooks.length}</p>
                    <p className="text-xs text-stone-500 uppercase tracking-wider mt-1">Pendientes</p>
                </div>
             </div>
         </div>

        <div className="space-y-4">
            <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                <span className="w-2 h-6 bg-earth-500 rounded-full"></span>
                Calificaciones de Libros Terminados {selectedYear !== 'ALL' ? `(${selectedYear})` : '(Total)'}
            </h3>
            {finishedBooks.length === 0 ? (
                <div className="text-center py-8 text-stone-500">
                    <AlertCircle size={24} className="mx-auto mb-2 text-stone-300" />
                    <p className="text-sm">Aún no has terminado ningún libro para calificar en {selectedYear === 'ALL' ? 'todos los años' : `el año ${selectedYear}`}.</p>
                </div>
            ) : (
                <>
                    {Object.keys(booksByRating).sort((a, b) => Number(b) - Number(a)).map(ratingKey => {
                        const rating = Number(ratingKey);
                        const booksWithRating = booksByRating[rating];
                        if (booksWithRating.length === 0) return null; 

                        return (
                            <CollapsibleSection 
                                key={rating} 
                                title={
                                    <span className="flex items-center gap-1">
                                        {rating} <Star size={18} className="text-amber-400 fill-amber-400" />
                                        {rating > 1 ? 'estrellas' : 'estrella'}
                                    </span>
                                } 
                                count={booksWithRating.length}
                                initialOpen={false}
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
                                    {booksWithRating.map(book => (
                                        <BookCard 
                                            key={book.id} 
                                            book={book} 
                                            onEdit={onEditBook} 
                                            onDelete={onDeleteBook}
                                            onUpdateProgress={onUpdateProgress}
                                        />
                                    ))}
                                </div>
                            </CollapsibleSection>
                        );
                    })}
                    {finishedBooks.filter(b => !b.rating).length > 0 && (
                        <CollapsibleSection 
                            title="Sin Calificación" 
                            count={finishedBooks.filter(b => !b.rating).length}
                            initialOpen={false}
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
                                {finishedBooks.filter(b => !b.rating).map(book => (
                                    <BookCard 
                                        key={book.id} 
                                        book={book} 
                                        onEdit={onEditBook} 
                                        onDelete={onDeleteBook}
                                        onUpdateProgress={onUpdateProgress}
                                    />
                                ))}
                            </div>
                        </CollapsibleSection>
                    )}
                </>
            )}
        </div>
    </div>
  );
};

export default DashboardView;