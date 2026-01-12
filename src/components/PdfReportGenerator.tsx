"use client";

import React from 'react';
import { Book, BookStatus } from '../../types';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { FileText } from 'lucide-react';

interface PdfReportGeneratorProps {
  books: Book[];
  selectedYear: number | 'ALL';
}

const PdfReportGenerator: React.FC<PdfReportGeneratorProps> = ({ books, selectedYear }) => {
  const generatePdf = () => {
    const doc = new jsPDF();

    const filteredBooks = selectedYear === 'ALL'
      ? books
      : books.filter(book => {
          const finishYear = book.finishDate ? new Date(book.finishDate).getFullYear() : null;
          return finishYear === selectedYear;
        });

    const finishedBooks = filteredBooks.filter(b => b.status === BookStatus.TERMINADO);

    if (finishedBooks.length === 0) {
      alert(`No hay libros terminados para ${selectedYear === 'ALL' ? 'todos los años' : `el año ${selectedYear}`} para generar el informe.`);
      return;
    }

    const title = `Informe de Libros Terminados ${selectedYear === 'ALL' ? '(Total)' : `(${selectedYear})`}`;
    doc.setFontSize(18);
    doc.text(title, 14, 22);

    const tableColumn = ["Título", "Autor", "Género", "Páginas", "Año", "Valoración", "Fecha Fin", "Notas"];
    const tableRows: any[] = [];

    finishedBooks.forEach(book => {
      const bookData = [
        book.title,
        book.author,
        book.genre || 'N/A',
        book.totalPages,
        book.year || 'N/A',
        book.rating ? `${book.rating}/5` : 'N/A',
        book.finishDate || 'N/A',
        book.notes || 'Sin notas',
      ];
      tableRows.push(bookData);
    });

    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
      headStyles: { fillColor: '#b5763e', textColor: '#ffffff', fontStyle: 'bold' },
      alternateRowStyles: { fillColor: '#f5f0eb' },
      margin: { top: 10 },
    });

    doc.save(`Informe_Libros_Terminados_${selectedYear}.pdf`);
  };

  return (
    <button
      onClick={generatePdf}
      className="px-4 py-2 bg-earth-600 text-white rounded-lg font-medium shadow-md hover:bg-earth-700 transition-all flex items-center justify-center gap-2"
    >
      <FileText size={18} />
      Generar PDF
    </button>
  );
};

export default PdfReportGenerator;