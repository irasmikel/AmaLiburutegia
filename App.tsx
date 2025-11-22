import React, { useState } from 'react';
import { UserProfile, Book } from './types';
import { useBooks } from './src/hooks/useBooks';
import AuthScreen from './src/components/AuthScreen';
import DatabaseSetupScreen from './src/components/DatabaseSetupScreen';
import MainLayout from './src/components/MainLayout';
import DashboardView from './src/components/DashboardView';
import LibraryView from './src/components/LibraryView';
import Stats from './components/Stats';
import BookFormModal from './src/components/BookFormModal';

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
  
  // Book data and actions from custom hook
  const { 
    books, 
    loading, 
    errorMsg, 
    setupRequired, 
    refreshBooks,
    handleSaveBook, 
    handleDeleteBook, 
    handleUpdateProgress 
  } = useBooks(user);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | undefined>(undefined);

  const handleAddBookClick = () => {
    setEditingBook(undefined);
    setIsFormOpen(true);
  };

  const handleEditBookClick = (book: Book) => {
    setEditingBook(book);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingBook(undefined);
  };

  const handleSaveAndCloseForm = async (bookData: Book | Omit<Book, 'id' | 'createdAt'>) => {
    await handleSaveBook(bookData);
    handleCloseForm();
  };

  // Renders
  if (!user) {
    return <AuthScreen onSelectUser={setUser} />;
  }

  if (setupRequired) {
    return <DatabaseSetupScreen sqlScript={SETUP_SQL} onReloadApp={() => window.location.reload()} />;
  }

  return (
    <>
      <MainLayout
        user={user}
        view={view}
        setView={setView}
        onLogout={() => setUser(null)}
        onAddBook={handleAddBookClick}
        errorMsg={errorMsg}
        setErrorMsg={() => { /* Error messages are now managed by useBooks hook */ }}
      >
        {view === View.DASHBOARD && (
          <DashboardView
            user={user}
            books={books}
            loading={loading}
            onEditBook={handleEditBookClick}
            onDeleteBook={handleDeleteBook}
            onUpdateProgress={handleUpdateProgress}
            onViewStats={() => setView(View.STATS)}
          />
        )}

        {view === View.LIBRARY && (
          <LibraryView
            user={user}
            books={books}
            loading={loading}
            onEditBook={handleEditBookClick}
            onDeleteBook={handleDeleteBook}
            onUpdateProgress={handleUpdateProgress}
            onAddFirstBook={handleAddBookClick}
          />
        )}

        {view === View.STATS && (
          <Stats books={books} />
        )}
      </MainLayout>

      {user && (
        <BookFormModal
          userId={user}
          isOpen={isFormOpen}
          initialData={editingBook}
          onClose={handleCloseForm}
          onSave={handleSaveAndCloseForm}
        />
      )}
    </>
  );
}

export default App;