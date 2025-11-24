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
  // New fields for fun facts
  totalLengthMeters: number;
  continuousReadingDays: number;
  favoriteGenreName: string;
  favoriteGenrePercentage: number;
  monthlyComparisonPercentage: number;
  // New fields for general statistics
  totalBooksFinishedCurrentYear: number;
  daysSinceLastFinishedBook: number | null;
  mostProductiveMonth: string;
  avgPagesPerMonth: number;
  avgPagesPerDay: number;
  avgDaysPerBookFinished: number | null; // "Lees un libro cada X días de media"
  uniqueAuthorsCount: number; // "Has viajado por X países a través de tus autores" (simplified)
  longestBookPages: number | null;
  shortestBookPages: number | null;
  pageDifferenceLongShort: number | null;
  avgPagesPerBookFinished: number;
  bestMonthName: string;
  bestMonthBooks: number;
  worstMonthName: string;
  worstMonthBooks: number;
  longestTimeWithoutFinishingBookDays: number | null;
  recordBooksInMonth: number; // "Tu récord: X libros en un mes"
  paceImprovementPercentage: number | null; // "Has mejorado tu ritmo un X% respecto al año pasado"
  totalBooksFinishedPreviousYear: number; // Helper for pace improvement
  randomFact: string; // For "Sabías que..."
}

export interface SharedFile {
  name: string;
  path: string;
  url: string;
  size?: number;
  createdAt?: string;
}