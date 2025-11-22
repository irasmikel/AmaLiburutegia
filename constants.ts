import { BookStatus } from './types';

export const GENRES = [
  'Ficción',
  'No Ficción',
  'Romance',
  'Thriller',
  'Historia',
  'Biografía',
  'Fantasía',
  'Ciencia Ficción',
  'Clásicos',
  'Autoayuda',
  'Misterio',
  'Poesía',
  'Otro'
];

export const STATUS_LABELS: Record<BookStatus, string> = {
  [BookStatus.POR_LEER]: 'Por Leer',
  [BookStatus.LEYENDO]: 'Leyendo',
  [BookStatus.TERMINADO]: 'Terminado'
};

export const STATUS_COLORS: Record<BookStatus, string> = {
  [BookStatus.POR_LEER]: 'bg-amber-100 text-amber-800 border-amber-200',
  [BookStatus.LEYENDO]: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  [BookStatus.TERMINADO]: 'bg-slate-200 text-slate-700 border-slate-300'
};
