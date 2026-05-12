"use client";

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Book, BookStatus, UserProfile } from '../../types';

export const generateBooksReport = (
  user: UserProfile, 
  books: Book[], 
  options: { year: number | 'ALL', includeNotes: boolean }
) => {
  const doc = new jsPDF();
  const date = new Date().toLocaleDateString();
  const { year, includeNotes } = options;

  // Filtrar libros por año si no es 'ALL'
  const filteredBooks = year === 'ALL' 
    ? books 
    : books.filter(b => {
        const finishYear = b.finishDate ? new Date(b.finishDate).getFullYear() : null;
        const creationYear = b.createdAt ? new Date(b.createdAt).getFullYear() : null;
        return finishYear === year || creationYear === year;
      });

  const primaryColor = [181, 118, 62]; // #b5763e
  
  doc.setFontSize(22);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('Liburutegia - Informe de Lectura', 14, 20);
  
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(`Usuario: ${user}`, 14, 30);
  doc.text(`Periodo: ${year === 'ALL' ? 'Todos los años' : year}`, 14, 37);
  doc.text(`Fecha del informe: ${date}`, 14, 44);
  
  const finished = filteredBooks.filter(b => b.status === BookStatus.TERMINADO).length;
  const pending = filteredBooks.filter(b => b.status === BookStatus.POR_LEER).length;
  
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text('Resumen de Biblioteca', 14, 55);
  doc.setFontSize(11);
  doc.text(`Total de libros: ${filteredBooks.length}`, 14, 63);
  doc.text(`Libros terminados: ${finished}`, 14, 70);
  doc.text(`Libros pendientes: ${pending}`, 14, 77);

  // Configurar columnas de la tabla
  const tableColumn = ["Título", "Autor", "Género", "Estado", "Calificación"];
  if (includeNotes) tableColumn.push("Notas/Reseña");
  else tableColumn.push("Fecha Fin");

  const tableRows = filteredBooks.map(book => {
    const row = [
      book.title,
      book.author,
      book.genre || '-',
      book.status === BookStatus.TERMINADO ? 'Terminado' : 'Pendiente',
      book.rating ? `${book.rating}/5` : '-',
    ];
    if (includeNotes) row.push(book.notes || '-');
    else row.push(book.finishDate ? new Date(book.finishDate).toLocaleDateString() : '-');
    return row;
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 85,
    theme: 'striped',
    headStyles: { fillColor: primaryColor as any },
    styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 30 },
      5: { cellWidth: includeNotes ? 60 : 25 }
    }
  });

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  doc.save(`Informe_Liburutegia_${user}_${year}_${includeNotes ? 'Largo' : 'Corto'}.pdf`);
};