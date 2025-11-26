"use client";

import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable'; // Importar autoTable como una función
import { Download, Loader2 } from 'lucide-react';
import { Book, BookStatus } from '../../types'; // Ruta corregida
import { showError, showSuccess } from '../utils/toast';

interface ExportPdfButtonProps {
  books: Book[];
}

const ExportPdfButton: React.FC<ExportPdfButtonProps> = ({ books }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF();

      doc.setFontSize(22);
      doc.text("Resumen de Libros Terminados", 14, 20);
      doc.setFontSize(12);
      doc.text(`Fecha de Exportación: ${new Date().toLocaleDateString()}`, 14, 28);

      let yOffset = 40;

      const finishedBooks = books.filter(b => b.status === BookStatus.TERMINADO);

      if (finishedBooks.length === 0) {
        showError("No hay libros terminados para exportar.");
        setIsExporting(false);
        return;
      }

      // Group books by rating
      const booksByRating: Record<number, Book[]> = { 5: [], 4: [], 3: [], 2: [], 1: [] };
      const unratedBooks: Book[] = [];

      finishedBooks.forEach(book => {
        if (book.rating && book.rating >= 1 && book.rating <= 5) {
          booksByRating[book.rating].push(book);
        } else {
          unratedBooks.push(book);
        }
      });

      // Add sections for each rating
      for (let rating = 5; rating >= 1; rating--) {
        const ratedBooks = booksByRating[rating];
        if (ratedBooks.length > 0) {
          if (yOffset + 10 > doc.internal.pageSize.height - 20) { // Check if new page is needed
            doc.addPage();
            yOffset = 20;
          }
          doc.setFontSize(16);
          doc.text(`${rating} Estrella${rating > 1 ? 's' : ''} (${ratedBooks.length} libros)`, 14, yOffset);
          yOffset += 7;

          const tableResult = autoTable(doc, { // Llamar autoTable como función y capturar el resultado
            startY: yOffset,
            head: [['Título', 'Autor', 'Páginas', 'Género', 'Fecha Fin']],
            body: ratedBooks.map(book => [
              book.title,
              book.author,
              book.totalPages,
              book.genre,
              book.finishDate || 'N/A'
            ]),
            styles: { fontSize: 10, cellPadding: 2, overflow: 'linebreak' },
            headStyles: { fillColor: '#b5763e', textColor: '#ffffff' },
            alternateRowStyles: { fillColor: '#fcfaf8' },
            margin: { left: 14, right: 14 },
            didDrawPage: (data: any) => {
              // Footer
              let str = "Página " + doc.internal.getNumberOfPages();
              doc.setFontSize(10);
              doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 10);
            }
          });
          yOffset = tableResult.finalY + 10; // Acceder a finalY desde el objeto retornado
        }
      }

      // Add section for unrated books
      if (unratedBooks.length > 0) {
        if (yOffset + 10 > doc.internal.pageSize.height - 20) {
          doc.addPage();
          yOffset = 20;
        }
        doc.setFontSize(16);
        doc.text(`Sin Calificación (${unratedBooks.length} libros)`, 14, yOffset);
        yOffset += 7;

        autoTable(doc, { // Llamar autoTable como función
          startY: yOffset,
          head: [['Título', 'Autor', 'Páginas', 'Género', 'Fecha Fin']],
          body: unratedBooks.map(book => [
            book.title,
            book.author,
            book.totalPages,
            book.genre,
            book.finishDate || 'N/A'
          ]),
          styles: { fontSize: 10, cellPadding: 2, overflow: 'linebreak' },
          headStyles: { fillColor: '#b5763e', textColor: '#ffffff' },
          alternateRowStyles: { fillColor: '#fcfaf8' },
          margin: { left: 14, right: 14 },
          didDrawPage: (data: any) => {
            let str = "Página " + doc.internal.getNumberOfPages();
            doc.setFontSize(10);
            doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 10);
          }
        });
      }

      doc.save('libros_terminados_calificaciones.pdf');
      showSuccess("PDF exportado correctamente.");
    } catch (error: any) {
      console.error("Error al exportar PDF:", error);
      showError(`Error al exportar PDF: ${error.message || 'Error desconocido'}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExportPdf}
      disabled={isExporting}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white shadow-md hover:bg-blue-700 transition-colors text-sm font-medium"
    >
      {isExporting ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
      {isExporting ? 'Exportando...' : 'Exportar a PDF'}
    </button>
  );
};

export default ExportPdfButton;