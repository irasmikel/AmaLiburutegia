"use client";

import { useState, useEffect, useCallback } from 'react';
import { Book, UserProfile, BookStatus } from '../types';
import * as DataService from '../services/dataService';
import { showSuccess, showError, showConfirmation } from '../src/utils/toast';

interface UseBooksResult {
  books: Book[];
  loading: boolean;
  errorMsg: string | null;
  setupRequired: boolean;
  refreshBooks: () => Promise<void>;
  handleSaveBook: (bookData: Book | Omit<Book, 'id' | 'createdAt'>) => Promise<void>;
  handleDeleteBook: (id: string) => Promise<void>;
  handleUpdateProgress: (book: Book, newPage: number) => Promise<void>;
}

export const useBooks = (userId: UserProfile | null): UseBooksResult => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [setupRequired, setSetupRequired] = useState(false);

  const fetchBooks = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setErrorMsg(null);
    setSetupRequired(false);

    try {
      const data = await DataService.getBooks(userId);
      setBooks(data);
    } catch (err: any) {
      console.error('Error fetching books:', err);
      const msg = err.message || JSON.stringify(err);
      if (msg.includes('relation "public.books" does not exist') || msg.includes('42P01')) {
        setSetupRequired(true);
      } else {
        setErrorMsg(`Error de conexión: ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

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
      await fetchBooks();
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
          await fetchBooks();
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
    if (newPage >= book.totalPages) {
      newStatus = BookStatus.TERMINADO;
    } else if (newPage > 0) {
      newStatus = BookStatus.LEYENDO;
    }

    const updatedBook = { ...book, currentPage: newPage, status: newStatus };
    try {
      await DataService.updateBook(updatedBook);
      await fetchBooks();
      showSuccess('Progreso actualizado correctamente.');
    } catch (err: any) {
      showError(`No se pudo actualizar el progreso: ${err.message}`);
    }
  };

  return {
    books,
    loading,
    errorMsg,
    setupRequired,
    refreshBooks: fetchBooks,
    handleSaveBook,
    handleDeleteBook,
    handleUpdateProgress,
  };
};