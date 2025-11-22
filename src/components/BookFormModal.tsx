"use client";

import React from 'react';
import { Book, UserProfile } from '../../types';
import BookForm from '../../components/BookForm'; // BookForm is in the root components folder

interface BookFormModalProps {
  userId: UserProfile;
  isOpen: boolean;
  initialData?: Book;
  onClose: () => void;
  onSave: (book: Omit<Book, 'id' | 'createdAt'> | Book) => void;
}

const BookFormModal: React.FC<BookFormModalProps> = ({
  userId,
  isOpen,
  initialData,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  return (
    <BookForm
      userId={userId}
      initialData={initialData}
      onClose={onClose}
      onSave={onSave}
    />
  );
};

export default BookFormModal;