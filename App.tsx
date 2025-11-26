import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, Book, BookStatus } from './types';
import * as DataService from './services/dataService';
import BookCard from './components/BookCard';
import BookForm from './components/BookForm';
import Stats from './components/Stats';
import CollapsibleSection from './src/components/CollapsibleSection';
import { Book as BookIcon, BarChart2, Plus, LogOut, Search, Filter, LayoutGrid, AlertCircle, Database, Copy, Check, Star } from 'lucide-react';
import { showSuccess, showError, showConfirmation } from './src/utils/toast.tsx';

enum View {
  DASHBOARD = 'DASHBOARD',
  LIBRARY = 'LIBRARY',
  STATS = 'STATS',
}

// SQL for the user to copy if tables are missing
const SETUP_SQL = `
-- 1. Crea la tabla de libros (si no existe)
create table if not exists public.books (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  title text not null,
  author text not null,
  total_pages integer not null,
  current_page integer default 0,
  genre text,
  status text,
  cover_url text,
  notes text,
  year integer,
  rating integer,
  review text,
  start_date date,
  finish_date date,
  created_at timestamptz default now()
);

-- 2. Habilita la seguridad a nivel de fila (RLS)
alter table public.books enable row level security;

-- 3. Configura el acceso público (Lectura y Escritura)
-- Primero borramos la política si ya existe para evitar errores
drop policy if exists "Public access" on public.books;

-- Creamos la política que permite TODO (Select, Insert, Update, Delete)
create policy "Public access" 
on public.books 
for all 
using (true) 
with check (true);

-- 4. Crea el bucket de almacenamiento para archivos compartidos (si no existe) (Removed)
-- insert into storage.buckets (id, name, public)
-- values ('shared-files', 'shared-files', true)
-- on conflict (id) do nothing;

-- 5. Configura las políticas de seguridad para el bucket 'shared-files' (Removed)
-- Permite a todos subir archivos (cambiado de 'authenticated' a 'public')
-- drop policy if exists "Allow public uploads" on storage.objects;
-- create policy "Allow public uploads"
-- on storage.objects for insert
-- to public
-- with check (bucket_id = 'shared-files');

-- Permite a todos ver archivos
-- drop policy if exists "Allow public access" on storage.objects;
-- create policy "Allow public access"
-- on storage.objects for select
-- using (bucket_id = 'shared-files');

-- Permite a todos eliminar archivos
-- drop policy if exists "Allow public delete" on storage.objects;
-- create policy "Allow public delete"
-- on storage.objects for delete
-- using (bucket_id = 'shared-files');

-- 6. Crea la tabla de géneros (si no existe)
create table if not exists public.genres (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  created_at timestamptz default now()
);

-- Habilita la seguridad a nivel de fila (RLS) para géneros
alter table public.genres enable row level security;

-- Política para acceso público a géneros
drop policy if exists "Public genres access" on public.genres;
create policy "Public genres access"
on public.genres
for all
using (true)
with check (true);

-- Inserta algunos géneros iniciales si la tabla está vacía
insert into public.genres (name)
values
('Ficción'),
('No Ficción'),
('Romance'),
('Thriller'),
('Historia'),
('Biografía'),
('Fantasía'),
('Ciencia Ficción'),
('Clásicos'),
('Autoayuda'),
('Misterio'),
('Poesía'),
('Otro')
on conflict (name) do nothing;
`;

