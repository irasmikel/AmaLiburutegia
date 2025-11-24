import React from 'react';
import { Book, BookStatus } from '../types';
import { STATUS_COLORS, STATUS_LABELS } from '../constants';
import { Edit2, Trash2, BookOpen, CheckCircle, Clock, Star } from 'lucide-react'; 

interface BookCardProps {
  book: Book;
  onEdit: (book: Book) => void;
  onDelete: (id: string) => void;
  onUpdateProgress: (book: Book, newPage: number) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, onEdit, onDelete, onUpdateProgress }) => {
  const progressPercent = Math.min(100, Math.round(((book.currentPage || 0) / book.totalPages) * 100));

  const StatusIcon = {
    [BookStatus.POR_LEER]: Clock,
    [BookStatus.LEYENDO]: BookOpen,
    [BookStatus.TERMINADO]: CheckCircle,
  }[book.status];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-100 hover:shadow-md transition-all duration-300 group flex flex-col h-full relative p-4">
      
      {/* Edit/Delete buttons - moved to top right of the card */}
      <div className="absolute top-4 right-4 p-1.5 bg-white/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 shadow-md z-10">
          <button 
              onClick={(e) => { e.stopPropagation(); onEdit(book); }}
              className="p-1.5 rounded-md text-stone-600 hover:bg-stone-100 hover:text-blue-600 transition-colors"
              title="Editar libro"
          >
              <Edit2 size={16} />
          </button>
          <button 
               onClick={(e) => { e.stopPropagation(); onDelete(book.id); }}
              className="p-1.5 rounded-md text-stone-600 hover:bg-stone-100 hover:text-red-600 transition-colors"
              title="Eliminar libro"
          >
              <Trash2 size={16} />
          </button>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="mb-2">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[book.status]}`}>
                <StatusIcon size={12} />
                {STATUS_LABELS[book.status]}
            </span>
        </div>

        <h3 className="font-bold text-stone-900 leading-tight mb-1 line-clamp-2" title={book.title}>
            {book.title}
        </h3>
        <p className="text-stone-500 text-sm mb-3 line-clamp-1">{book.author}</p>

        <div className="mt-auto space-y-3">
             {/* Progress Bar */}
            {book.status === BookStatus.LEYENDO && (
                <div className="space-y-1">
                    <div className="flex justify-between text-xs text-stone-500">
                        <span>{book.currentPage} / {book.totalPages} págs</span>
                        <span>{progressPercent}%</span>
                    </div>
                    <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    <button 
                        className="text-xs text-emerald-600 font-medium hover:underline mt-1"
                        onClick={() => {
                            const newPage = prompt("Introduce la página actual:", book.currentPage?.toString());
                            if (newPage && !isNaN(Number(newPage))) {
                                onUpdateProgress(book, Number(newPage));
                            }
                        }}
                    >
                        Actualizar progreso
                    </button>
                </div>
            )}

            {book.status === BookStatus.TERMINADO && book.rating && (
                <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} size={18} className={`${i < book.rating! ? 'text-amber-400 fill-amber-400' : 'text-stone-200'}`} />
                    ))}
                </div>
            )}
             
            {book.status === BookStatus.TERMINADO && book.notes && (
                <div className="text-sm text-stone-600 mt-2 line-clamp-3">
                    <p className="font-medium mb-1">Notas:</p>
                    <p>{book.notes}</p>
                </div>
            )}

             {book.status === BookStatus.POR_LEER && (
                 <div className="text-xs text-stone-400 flex items-center gap-1">
                    <span className="bg-stone-100 px-2 py-1 rounded">{book.genre}</span>
                    <span>• {book.totalPages} págs</span>
                 </div>
             )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;