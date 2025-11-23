import { createClient } from '@supabase/supabase-js';
import { Book, UserProfile, BookStatus, SharedFile } from '../types';

// Supabase Configuration
const SUPABASE_URL = 'https://iaxvnfrplqmxgohsaeci.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlheHZuZnJwbHFteGdvaHNhZWNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MzE3NTAsImV4cCI6MjA3OTQwNzc1MH0.GqNJ4Aboyntcmto-MIiKOVy-OOGq2LdRSbP36qdOIg8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper to extract error message safely
const getErrorMessage = (error: any): string => {
  if (!error) return 'Error desconocido';
  if (typeof error === 'string') return error;
  if (error.message) return error.message;
  return JSON.stringify(error);
};

// Mapper: DB Row (snake_case) -> Application Model (camelCase)
const mapRowToBook = (row: any): Book => ({
  id: row.id,
  userId: row.user_id as UserProfile,
  title: row.title,
  author: row.author,
  totalPages: row.total_pages,
  currentPage: row.current_page,
  genre: row.genre,
  status: row.status as BookStatus,
  coverUrl: row.cover_url || undefined,
  notes: row.notes || undefined,
  year: row.year || undefined,
  rating: row.rating || undefined,
  review: row.review || undefined,
  startDate: row.start_date || undefined,
  finishDate: row.finish_date || undefined,
  createdAt: row.created_at
});

// Mapper: Application Model (camelCase) -> DB Row (snake_case)
const mapBookToRow = (book: Partial<Book>) => {
  // Helper to ensure empty strings or invalid 0s become null for nullable DB fields
  const toNull = (val: any) => (val === '' || val === undefined ? null : val);
  const numToNull = (val: any) => (val === 0 || val === '0' || val === '' || val === undefined ? null : Number(val));

  const row: any = {
    user_id: book.userId,
    title: book.title,
    author: book.author,
    total_pages: book.totalPages,
    current_page: book.currentPage,
    genre: book.genre,
    status: book.status,
    cover_url: toNull(book.coverUrl),
    notes: toNull(book.notes),
    year: numToNull(book.year),
    rating: numToNull(book.rating),
    review: toNull(book.review),
    start_date: toNull(book.startDate),
    finish_date: toNull(book.finishDate),
  };
  
  // Remove strictly undefined keys (but keep nulls so they clear fields in DB)
  Object.keys(row).forEach(key => row[key] === undefined && delete row[key]);
  return row;
};

export const getBooks = async (userId: UserProfile): Promise<Book[]> => {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase Fetch Error:', error);
    throw new Error(getErrorMessage(error));
  }

  return (data || []).map(mapRowToBook);
};

export const addBook = async (book: Omit<Book, 'id' | 'createdAt'>): Promise<Book> => {
  const row = mapBookToRow(book);
  
  const { data, error } = await supabase
    .from('books')
    .insert(row)
    .select()
    .single();

  if (error) {
    console.error('Supabase Insert Error:', error);
    throw new Error(getErrorMessage(error));
  }

  return mapRowToBook(data);
};

export const updateBook = async (book: Book): Promise<Book> => {
  const row = mapBookToRow(book);
  const { data, error } = await supabase
    .from('books')
    .update(row)
    .eq('id', book.id)
    .select()
    .single();

  if (error) {
    console.error('Supabase Update Error:', error);
    throw new Error(getErrorMessage(error));
  }

  return mapRowToBook(data);
};

export const deleteBook = async (bookId: string): Promise<void> => {
  const { error } = await supabase
    .from('books')
    .delete()
    .eq('id', bookId);

  if (error) {
    console.error('Supabase Delete Error:', error);
    throw new Error(getErrorMessage(error));
  }
};

// --- Supabase Storage Functions for Shared Files ---
const SHARED_FILES_BUCKET = 'shared-files';

export const uploadFile = async (file: File): Promise<SharedFile> => {
  const fileName = file.name; // Usar el nombre original del archivo
  const { data, error } = await supabase.storage
    .from(SHARED_FILES_BUCKET)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true, // Cambiado a 'true' para permitir sobrescribir si el nombre ya existe
    });

  if (error) {
    console.error('Supabase Upload Error:', error);
    throw new Error(getErrorMessage(error));
  }

  const { data: publicUrlData } = supabase.storage
    .from(SHARED_FILES_BUCKET)
    .getPublicUrl(fileName);

  return {
    name: file.name,
    path: data.path,
    url: publicUrlData.publicUrl,
    size: file.size,
    createdAt: new Date().toISOString(), // Supabase storage doesn't return created_at directly on upload
  };
};

export const getSharedFiles = async (): Promise<SharedFile[]> => {
  const { data, error } = await supabase.storage
    .from(SHARED_FILES_BUCKET)
    .list('', {
      limit: 100,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' },
    });

  if (error) {
    console.error('Supabase List Files Error:', error);
    throw new Error(getErrorMessage(error));
  }

  return (data || []).map(file => ({
    name: file.name,
    path: file.id, // Supabase list returns 'id' as the path
    url: supabase.storage.from(SHARED_FILES_BUCKET).getPublicUrl(file.name).data.publicUrl,
    size: file.metadata?.size,
    createdAt: file.created_at,
  }));
};

export const deleteSharedFile = async (filePath: string): Promise<void> => {
  const { error } = await supabase.storage
    .from(SHARED_FILES_BUCKET)
    .remove([filePath]);

  if (error) {
    console.error('Supabase Delete File Error:', error);
    throw new Error(getErrorMessage(error));
  }
};

export const seedInitialData = async () => {
  // No-op
};