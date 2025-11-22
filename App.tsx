import React, { useState, useEffect } from 'react';
import { UserProfile, Book, BookStatus } from './types';
import { GENRES } from './constants';
import * as DataService from './services/dataService';
import BookCard from './components/BookCard';
import BookForm from './components/BookForm';
import Stats from './components/Stats';
import { Book as BookIcon, BarChart2, Plus, LogOut, Search, Filter, LayoutGrid, AlertCircle, Database, Copy, Check } from 'lucide-react';
import { showSuccess, showError, showConfirmation } from './src/utils/toast'; // Import toast utilities

enum View {
  DASHBOARD = 'DASHBOARD',
  LIBRARY = 'LIBRARY',
  STATS = 'STATS'
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
  status text not null,
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
`;

function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
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
          // Check specifically for missing table error (Code 42P01 in Postgres)
          if (msg.includes('relation "public.books" does not exist') || msg.includes('42P01')) {
            setSetupRequired(true);
          } else {
            setErrorMsg(`Error de conexión: ${msg}`);
          }
          setLoading(false);
        });
    }
  }, [user]);

  // Actions
  const handleSaveBook = async (bookData: Book | Omit<Book, 'id' | 'createdAt'>) => {
    setErrorMsg(null);
    try {
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
        // User cancelled, do nothing or show a cancellation message
        showError('Eliminación cancelada.');
      }
    );
  };

  const handleUpdateProgress = async (book: Book, newPage: number) => {
    setErrorMsg(null);
    let newStatus = book.status;
    if (newPage >= book.totalPages) {
        newStatus = BookStatus.TERMINADO;
    } else if (newPage > 0) {
        newStatus = BookStatus.LEYENDO;
    }
    
    const updatedBook = { ...book, currentPage: newPage, status: newStatus };
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

  // Derived State
  const filteredBooks = books.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || b.status === filterStatus;
    const matchesGenre = filterGenre === 'ALL' || b.genre === filterGenre;
    return matchesSearch && matchesStatus && matchesGenre;
  });

  const readingBooks = books.filter(b => b.status === BookStatus.LEYENDO);

  // Renders
  if (!user) {
    return (
      <div className="min-h-screen bg-earth-50 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
             <h1 className="text-4xl md:text-5xl font-bold text-earth-800 mb-4 font-serif">AmaLiburutegia</h1>
             <p className="text-earth-600 text-lg">Selecciona tu perfil para entrar a tu biblioteca</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <button 
                onClick={() => setUser(UserProfile.MAIXUX)}
                className="group bg-white p-8 rounded-2xl shadow-sm border-2 border-transparent hover:border-earth-400 transition-all transform hover:-translate-y-1"
            >
                <div className="w-24 h-24 bg-earth-200 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                    👩‍🏫
                </div>
                <h2 className="text-2xl font-bold text-center text-earth-900">Maixux</h2>
                <p className="text-center text-earth-500 mt-2">Entrar a mi biblioteca</p>
            </button>

            <button 
                onClick={() => setUser(UserProfile.ARANTXA)}
                className="group bg-white p-8 rounded-2xl shadow-sm border-2 border-transparent hover:border-earth-400 transition-all transform hover:-translate-y-1"
            >
                <div className="w-24 h-24 bg-stone-200 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                    👩‍💻
                </div>
                <h2 className="text-2xl font-bold text-center text-stone-900">Arantxa</h2>
                <p className="text-center text-stone-500 mt-2">Entrar a mi biblioteca</p>
            </button>
          </div>
        </div>
      </div>
    );
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
            <span className="font-serif font-bold text-xl text-earth-900 hidden sm:inline">AmaLiburutegia</span>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-earth-100 rounded-full">
                <span className="text-sm font-medium text-earth-800">{user}</span>
                <button 
                    onClick={() => setUser(null)}
                    className="p-1 hover:bg-earth-200 rounded-full text-earth-600 transition-colors"
                    title="Cambiar usuario"
                >
                    <LogOut size={14} />
                </button>
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
                            {readingBooks.length > 0 
                                ? `Estás leyendo ${readingBooks.length} libros actualmente. ¡Sigue así!`
                                : 'No estás leyendo nada ahora mismo. ¿Buscamos algo en la estantería?'}
                        </p>
                     </div>

                     {readingBooks.length > 0 && (
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
                                        onEdit={(b) => { setEditingBook(b); setIsFormOpen(true); }} 
                                        onDelete={handleDeleteBook}
                                        onUpdateProgress={handleUpdateProgress}
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
                </div>
            )}

            {view === View.LIBRARY && (
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
                                className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-700 focus:outline-none"
                            >
                                <option value="ALL">Todos los estados</option>
                                <option value={BookStatus.POR_LEER}>Por Leer</option>
                                <option value={BookStatus.LEYENDO}>Leyendo</option>
                                <option value={BookStatus.TERMINADO}>Terminados</option>
                            </select>
                             <select 
                                value={filterGenre} 
                                onChange={(e) => setFilterGenre(e.target.value)}
                                className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-700 focus:outline-none"
                            >
                                <option value="ALL">Todos los géneros</option>
                                {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                    </div>

                    {loading ? (
                         <div className="text-center py-20 text-stone-400 flex flex-col items-center gap-2">
                            <div className="w-8 h-8 border-4 border-earth-200 border-t-earth-500 rounded-full animate-spin"></div>
                            <p>Cargando biblioteca...</p>
                         </div>
                    ) : filteredBooks.length === 0 ? (
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {filteredBooks.map(book => (
                                <BookCard 
                                    key={book.id} 
                                    book={book} 
                                    onEdit={(b) => { setEditingBook(b); setIsFormOpen(true); }} 
                                    onDelete={(id) => handleDeleteBook(id)}
                                    onUpdateProgress={handleUpdateProgress}
                                />
                            ))}
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