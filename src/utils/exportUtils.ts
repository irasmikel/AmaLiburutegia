import { Book } from '../../types';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Helper to format dates for export
const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
  } catch (e) {
    return dateString; // Return original if invalid
  }
};

// Helper to get user-friendly headers
const getExportHeaders = () => [
  'Título',
  'Autor',
  'Género',
  'Páginas Totales',
  'Página Actual',
  'Estado',
  'Año',
  'Valoración',
  'Notas/Reseña',
  'Fecha Inicio',
  'Fecha Fin',
  'Fecha Añadido',
];

// Helper to map book data to rows for export
const mapBookToExportRow = (book: Book) => [
  book.title,
  book.author,
  book.genre,
  book.totalPages,
  book.currentPage,
  book.status === 'POR_LEER' ? 'Por Leer' : 'Terminado',
  book.year || '',
  book.rating || '',
  book.notes || '',
  formatDate(book.startDate),
  formatDate(book.finishDate),
  formatDate(book.createdAt),
];

export const exportToCsv = (data: Book[], filename: string = 'libros_exportados') => {
  if (data.length === 0) {
    console.warn('No hay datos para exportar a CSV.');
    return;
  }

  const headers = getExportHeaders();
  const rows = data.map(mapBookToExportRow);

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Libros');
  XLSX.writeFile(wb, `${filename}.csv`);
};

export const exportToPdf = (data: Book[], filename: string = 'libros_exportados') => {
  if (data.length === 0) {
    console.warn('No hay datos para exportar a PDF.');
    return;
  }

  const doc = new jsPDF();
  doc.setFontSize(12);
  doc.text('Reporte de Libros', 14, 15);

  (doc as any).autoTable({
    startY: 20,
    head: [getExportHeaders()],
    body: data.map(mapBookToExportRow),
    theme: 'striped',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      valign: 'middle',
      halign: 'left',
    },
    headStyles: {
      fillColor: '#b5763e', // Earthy tone
      textColor: '#ffffff',
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: '#fcfaf8', // Earthy light
    },
    bodyStyles: {
      textColor: '#4a4a4a',
    },
    columnStyles: {
      0: { cellWidth: 30 }, // Title
      1: { cellWidth: 25 }, // Author
      2: { cellWidth: 20 }, // Genre
      3: { cellWidth: 15 }, // Total Pages
      4: { cellWidth: 15 }, // Current Page
      5: { cellWidth: 15 }, // Status
      6: { cellWidth: 10 }, // Year
      7: { cellWidth: 10 }, // Rating
      8: { cellWidth: 30 }, // Notes
      9: { cellWidth: 18 }, // Start Date
      10: { cellWidth: 18 }, // Finish Date
      11: { cellWidth: 18 }, // Created At
    },
  });

  doc.save(`${filename}.pdf`);
};