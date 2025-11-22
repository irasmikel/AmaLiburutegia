export enum UserProfile {
  MAIXUX = 'Maixux',
  ARANTXA = 'Arantxa'
}

export enum BookStatus {
  POR_LEER = 'POR_LEER',
  LEYENDO = 'LEYENDO',
  TERMINADO = 'TERMINADO'
}

export interface Book {
  id: string;
  userId: UserProfile;
  title: string;
  author: string;
  totalPages: number;
  currentPage: number;
  genre: string;
  status: BookStatus;
  coverUrl?: string;
  notes?: string;
  year?: number;
  rating?: number; // 1-5
  review?: string;
  startDate?: string;
  finishDate?: string;
  createdAt: string;
}

export interface StatData {
  totalBooks: number;
  totalPages: number;
  readingCount: number;
  toReadCount: number;
  avgPages: number;
  streakDays: number;
  genreDistribution: { name: string; value: number }[];
  monthlyProgress: { name: string; count: number }[];
  topAuthors: { name: string; count: number }[];
}
