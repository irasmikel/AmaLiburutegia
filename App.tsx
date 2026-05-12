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
import DownloadModal from './src/components/DownloadModal';
import { useBooks } from './src/hooks/useBooks';
import { showSuccess, showError, showConfirmation } from './src/utils/toast.tsx';
import { generateBooksReport } from './src/services/pdfService';

const SETUP_SQL = `
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
alter table public.books enable row level security;
drop policy if exists "Public access" on public.books;
create policy "Public access" on public.books for all using (true) with check (true);
create table if not exists public.genres (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  created_at timestamptz default now()
);
alter table public.genres enable row level security;
drop policy if exists "Public genres access" on public.genres;
create policy "Public genres access" on public.genres for all using (true) with check (true);
insert into public.genres (name) values ('Ficción'), ('No Ficción'), ('Romance'), ('Thriller'), ('Historia'), ('Biografía'), ('Fantasía'), ('Ciencia Ficción'), ('Clásicos'), ('Autoayuda'), ('Misterio'), ('Poesía'), ('Otro') on conflict (name) do nothing;
`;

function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [view, setView] = useState<View>(View.DASHBOARD);
  const { books, loading, setupRequired, saveBook, deleteBook, updateProgress } = useBooks(user);
  
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number | 'ALL'>(currentYear);
  const [availableYears, setAvailableYears] = useState<(number | 'ALL')[]>([]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | undefined>(undefined);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<BookStatus | 'ALL'>('ALL');
  const [filterGenre, setFilterGenre] = useState<string>('ALL');
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);

  const [sortField, setSortField] = useState<keyof Book>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (user) {
      DataService.getGenres().then(gs => setAvailableGenres(gs.map(g => g.name)));
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
  }, [books]);

  const booksFilteredByYear = useMemo(() => {
    if (selectedYear === 'ALL') return books;
    return books.filter(book => {
      const finishYear = book.finishDate ? new Date(book.finishDate).getFullYear() : null;
      const creationYear = book.createdAt ? new Date(book.createdAt).getFullYear() : null;
      return finishYear === selectedYear || creationYear === selectedYear;
    });
  }, [books, selectedYear]);

  const sortedAndFilteredBooks = useMemo(() => {
    let currentBooks = [...booksFilteredByYear].filter(b => {
        const matchesSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase()) || b.author.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'ALL' || b.status === filterStatus;
        const matchesGenre = filterGenre === 'ALL' || b.genre === filterGenre;
        return matchesSearch && matchesStatus && matchesGenre;
    });

    currentBooks.sort((a, b) => {
        let valA: any, valB: any;
        switch (sortField) {
            case 'title': case 'author': valA = a[sortField]?.toLowerCase() || ''; valB = b[sortField]?.toLowerCase() || ''; break;
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

  const handleDownload = (year: number | 'ALL', includeNotes: boolean) => {
    if (user && books.length > 0) {
      generateBooksReport(user, books, { year, includeNotes });
      showSuccess('Informe PDF generado.');
      setIsDownloadModalOpen(false);
    } else {
      showError('No hay datos suficientes.');
    }
  };

  if (!user) return <AuthScreen onLogin={setUser} />;
  if (setupRequired) return <SetupScreen sql={SETUP_SQL} onCopy={() => { navigator.clipboard.writeText(SETUP_SQL); showSuccess('SQL copiado.'); }} copied={false} />;

  return (
    <div className="min-h-screen bg-earth-50 pb-20 md:pb-0">
      <Header 
        user={user} 
        selectedYear={selectedYear} 
        availableYears={availableYears} 
        onYearChange={setSelectedYear} 
        onDownloadReport={() => setIsDownloadModalOpen(true)} 
        onLogout={() => setUser(null)} 
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Navigation view={view} onViewChange={setView} onAddBook={() => { setEditingBook(undefined); setIsFormOpen(true); }} />
        <div className="animate-fade-in min-h-[calc(100vh-200px)]">
            {view === View.DASHBOARD && <DashboardView user={user} selectedYear={selectedYear} finishedBooks={finishedBooks} toReadBooks={toReadBooks} booksByRating={booksByRating} onEditBook={(b) => { setEditingBook(b); setIsFormOpen(true); }} onDeleteBook={(id) => showConfirmation('¿Eliminar libro?', () => deleteBook(id), () => {})} onUpdateProgress={updateProgress} onViewStats={() => setView(View.STATS)} />}
            {view === View.LIBRARY && <LibraryView loading={loading} books={sortedAndFilteredBooks} finishedBooks={finishedBooks} toReadBooks={toReadBooks} searchTerm={searchTerm} onSearchChange={setSearchTerm} filterStatus={filterStatus} onStatusChange={setFilterStatus} filterGenre={filterGenre} onGenreChange={setFilterGenre} availableGenres={availableGenres} sortField={sortField} onSortFieldChange={setSortField} sortDirection={sortDirection} onSortDirectionChange={setSortDirection} onEditBook={(b) => { setEditingBook(b); setIsFormOpen(true); }} onDeleteBook={(id) => showConfirmation('¿Eliminar libro?', () => deleteBook(id), () => {})} onUpdateProgress={updateProgress} onAddBook={() => { setEditingBook(undefined); setIsFormOpen(true); }} />}
            {view === View.STATS && <Stats books={booksFilteredByYear} selectedYear={selectedYear} />}
        </div>
      </main>
      {isFormOpen && <BookForm userId={user} initialData={editingBook} onClose={() => { setIsFormOpen(false); setEditingBook(undefined); }} onSave={(data) => saveBook(data).then(success => success && setIsFormOpen(false))} />}
      {isDownloadModalOpen && <DownloadModal availableYears={availableYears} onClose={() => setIsDownloadModalOpen(false)} onDownload={handleDownload} />}
    </div>
  );
}

export default App;