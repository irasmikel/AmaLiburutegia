"use client";

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Book, BookStatus, UserProfile } from '../../types';

export const generateBooksReport = (user: UserProfile, books: Book[]) => {
  const doc = new jsPDF();
  const date = new Date().toLocaleDateString();

  // Configuración de fuentes y colores
  const primaryColor = [181, 118, 62]; // #b5763e (Earthy brown)
  
  // Título
  doc.setFontSize(22);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('Liburutegia - Informe de Lectura', 14, 20);
  
  // Subtítulo e información general
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(`Usuario: ${user}`, 14, 30);
  doc.text(`Fecha del informe: ${date}`, 14, 37);
  
  // Estadísticas rápidas
  const finished = books.filter(b => b.status === BookStatus.TERMINADO).length;
  const pending = books.filter(b => b.status === BookStatus.POR_LEER).length;
  
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text('Resumen de Biblioteca', 14, 50);
  doc.setFontSize(11);
  doc.text(`Total de libros: ${books.length}`, 14, 58);
  doc.text(`Libros terminados: ${finished}`, 14, 65);
  doc.text(`Libros pendientes: ${pending}`, 14, 72);

  // Tabla de libros
  const tableColumn = ["Título", "Autor", "Género", "Estado", "Calificación", "Fecha Fin"];
  const tableRows = books.map(book => [
    book.title,
    book.author,
    book.genre || '-',
    book.status === BookStatus.TERMINADO ? 'Terminado' : 'Pendiente',
    book.rating ? `${book.rating}/5` : '-',
    book.finishDate ? new Date(book.finishDate).toLocaleDateString() : '-'
  ]);

  (doc as any).autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 85,
    theme: 'striped',
    headStyles: { fillColor: primaryColor },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 40 },
    }
  });

  // Pie de página
  const pageCount = (doc as any).internal.getNumberOfPages();
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

  // Descargar el PDF
  doc.save(`Informe_Liburutegia_${user}_${date.replace(/\//g, '-')}.pdf`);
};