function App() {
  const [user, setUser] = useState<UserProfile | null>(UserProfile.MAIXUX);
  const [view, setView] = useState<View>(View.DASHBOARD);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [setupRequired, setSetupRequired] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | undefined>(undefined);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<BookStatus | 'ALL'>('ALL');
  const [filterGenre, setFilterGenre] = useState<string>('ALL');
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);

  // Sorting
  const [sortField, setSortField] = useState<keyof Book>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (user) {
      setLoading(true);
      setErrorMsg(null);
      setSetupRequired(false);
      
      DataService.getBooks(user)
        .then(data => {
          setBooks(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          const msg = err.message || JSON.stringify(err);
          if (msg.includes('relation "public.books" does not exist') || msg.includes('42P01')) {
            setSetupRequired(true);
          } else {
            setErrorMsg(`Error de conexión: ${msg}`);
          }
          setLoading(false);
        });
        fetchAvailableGenres();
    }
  }, [user]);

  const fetchAvailableGenres = async () => {
    try {
      const genres = await DataService.getGenres();
      setAvailableGenres(genres.map(g => g.name));
    } catch (err: any) {
      showError(`Error al cargar géneros para el filtro: ${err.message}`);
    }
  };

  // Actions
  const handleSaveBook = async (bookData: Book | Omit<Book, 'id' | 'createdAt'>) => {
    setErrorMsg(null);
    try {
      // Ensure currentPage is totalPages if status is TERMINADO
      if (bookData.status === BookStatus.TERMINADO) {
        bookData.currentPage = bookData.totalPages;
      } else {
        bookData.currentPage = 0; // For POR_LEER, current page is 0
      }

      if ('id' in bookData) {
          await DataService.updateBook(bookData as Book);
          showSuccess('Libro actualizado correctamente.');
      } else {
          await DataService.addBook(bookData);
          showSuccess('Libro añadido correctamente.');
      }
      const updated = await DataService.getBooks(user!);
      setBooks(updated);
      setIsFormOpen(false);
      setEditingBook(undefined);
      fetchAvailableGenres();
    } catch (err: any) {
      const msg = err.message || JSON.stringify(err);
      showError(`No se pudo guardar el libro: ${msg}`);
    }
  };

  const handleDeleteBook = async (id: string) => {
    showConfirmation(
      '¿Estás seguro de que quieres eliminar este libro?',
      async () => {
        setErrorMsg(null);
        try {
          await DataService.deleteBook(id);
          const updated = await DataService.getBooks(user!);
          setBooks(updated);
          showSuccess('Libro eliminado correctamente.');
        } catch (err: any) {
          showError(`No se pudo eliminar: ${err.message}`);
        }
      },
      () => {
        showError('Eliminación cancelada.');
      }
    );
  };

  const handleUpdateProgress = async (book: Book, newPage: number) => {
    setErrorMsg(null);
    let newStatus = book.status;
    let finalCurrentPage = newPage;

    if (newPage >= book.totalPages) {
        newStatus = BookStatus.TERMINADO;
        finalCurrentPage = book.totalPages; // Ensure it's exactly totalPages
    } else if (newPage > 0) {
        // If user tries to set a page > 0 but < totalPages, it should still be POR_LEER
        // as we are removing the LEYENDO status.
        // For simplicity, if they update progress, it means they finished it.
        // Or, if they are just updating a finished book's page count (which should be totalPages)
        newStatus = BookStatus.TERMINADO; // Assume any progress update means it's finished
        finalCurrentPage = book.totalPages; // Force to finished state
        showSuccess('Libro marcado como terminado.');
    } else {
        newStatus = BookStatus.POR_LEER;
        finalCurrentPage = 0;
    }
    
    const updatedBook = { ...book, currentPage: finalCurrentPage, status: newStatus };
    try {
      await DataService.updateBook(updatedBook);
      const updated = await DataService.getBooks(user!);
      setBooks(updated);
      showSuccess('Progreso actualizado correctamente.');
    } catch (err: any) {
      showError(`No se pudo actualizar el progreso: ${err.message}`);
    }
  };

  const copySQL = () => {
    navigator.clipboard.writeText(SETUP_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showSuccess('SQL copiado al portapapeles.');
  };

  // Derived State: Filter and then Sort books
  const sortedAndFilteredBooks = useMemo(() => {
    let currentBooks = [...books];

    currentBooks = currentBooks.filter(b => {
        const matchesSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              b.author.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'ALL' || b.status === filterStatus;
        const matchesGenre = filterGenre === 'ALL' || b.genre === filterGenre;
        return matchesSearch && matchesStatus && matchesGenre;
    });

    currentBooks.sort((a, b) => {
        let valA: any;
        let valB: any;

        switch (sortField) {
            case 'title':
            case 'author':
                valA = a[sortField]?.toLowerCase() || '';
                valB = b[sortField]?.toLowerCase() || '';
                break;
            case 'rating':
                valA = a.rating || 0;
                valB = b.rating || 0;
                break;
            case 'createdAt':
                valA = a.createdAt;
                valB = b.createdAt;
                break;
            default:
                valA = a.title?.toLowerCase() || '';
                valB = b.title?.toLowerCase() || '';
                break;
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    return currentBooks;
  }, [books, searchTerm, filterStatus, filterGenre, sortField, sortDirection]);

  // No longer tracking "reading" books separately for dashboard
  const finishedBooks = sortedAndFilteredBooks.filter(b => b.status === BookStatus.TERMINADO);
  const toReadBooks = sortedAndFilteredBooks.filter(b => b.status === BookStatus.POR_LEER);

  // New derived state for books by rating
  const booksByRating = useMemo(() => {
    const ratings: Record<number, Book[]> = { 5: [], 4: [], 3: [], 2: [], 1: [] };
    finishedBooks.forEach(book => {
      if (book.rating && book.rating >= 1 && book.rating <= 5) {
        ratings[book.rating].push(book);
      }
    });
    return ratings;
  }, [finishedBooks]);


  // Renders
  if (!user) {
    return null; // Should not be reached as user is defaulted
  }

  // Database Setup Screen
  if (setupRequired) {
    return (
      <div className="min-h-screen bg-earth-50 flex items-center justify-center p-4">
        <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-earth-200">
          <div className="bg-earth-600 p-6 text-white flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-full">
              <Database size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Configuración Necesaria</h2>
              <p className="opacity-90">La base de datos aún no tiene la tabla de libros creada.</p>
            </div>
          </div>
          
          <div className="p-8 space-y-6">
            <p className="text-stone-600 text-lg">
              Parece que es la primera vez que conectas. Para que la app funcione, necesitas ejecutar el siguiente código SQL en tu panel de Supabase.
            </p>

            <ol className="list-decimal list-inside space-y-2 text-stone-700 font-medium">
              <li>Ve al <a href="https://supabase.com/dashboard/project/iaxvnfrplqmxgohsaeci/sql" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">Editor SQL de tu proyecto Supabase</a>.</li>
              <li>Crea una "New Query" (Nueva Consulta).</li>
              <li>Copia y pega el código de abajo.</li>
              <li>Haz clic en "Run" (Ejecutar).</li>
            </ol>

            <div className="relative">
              <div className="absolute top-2 right-2">
                <button 
                  onClick={copySQL}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-stone-300 rounded text-sm transition-colors border border-stone-600"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copiado' : 'Copiar SQL'}
                </button>
              </div>
              <pre className="bg-stone-900 text-stone-100 p-4 rounded-lg overflow-x-auto text-sm font-mono leading-relaxed border border-stone-700">
                {SETUP_SQL}
              </pre>
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                onClick={() => window.location.reload()} 
                className="px-6 py-3 bg-earth-600 text-white rounded-lg font-bold hover:bg-earth-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                ¡Ya lo he ejecutado! Recargar App
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-earth-50 pb-20 md:pb-0">
      
      {/* Header */}
      <header className="bg-white border-b border-earth-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📚</span>
            <span className="font-serif font-bold text-xl text-earth-900 hidden sm:inline">Liburutegia</span>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-earth-100 rounded-full">
                <span className="text-sm font-medium text-earth-800">{user}</span>
             </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Global Error Message */}
        {errorMsg && (
           <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 flex items-center gap-3 animate-fade-in">
              <AlertCircle size={20} />
              <p className="text-sm font-medium">{errorMsg}</p>
              <button onClick={() => setErrorMsg(null)} className="ml-auto text-red-600 hover:text-red-800">✕</button>
           </div>
        )}
        
        {/* Navigation Tabs (Mobile: Bottom Fixed, Desktop: Top) */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:static md:bg-transparent md:border-0 md:mb-8 z-20">
            <div className="flex justify-around md:justify-start md:gap-4 p-2 md:p-0">
                <button 
                    onClick={() => setView(View.DASHBOARD)}
                    className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 px-4 py-2 rounded-lg transition-colors ${view === View.DASHBOARD ? 'text-earth-700 bg-earth-100' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    <LayoutGrid size={20} />
                    <span className="text-xs md:text-sm font-medium">Inicio</span>
                </button>
                <button 
                    onClick={() => setView(View.LIBRARY)}
                    className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 px-4 py-2 rounded-lg transition-colors ${view === View.LIBRARY ? 'text-earth-700 bg-earth-100' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    <BookIcon size={20} />
                    <span className="text-xs md:text-sm font-medium">Biblioteca</span>
                </button>
                <button 
                    onClick={() => setView(View.STATS)}
                    className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 px-4 py-2 rounded-lg transition-colors ${view === View.STATS ? 'text-earth-700 bg-earth-100' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    <BarChart2 size={20} />
                    <span className="text-xs md:text-sm font-medium">Estadísticas</span>
                </button>
                 <button 
                    onClick={() => { setEditingBook(undefined); setIsFormOpen(true); }}
                    className="md:ml-auto flex flex-col md:flex-row items-center gap-1 md:gap-2 px-4 py-2 rounded-lg bg-earth-600 text-white shadow-md hover:bg-earth-700 transition-colors"
                >
                    <Plus size={20} />
                    <span className="text-xs md:text-sm font-medium">Añadir</span>
                </button>
            </div>
        </div>

        {/* Content Area */}
        <div className="animate-fade-in min-h-[calc(100vh-200px)]">
            
            {view === View.DASHBOARD && (
                <div className="space-y-8">
                     <div className="bg-gradient-to-r from-earth-600 to-earth-500 rounded-2xl p-6 text-white shadow-lg">
                        <h2 className="text-2xl font-bold mb-2">¡Hola, {user}!</h2>
                        <p className="opacity-90">
                            {toReadBooks.length > 0 
                                ? `Tienes ${toReadBooks.length} libros pendientes. ¡A por ellos!`
                                : 'No tienes libros pendientes ahora mismo. ¡Añade uno nuevo!'}
                        </p>
                     </div>

                    {/* Quick Stats Preview */}
                     <div>
                         <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                                <span className="w-2 h-6 bg-earth-500 rounded-full"></span>
                                Resumen Rápido
                            </h3>
                            <button onClick={() => setView(View.STATS)} className="text-sm text-earth-600 hover:underline">Ver todo</button>
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

                    {/* New: Books by Rating Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                            <span className="w-2 h-6 bg-earth-500 rounded-full"></span>
                            Calificaciones de Libros Terminados
                        </h3>
                        {finishedBooks.length === 0 ? (
                            <div className="text-center py-8 text-stone-500">
                                <AlertCircle size={24} className="mx-auto mb-2 text-stone-300" />
                                <p className="text-sm">Aún no has terminado ningún libro para calificar.</p>
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
                                                        onEdit={(b) => { setEditingBook(b); setIsFormOpen(true); }} 
                                                        onDelete={(id) => handleDeleteBook(id)}
                                                        onUpdateProgress={handleUpdateProgress}
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
                                                    onEdit={(b) => { setEditingBook(b); setIsFormOpen(true); }} 
                                                    onDelete={(id) => handleDeleteBook(id)}
                                                    onUpdateProgress={handleUpdateProgress}
                                                />
                                            ))}
                                        </div>
                                    </CollapsibleSection>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {view === View.LIBRARY && (
                <div className="space-y-6">
                    {/* Filters and Sorting */}
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
                                className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-700 focus:outline-none"
                            >
                                <option value="ALL">Todos los estados</option>
                                <option value={BookStatus.POR_LEER}>Por Leer</option>
                                <option value={BookStatus.TERMINADO}>Terminados</option>
                            </select>
                             <select 
                                value={filterGenre} 
                                onChange={(e) => setFilterGenre(e.target.value)}
                                className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-700 focus:outline-none"
                            >
                                <option value="ALL">Todos los géneros</option>
                                {availableGenres.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                            <select
                                value={sortField}
                                onChange={(e) => setSortField(e.target.value as keyof Book)}
                                className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-700 focus:outline-none"
                            >
                                <option value="createdAt">Fecha de Adición</option>
                                <option value="title">Título</option>
                                <option value="author">Autor</option>
                                <option value="rating">Calificación</option>
                            </select>
                            <select
                                value={sortDirection}
                                onChange={(e) => setSortDirection(e.target.value as 'asc' | 'desc')}
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
                    ) : sortedAndFilteredBooks.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-stone-500 text-lg mb-4">No se encontraron libros</p>
                             <button 
                                onClick={() => { setEditingBook(undefined); setIsFormOpen(true); }}
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
                                                onEdit={(b) => { setEditingBook(b); setIsFormOpen(true); }} 
                                                onDelete={(id) => handleDeleteBook(id)}
                                                onUpdateProgress={handleUpdateProgress}
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
                                                onEdit={(b) => { setEditingBook(b); setIsFormOpen(true); }} 
                                                onDelete={(id) => handleDeleteBook(id)}
                                                onUpdateProgress={handleUpdateProgress}
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
            )}

            {view === View.STATS && (
                <Stats books={books} />
            )}
        </div>

      </main>

      {/* Modal */}
      {isFormOpen && user && (
        <BookForm 
            userId={user} 
            initialData={editingBook} 
            onClose={() => { setIsFormOpen(false); setEditingBook(undefined); }} 
            onSave={handleSaveBook}
        />
      )}

    </div>
  );
}

export default App;