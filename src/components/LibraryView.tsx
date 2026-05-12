"use client";

import React from 'react';
import { Search } from 'lucide-react';
import { Book, BookStatus } from '../../types';
import BookCard from '../../components/BookCard';
import CollapsibleSection from './CollapsibleSection';

interface LibraryViewProps {
  loading: boolean;
  books: Book[];
  finishedBooks: Book[];
  toReadBooks: Book[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filterStatus: BookStatus | 'ALL';
  onStatusChange: (status: BookStatus | 'ALL') => void;
  filterGenre: string;
  onGenreChange: (genre: string) => void;
  availableGenres: string[];
  sortField: keyof Book;
  onSortFieldChange: (field: keyof Book) => void;
  sortDirection: 'asc' | 'desc';
  onSortDirectionChange: (dir: 'asc' | 'desc') => void;
  onEditBook: (book: Book) => void;
  onDeleteBook: (id: string) => void;
  onUpdateProgress: (book: Book, newPage: number) => void;
  onAddBook: () => void;
}

const LibraryView: React.FC<LibraryViewProps> = ({
  loading,
  books,
  finishedBooks,
  toReadBooks,
  searchTerm,
  onSearchChange,
  filterStatus,
  onStatusChange,
  filterGenre,
  onGenreChange,
  availableGenres,
  sortField,
  onSortFieldChange,
  sortDirection,
  onSortDirectionChange,
  onEditBook,
  onDeleteBook,
  onUpdateProgress,
  onAddBook
}) => {
  return (
    <div className="space-y-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-100 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Buscar por título o autor..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-earth-300 transition-all"
                />
            </div>
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                <select 
                    value={filterStatus} 
                    onChange={(e) => onStatusChange(e.target.value as any)}
                    className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-700 focus:outline-none"
                >
                    <option value="ALL">Todos los estados</option>
                    <option value={BookStatus.POR_LEER}>Por Leer</option>
                    <option value={BookStatus.TERMINADO}>Terminados</option>
                </select>
                 <select 
                    value={filterGenre} 
                    onChange={(e) => onGenreChange(e.target.value)}
                    className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-700 focus:outline-none"
                >
                    <option value="ALL">Todos los géneros</option>
                    {availableGenres.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <select
                    value={sortField}
                    onChange={(e) => onSortFieldChange(e.target.value as keyof Book)}
                    className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-700 focus:outline-none"
                >
                    <option value="createdAt">Fecha de Adición</option>
                    <option value="title">Título</option>
                    <option value="author">Autor</option>
                    <option value="rating">Calificación</option>
                </select>
                <select
                    value={sortDirection}
                    onChange={(e) => onSortDirectionChange(e.target.value as 'asc' | 'desc')}
                    className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-700 focus:outline-none"
                >
                    <option value="desc">Descendente</option>
                    <option value="asc">Ascendente</option>
                </select>
            </div>
        </div>

        {loading ? (
             <div className="text-center py-20 text-stone-400 flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-earth-200 border-t-earth-500 rounded-full animate-spin"></div>
                <p>Cargando biblioteca...</p>
             </div>
        ) : books.length === 0 ? (
            <div className="text-center py-20">
                <p className="text-stone-500 text-lg mb-4">No se encontraron libros</p>
                 <button 
                    onClick={onAddBook}
                    className="px-4 py-2 bg-earth-600 text-white rounded-lg hover:bg-earth-700"
                >
                    Añadir el primero
                </button>
            </div>
        ) : (
            <div className="space-y-6">
                <CollapsibleSection title="Libros Terminados" initialOpen={false} count={finishedBooks.length}>
                    {finishedBooks.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {finishedBooks.map(book => (
                                <BookCard 
                                    key={book.id} 
                                    book={book} 
                                    onEdit={onEditBook} 
                                    onDelete={onDeleteBook}
                                    onUpdateProgress={onUpdateProgress}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-stone-500 py-4">No hay libros terminados que coincidan con los filtros.</p>
                    )}
                </CollapsibleSection>

                <CollapsibleSection title="Libros Por Leer" initialOpen={false} count={toReadBooks.length}>
                    {toReadBooks.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {toReadBooks.map(book => (
                                <BookCard 
                                    key={book.id} 
                                    book={book} 
                                    onEdit={onEditBook} 
                                    onDelete={onDeleteBook}
                                    onUpdateProgress={onUpdateProgress}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-stone-500 py-4">No hay libros por leer que coincidan con los filtros.</p>
                    )}
                </CollapsibleSection>
            </div>
        )}
    </div>
  );
};

export default LibraryView;