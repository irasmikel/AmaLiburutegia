import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, Book, BookStatus } from './types';
import * as DataService from './services/dataService';
import BookForm from './components/BookForm';
import Stats from './src/components/Stats';
import AuthScreen from './src/components/AuthScreen';
import Header from './src/components/Header';
import Navigation, { View } from './src/components/Navigation';
import DashboardView from './src/components/DashboardView';
import LibraryView from './src/components/LibraryView';
import SetupScreen from './src/components/SetupScreen';
import { AlertCircle } from 'lucide-react';
import { showSuccess, showError, showConfirmation } from './src/utils/toast.tsx';
import { generateBooksReport } from './src/services/pdfService';

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
drop policy if exists "Public access" on public.books;
create policy "Public access" 
on public.books 
for all 
using (true) 
with check (true);

-- 4. Crea la tabla de géneros (si no existe)
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
('Ficción'), ('No Ficción'), ('Romance'), ('Thriller'), ('Historia'),
('Biografía'), ('Fantasía'), ('Ciencia Ficción'), ('Clásicos'),
('Autoayuda'), ('Misterio'), ('Poesía'), ('Otro')
on conflict (name) do nothing;
`;

function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [view, setView] = useState<View>(View.DASHBOARD);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [setupRequired, setSetupRequired] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number | 'ALL'>(currentYear);
  const [availableYears, setAvailableYears] = useState<(number | 'ALL')[]>([]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | undefined>(undefined);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<BookStatus | 'ALL'>('ALL');
  const [filterGenre, setFilterGenre] = useState<string>('ALL');
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);

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
          const msg = err.message || JSON.stringify(err);
          if (msg.includes('relation "public.books" does not exist') || msg.includes('42P01')) {
            setSetupRequired(true);
          } else {
            setErrorMsg(`Error de conexión: ${msg}`);
          }
          setLoading(false);
        });
        fetchAvailableGenres();
    } else {
      setBooks([]);
      setAvailableGenres([]);
    }
  }, [user]);

  useEffect(() => {
    const years = new Set<number>();
    books.forEach(book => {
      if (book.finishDate) years.add(new Date(book.finishDate).getFullYear());
      if (book.createdAt) years.add(new Date(book.createdAt).getFullYear());
    });
    const sortedYears = Array.from(years).sort((a, b) => b - a);
    setAvailableYears(['ALL', ...sortedYears]);
    if (sortedYears.length > 0 && selectedYear === currentYear && !sortedYears.includes(currentYear)) {
      setSelectedYear(sortedYears[0]);
    }
  }, [books, currentYear]);

  const fetchAvailableGenres = async () => {
    try {
      const genres = await DataService.getGenres();
      setAvailableGenres(genres.map(g => g.name));
    } catch (err: any) {
      showError(`Error al cargar géneros: ${err.message}`);
    }
  };

  const handleSaveBook = async (bookData: Book | Omit<Book, 'id' | 'createdAt'>) => {
    setErrorMsg(null);
    try {
      if (bookData.status === BookStatus.TERMINADO) {
        bookData.currentPage = bookData.totalPages;
      } else {
        bookData.currentPage = 0;
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
      showError(`No se pudo guardar el libro: ${err.message}`);
    }
  };

  const handleDeleteBook = async (id: string) => {
    showConfirmation(
      '¿Estás seguro de que quieres eliminar este libro?',
      async () => {
        try {
          await DataService.deleteBook(id);
          const updated = await DataService.getBooks(user!);
          setBooks(updated);
          showSuccess('Libro eliminado correctamente.');
        } catch (err: any) {
          showError(`No se pudo eliminar: ${err.message}`);
        }
      },
      () => showError('Eliminación cancelada.')
    );
  };

  const handleUpdateProgress = async (book: Book, newPage: number) => {
    let newStatus = book.status;
    let finalCurrentPage = newPage;

    if (newPage >= book.totalPages) {
        newStatus = BookStatus.TERMINADO;
        finalCurrentPage = book.totalPages;
    } else if (newPage > 0) {
        newStatus = BookStatus.TERMINADO;
        finalCurrentPage = book.totalPages;
        showSuccess('Libro marcado como terminado.');
    } else {
        newStatus = BookStatus.POR_LEER;
        finalCurrentPage = 0;
    }
    
    try {
      await DataService.updateBook({ ...book, currentPage: finalCurrentPage, status: newStatus });
      const updated = await DataService.getBooks(user!);
      setBooks(updated);
      showSuccess('Progreso actualizado correctamente.');
    } catch (err: any) {
      showError(`No se pudo actualizar: ${err.message}`);
    }
  };

  const copySQL = () => {
    navigator.clipboard.writeText(SETUP_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showSuccess('SQL copiado.');
  };

  const handleDownloadReport = () => {
    if (user && books.length > 0) {
      generateBooksReport(user, books);
      showSuccess('Generando informe PDF...');
    } else {
      showError('No hay datos suficientes.');
    }
  };

  const booksFilteredByYear = useMemo(() => {
    if (selectedYear === 'ALL') return books;
    return books.filter(book => {
      const finishYear = book.finishDate ? new Date(book.finishDate).getFullYear() : null;
      const creationYear = book.createdAt ? new Date(book.createdAt).getFullYear() : null;
      return finishYear === selectedYear || creationYear === selectedYear;
    });
  }, [books, selectedYear]);

  const sortedAndFilteredBooks = useMemo(() => {
    let currentBooks = [...booksFilteredByYear];
    currentBooks = currentBooks.filter(b => {
        const matchesSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              b.author.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'ALL' || b.status === filterStatus;
        const matchesGenre = filterGenre === 'ALL' || b.genre === filterGenre;
        return matchesSearch && matchesStatus && matchesGenre;
    });

    currentBooks.sort((a, b) => {
        let valA: any, valB: any;
        switch (sortField) {
            case 'title': case 'author':
                valA = a[sortField]?.toLowerCase() || '';
                valB = b[sortField]?.toLowerCase() || '';
                break;
            case 'rating': valA = a.rating || 0; valB = b.rating || 0; break;
            case 'createdAt': valA = a.createdAt; valB = b.createdAt; break;
            default: valA = a.title?.toLowerCase() || ''; valB = b.title?.toLowerCase() || ''; break;
        }
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
    return currentBooks;
  }, [booksFilteredByYear, searchTerm, filterStatus, filterGenre, sortField, sortDirection]);

  const finishedBooks = sortedAndFilteredBooks.filter(b => b.status === BookStatus.TERMINADO);
  const toReadBooks = sortedAndFilteredBooks.filter(b => b.status === BookStatus.POR_LEER);

  const booksByRating = useMemo(() => {
    const ratings: Record<number, Book[]> = { 5: [], 4: [], 3: [], 2: [], 1: [] };
    finishedBooks.forEach(book => {
      if (book.rating && book.rating >= 1 && book.rating <= 5) ratings[book.rating].push(book);
    });
    return ratings;
  }, [finishedBooks]);

  if (!user) return <AuthScreen onLogin={setUser} />;
  if (setupRequired) return <SetupScreen sql={SETUP_SQL} onCopy={copySQL} copied={copied} />;

  return (
    <div className="min-h-screen bg-earth-50 pb-20 md:pb-0">
      <Header 
        user={user} 
        selectedYear={selectedYear} 
        availableYears={availableYears} 
        onYearChange={setSelectedYear} 
        onDownloadReport={handleDownloadReport} 
        onLogout={() => setUser(null)} 
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {errorMsg && (
           <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 flex items-center gap-3 animate-fade-in">
              <AlertCircle size={20} />
              <p className="text-sm font-medium">{errorMsg}</p>
              <button onClick={() => setErrorMsg(null)} className="ml-auto text-red-600 hover:text-red-800">✕</button>
           </div>
        )}
        
        <Navigation view={view} onViewChange={setView} onAddBook={() => { setEditingBook(undefined); setIsFormOpen(true); }} />

        <div className="animate-fade-in min-h-[calc(100vh-200px)]">
            {view === View.DASHBOARD && (
                <DashboardView 
                  user={user} 
                  selectedYear={selectedYear} 
                  finishedBooks={finishedBooks} 
                  toReadBooks={toReadBooks} 
                  booksByRating={booksByRating} 
                  onEditBook={(b) => { setEditingBook(b); setIsFormOpen(true); }} 
                  onDeleteBook={handleDeleteBook} 
                  onUpdateProgress={handleUpdateProgress} 
                  onViewStats={() => setView(View.STATS)} 
                />
            )}

            {view === View.LIBRARY && (
                <LibraryView 
                  loading={loading} 
                  books={sortedAndFilteredBooks} 
                  finishedBooks={finishedBooks} 
                  toReadBooks={toReadBooks} 
                  searchTerm={searchTerm} 
                  onSearchChange={setSearchTerm} 
                  filterStatus={filterStatus} 
                  onStatusChange={setFilterStatus} 
                  filterGenre={filterGenre} 
                  onGenreChange={setFilterGenre} 
                  availableGenres={availableGenres} 
                  sortField={sortField} 
                  onSortFieldChange={setSortField} 
                  sortDirection={sortDirection} 
                  onSortDirectionChange={setSortDirection} 
                  onEditBook={(b) => { setEditingBook(b); setIsFormOpen(true); }} 
                  onDeleteBook={handleDeleteBook} 
                  onUpdateProgress={handleUpdateProgress} 
                  onAddBook={() => { setEditingBook(undefined); setIsFormOpen(true); }} 
                />
            )}

            {view === View.STATS && <Stats books={booksFilteredByYear} selectedYear={selectedYear} />}
        </div>
      </main>

      {isFormOpen && (
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