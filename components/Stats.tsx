import React, { useState, useEffect, useMemo } from 'react';
import { Book, BookStatus, StatData } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid } from 'recharts';
import { Trophy, BookOpen, Layers, Clock, Users, Lightbulb, CalendarDays, BookCheck, TrendingUp, Globe, BookMarked, Award } from 'lucide-react'; // Added new icons

interface StatsProps {
  books: Book[];
}

const Stats: React.FC<StatsProps> = ({ books }) => {
  const [randomFact, setRandomFact] = useState('');

  const calculateStats = (): StatData => {
    const finishedBooks = books.filter(b => b.status === BookStatus.TERMINADO);
    const readingBooks = books.filter(b => b.status === BookStatus.LEYENDO);
    const toReadBooks = books.filter(b => b.status === BookStatus.POR_LEER);

    const totalPagesFinished = finishedBooks.reduce((acc, curr) => acc + curr.totalPages, 0);
    const totalPagesReading = readingBooks.reduce((acc, curr) => acc + (curr.currentPage || 0), 0);
    const totalPagesOverall = books.reduce((acc, curr) => acc + curr.totalPages, 0); // Total pages of all books (including unfinished)

    // Genre Distribution
    const genreMap = new Map<string, number>();
    books.forEach(b => {
        if (b.genre) {
            genreMap.set(b.genre, (genreMap.get(b.genre) || 0) + 1);
        }
    });
    const genreDistribution = Array.from(genreMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5); // Top 5 genres

    // Top Authors
    const authorMap = new Map<string, number>();
    finishedBooks.forEach(b => {
        if (b.author) {
            authorMap.set(b.author, (authorMap.get(b.author) || 0) + 1);
        }
    });
    const topAuthors = Array.from(authorMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Top 5 authors

    // Monthly Progress (Books finished per month for the last 12 months)
    const monthlyCounts = new Map<string, number>();
    const now = new Date();
    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

    // Initialize for last 12 months
    for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthYear = `${monthNames[d.getMonth()]} ${d.getFullYear() % 100}`; // e.g., "Oct 23"
        monthlyCounts.set(monthYear, 0);
    }

    finishedBooks.forEach(b => {
        if (b.finishDate) {
            const finishDate = new Date(b.finishDate);
            const monthYear = `${monthNames[finishDate.getMonth()]} ${finishDate.getFullYear() % 100}`;
            if (monthlyCounts.has(monthYear)) { // Only count if within the last 12 months initialized
                monthlyCounts.set(monthYear, monthlyCounts.get(monthYear)! + 1);
            }
        }
    });

    // Sort monthly progress to be chronological
    const monthlyProgress = Array.from(monthlyCounts.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => {
            const [monthA, yearA] = a.name.split(' ');
            const [monthB, yearB] = b.name.split(' ');
            const dateA = new Date(`01 ${monthA} ${yearA}`);
            const dateB = new Date(`01 ${monthB} ${yearB}`);
            return dateA.getTime() - dateB.getTime();
        });

    // --- Datos Curiosos Calculations ---
    const totalBooksInLibrary = books.length;

    // 1. "Si pusieras todos los libros en fila medirían X metros"
    const pageThicknessMm = 0.1; // Average thickness per page
    const totalLengthMeters = (totalPagesOverall * pageThicknessMm) / 1000; // Convert mm to meters

    // 2. "Has leído el equivalente a X días de lectura continua"
    const readingSpeedPagesPerHour = 40; // Average reading speed
    const totalReadingHours = totalPagesOverall / readingSpeedPagesPerHour;
    const continuousReadingDays = totalReadingHours / 24;

    // 3. "Tu categoría favorita representa X% de tu biblioteca"
    let favoriteGenreName = 'N/A';
    let favoriteGenrePercentage = 0;
    if (genreDistribution.length > 0 && totalBooksInLibrary > 0) {
        const topGenre = genreDistribution[0]; // Already sorted by value
        favoriteGenreName = topGenre.name;
        favoriteGenrePercentage = (topGenre.value / totalBooksInLibrary) * 100;
    }

    // 4. "Este mes leíste un X% más que el anterior"
    let monthlyComparisonPercentage = 0;
    if (monthlyProgress.length >= 2) {
        const currentMonthCount = monthlyProgress[monthlyProgress.length - 1].count;
        const previousMonthCount = monthlyProgress[monthlyProgress.length - 2].count;

        if (previousMonthCount > 0) {
            monthlyComparisonPercentage = ((currentMonthCount - previousMonthCount) / previousMonthCount) * 100;
        } else if (currentMonthCount > 0) { // Read something this month, nothing last month
            monthlyComparisonPercentage = 100; 
        }
    } else if (monthlyProgress.length === 1 && monthlyProgress[0].count > 0) {
        monthlyComparisonPercentage = 100; // Only one month, and books were read
    }

    // --- General Statistics Calculations ---
    const currentYear = now.getFullYear();
    const totalBooksFinishedCurrentYear = finishedBooks.filter(b => 
      b.finishDate && new Date(b.finishDate).getFullYear() === currentYear
    ).length;

    const totalBooksFinishedPreviousYear = finishedBooks.filter(b => 
      b.finishDate && new Date(b.finishDate).getFullYear() === currentYear - 1
    ).length;

    let avgPagesPerMonth = 0;
    let avgPagesPerDay = 0;
    let daysSinceFirstBook = 0;

    if (books.length > 0) {
      const firstBookDate = new Date(books.reduce((min, b) => new Date(b.createdAt) < new Date(min) ? b.createdAt : min, books[0].createdAt));
      const diffTime = Math.abs(now.getTime() - firstBookDate.getTime());
      daysSinceFirstBook = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const monthsSinceFirstBook = daysSinceFirstBook / 30.44; // Average days in a month

      if (monthsSinceFirstBook > 0) {
        avgPagesPerMonth = totalPagesFinished / monthsSinceFirstBook;
      }
      if (daysSinceFirstBook > 0) {
        avgPagesPerDay = totalPagesFinished / daysSinceFirstBook;
      }
    }

    let daysSinceLastFinishedBook: number | null = null;
    if (finishedBooks.length > 0) {
      const latestFinishDate = finishedBooks.reduce((maxDate, b) => 
        (b.finishDate && new Date(b.finishDate) > new Date(maxDate)) ? b.finishDate : maxDate, 
        finishedBooks[0].finishDate || new Date(0).toISOString()
      );
      if (latestFinishDate) {
        const diffTime = Math.abs(now.getTime() - new Date(latestFinishDate).getTime());
        daysSinceLastFinishedBook = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      }
    }

    let mostProductiveMonth = 'N/A';
    let bestMonthName = 'N/A';
    let bestMonthBooks = 0;
    let worstMonthName = 'N/A';
    let worstMonthBooks = Infinity;

    if (monthlyProgress.length > 0) {
      const mostProductive = monthlyProgress.reduce((max, current) => (current.count > max.count ? current : max), monthlyProgress[0]);
      bestMonthName = mostProductive.name;
      bestMonthBooks = mostProductive.count;
      mostProductiveMonth = mostProductive.name; // For backward compatibility with existing field

      const leastProductive = monthlyProgress.reduce((min, current) => (current.count < min.count ? current : min), monthlyProgress[0]);
      worstMonthName = leastProductive.name;
      worstMonthBooks = leastProductive.count;
    }

    // "Lees un libro cada X días de media"
    const avgDaysPerBookFinished = finishedBooks.length > 0 && daysSinceFirstBook > 0 
      ? daysSinceFirstBook / finishedBooks.length 
      : null;

    // "Has viajado por X países a través de tus autores" (simplified to unique authors)
    const uniqueAuthors = new Set(books.map(b => b.author).filter(Boolean));
    const uniqueAuthorsCount = uniqueAuthors.size;

    // "El libro más largo que leíste tenía X páginas, el más corto Y páginas"
    const longestBookPages = finishedBooks.length > 0 
      ? Math.max(...finishedBooks.map(b => b.totalPages)) 
      : null;
    const shortestBookPages = finishedBooks.length > 0 
      ? Math.min(...finishedBooks.map(b => b.totalPages)) 
      : null;
    const pageDifferenceLongShort = (longestBookPages !== null && shortestBookPages !== null)
      ? longestBookPages - shortestBookPages
      : null;

    // "Páginas promedio por libro: X páginas"
    const avgPagesPerBookFinished = finishedBooks.length > 0 
      ? totalPagesFinished / finishedBooks.length 
      : 0;

    // "Racha más larga sin terminar un libro: X días"
    let longestTimeWithoutFinishingBookDays: number | null = null;
    if (finishedBooks.length > 1) {
        const sortedFinishDates = finishedBooks
            .filter(b => b.finishDate)
            .map(b => new Date(b.finishDate!))
            .sort((a, b) => a.getTime() - b.getTime());

        let maxGap = 0;
        for (let i = 1; i < sortedFinishDates.length; i++) {
            const diffTime = Math.abs(sortedFinishDates[i].getTime() - sortedFinishDates[i-1].getTime());
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays > maxGap) {
                maxGap = diffDays;
            }
        }
        longestTimeWithoutFinishingBookDays = maxGap;
    } else if (finishedBooks.length === 1 && daysSinceFirstBook > 0) {
        // If only one book finished, the "gap" is from the start of tracking to that book
        longestTimeWithoutFinishingBookDays = daysSinceFirstBook;
    }


    // "Tu récord: X libros en un mes" (simplified from week)
    const recordBooksInMonth = monthlyProgress.length > 0 
      ? Math.max(...monthlyProgress.map(m => m.count)) 
      : 0;

    // "Has mejorado tu ritmo un X% respecto al año pasado"
    let paceImprovementPercentage: number | null = null;
    if (totalBooksFinishedPreviousYear > 0) {
        paceImprovementPercentage = ((totalBooksFinishedCurrentYear - totalBooksFinishedPreviousYear) / totalBooksFinishedPreviousYear) * 100;
    } else if (totalBooksFinishedCurrentYear > 0) {
        paceImprovementPercentage = 100; // Read books this year, none last year
    }

    return {
      totalBooks: finishedBooks.length,
      totalPages: totalPagesFinished + totalPagesReading, // Only finished + current reading pages
      readingCount: readingBooks.length,
      toReadCount: toReadBooks.length,
      avgPages: finishedBooks.length > 0 ? Math.round(totalPagesFinished / finishedBooks.length) : 0,
      streakDays: readingBooks.length > 0 ? 5 : 0, // Mock streak, could be calculated with finishDate
      genreDistribution,
      monthlyProgress,
      topAuthors,
      // New fun facts
      totalLengthMeters,
      continuousReadingDays,
      favoriteGenreName,
      favoriteGenrePercentage,
      monthlyComparisonPercentage,
      // New general statistics
      totalBooksFinishedCurrentYear,
      daysSinceLastFinishedBook,
      mostProductiveMonth,
      avgPagesPerMonth,
      avgPagesPerDay,
      avgDaysPerBookFinished,
      uniqueAuthorsCount,
      longestBookPages,
      shortestBookPages,
      pageDifferenceLongShort,
      avgPagesPerBookFinished,
      bestMonthName,
      bestMonthBooks,
      worstMonthName,
      worstMonthBooks,
      longestTimeWithoutFinishingBookDays,
      recordBooksInMonth,
      paceImprovementPercentage,
      totalBooksFinishedPreviousYear,
      randomFact: '', // Will be set by useEffect
    };
  };

  const stats = useMemo(() => calculateStats(), [books]);
  const COLORS = ['#b5763e', '#c28e50', '#d1aa78', '#e0c7a8', '#ede0d4']; // Earthy tones

  // "Sabías que..." facts
  const funFactsList = useMemo(() => [
    `Sabías que has leído un total de ${stats.totalBooks} libros. ¡Impresionante!`,
    `Tu género favorito es "${stats.favoriteGenreName}", representando el ${stats.favoriteGenrePercentage.toFixed(1)}% de tu biblioteca.`,
    stats.longestBookPages ? `El libro más largo que has leído tenía ${stats.longestBookPages} páginas.` : null,
    stats.shortestBookPages ? `El libro más corto que has leído tenía ${stats.shortestBookPages} páginas.` : null,
    stats.avgPagesPerBookFinished ? `En promedio, cada libro que terminas tiene ${stats.avgPagesPerBookFinished.toFixed(0)} páginas.` : null,
    stats.bestMonthName !== 'N/A' ? `Tu mes más productivo fue ${stats.bestMonthName}, donde terminaste ${stats.bestMonthBooks} libros.` : null,
    stats.recordBooksInMonth > 0 ? `Tu récord de libros terminados en un mes es de ${stats.recordBooksInMonth}.` : null,
    stats.uniqueAuthorsCount > 0 ? `Has descubierto ${stats.uniqueAuthorsCount} autores únicos en tu viaje literario.` : null,
    stats.avgDaysPerBookFinished ? `Lees un libro cada ${stats.avgDaysPerBookFinished.toFixed(1)} días de media.` : null,
    stats.longestTimeWithoutFinishingBookDays !== null ? `Tu racha más larga sin terminar un libro fue de ${stats.longestTimeWithoutFinishingBookDays} días.` : null,
  ].filter(Boolean) as string[], [stats]);

  useEffect(() => {
    if (funFactsList.length > 0) {
      const randomIndex = Math.floor(Math.random() * funFactsList.length);
      setRandomFact(funFactsList[randomIndex]);
    }
  }, [funFactsList]);


  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* Top Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-stone-100 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-stone-500 text-sm font-medium">Libros Leídos</p>
                <p className="text-3xl font-bold text-stone-800">{stats.totalBooks}</p>
            </div>
            <div className="p-3 bg-amber-100 text-amber-600 rounded-full">
                <Trophy size={24} />
            </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-stone-100 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-stone-500 text-sm font-medium">Páginas</p>
                <p className="text-3xl font-bold text-stone-800">{stats.totalPages.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-stone-100 text-stone-600 rounded-full">
                <Layers size={24} />
            </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-stone-100 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-stone-500 text-sm font-medium">Leyendo</p>
                <p className="text-3xl font-bold text-stone-800">{stats.readingCount}</p>
            </div>
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full">
                <BookOpen size={24} />
            </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-stone-100 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-stone-500 text-sm font-medium">Pendientes</p>
                <p className="text-3xl font-bold text-stone-800">{stats.toReadCount}</p>
            </div>
            <div className="p-3 bg-orange-100 text-orange-600 rounded-full">
                <Clock size={24} />
            </div>
        </div>
      </div>

      {/* Sabías que... */}
      {randomFact && (
        <div className="bg-gradient-to-r from-earth-600 to-earth-500 rounded-2xl p-6 text-white shadow-lg flex items-center gap-4">
          <Lightbulb size={28} className="flex-shrink-0" />
          <p className="text-lg font-medium">{randomFact}</p>
        </div>
      )}

      {/* General Statistics */}
      <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm">
        <h3 className="text-lg font-bold text-stone-800 mb-6 flex items-center gap-2">
          <BookCheck size={20} className="text-earth-600" /> Estadísticas Generales
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-stone-700">
          <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
            <Trophy size={20} className="text-amber-500" />
            <div>
              <p className="text-sm font-medium">Libros Leídos (Año Actual)</p>
              <p className="font-bold text-lg">{stats.totalBooksFinishedCurrentYear}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
            <Clock size={20} className="text-purple-500" />
            <div>
              <p className="text-sm font-medium">Días desde último libro</p>
              <p className="font-bold text-lg">{stats.daysSinceLastFinishedBook !== null ? stats.daysSinceLastFinishedBook : 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
            <CalendarDays size={20} className="text-red-500" />
            <div>
              <p className="text-sm font-medium">Mes más productivo</p>
              <p className="font-bold text-lg">{stats.mostProductiveMonth}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
            <Layers size={20} className="text-orange-500" />
            <div>
              <p className="text-sm font-medium">Páginas/Mes</p>
              <p className="font-bold text-lg">{stats.avgPagesPerMonth.toFixed(0)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
            <Layers size={20} className="text-cyan-500" />
            <div>
              <p className="text-sm font-medium">Páginas/Día</p>
              <p className="font-bold text-lg">{stats.avgPagesPerDay.toFixed(0)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
            <BookMarked size={20} className="text-green-500" />
            <div>
              <p className="text-sm font-medium">Páginas promedio por libro</p>
              <p className="font-bold text-lg">{stats.avgPagesPerBookFinished.toFixed(0)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
            <Clock size={20} className="text-indigo-500" />
            <div>
              <p className="text-sm font-medium">Libro cada</p>
              <p className="font-bold text-lg">{stats.avgDaysPerBookFinished !== null ? `${stats.avgDaysPerBookFinished.toFixed(1)} días` : 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
            <Globe size={20} className="text-blue-500" />
            <div>
              <p className="text-sm font-medium">Autores únicos</p>
              <p className="font-bold text-lg">{stats.uniqueAuthorsCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Datos Curiosos */}
      <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm">
        <h3 className="text-lg font-bold text-stone-800 mb-6 flex items-center gap-2">
          <Lightbulb size={20} className="text-earth-600" /> Más Datos Curiosos
        </h3>
        <ul className="space-y-3 text-stone-700">
          <li>
            <span className="font-medium">Si pusieras todos tus libros en fila:</span> medirían <span className="font-bold text-earth-700">{stats.totalLengthMeters.toFixed(2)}</span> metros.
          </li>
          <li>
            <span className="font-medium">Has leído el equivalente a:</span> <span className="font-bold text-earth-700">{stats.continuousReadingDays.toFixed(1)}</span> días de lectura continua.
          </li>
          <li>
            <span className="font-medium">Tu categoría favorita ({stats.favoriteGenreName}):</span> representa un <span className="font-bold text-earth-700">{stats.favoriteGenrePercentage.toFixed(1)}%</span> de tu biblioteca.
          </li>
          <li>
            <span className="font-medium">Comparado con el mes anterior:</span> este mes leíste un <span className="font-bold text-earth-700">{stats.monthlyComparisonPercentage >= 0 ? '+' : ''}{stats.monthlyComparisonPercentage.toFixed(1)}%</span>.
          </li>
          {stats.longestBookPages && (
            <li>
              <span className="font-medium">El libro más largo que leíste:</span> tenía <span className="font-bold text-earth-700">{stats.longestBookPages}</span> páginas.
            </li>
          )}
          {stats.shortestBookPages && (
            <li>
              <span className="font-medium">El libro más corto que leíste:</span> tenía <span className="font-bold text-earth-700">{stats.shortestBookPages}</span> páginas.
            </li>
          )}
          {stats.pageDifferenceLongShort !== null && (
            <li>
              <span className="font-medium">Diferencia entre tu libro más largo y corto:</span> <span className="font-bold text-earth-700">{stats.pageDifferenceLongShort}</span> páginas.
            </li>
          )}
          {stats.worstMonthName !== 'N/A' && (
            <li>
              <span className="font-medium">Tu peor mes:</span> <span className="font-bold text-earth-700">{stats.worstMonthBooks}</span> libros en <span className="font-bold text-earth-700">{stats.worstMonthName}</span> (¡pero seguiste leyendo!).
            </li>
          )}
          {stats.longestTimeWithoutFinishingBookDays !== null && (
            <li>
              <span className="font-medium">Racha más larga sin terminar un libro:</span> <span className="font-bold text-earth-700">{stats.longestTimeWithoutFinishingBookDays}</span> días.
            </li>
          )}
          {stats.recordBooksInMonth > 0 && (
            <li>
              <span className="font-medium">Tu récord:</span> <span className="font-bold text-earth-700">{stats.recordBooksInMonth}</span> libros en un mes.
            </li>
          )}
          {stats.paceImprovementPercentage !== null && (
            <li>
              <span className="font-medium">Has mejorado tu ritmo:</span> un <span className="font-bold text-earth-700">{stats.paceImprovementPercentage >= 0 ? '+' : ''}{stats.paceImprovementPercentage.toFixed(1)}%</span> respecto al año pasado.
            </li>
          )}
        </ul>
      </div>

      {/* Resumen Anual (Spotify Wrapped style) */}
      <div className="bg-gradient-to-br from-earth-700 to-earth-900 rounded-2xl p-8 text-white shadow-xl">
        <h3 className="text-3xl font-bold mb-6 flex items-center gap-3">
          <Award size={32} className="text-amber-300" /> Tu Resumen Anual {new Date().getFullYear()}
        </h3>
        <div className="space-y-4 text-lg">
          <p>¡Este año ha sido increíble para tu biblioteca!</p>
          <p>Has terminado un total de <span className="font-bold text-amber-300">{stats.totalBooksFinishedCurrentYear}</span> libros.</p>
          {stats.bestMonthName !== 'N/A' && (
            <p>Tu mes estrella fue <span className="font-bold text-amber-300">{stats.bestMonthName}</span>, donde leíste <span className="font-bold text-amber-300">{stats.bestMonthBooks}</span> libros.</p>
          )}
          {stats.favoriteGenreName !== 'N/A' && (
            <p>Tu género más explorado fue <span className="font-bold text-amber-300">{stats.favoriteGenreName}</span>.</p>
          )}
          {stats.topAuthors.length > 0 && (
            <p>Tu autor más leído fue <span className="font-bold text-amber-300">{stats.topAuthors[0].name}</span> con <span className="font-bold text-amber-300">{stats.topAuthors[0].count}</span> libros.</p>
          )}
          {stats.paceImprovementPercentage !== null && (
            <p>¡Y lo mejor es que has <span className="font-bold text-amber-300">{stats.paceImprovementPercentage >= 0 ? 'mejorado' : 'disminuido'}</span> tu ritmo un <span className="font-bold text-amber-300">{Math.abs(stats.paceImprovementPercentage).toFixed(1)}%</span> respecto al año pasado!</p>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm">
            <h3 className="text-lg font-bold text-stone-800 mb-6">Géneros Favoritos</h3>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.genreDistribution} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" width={100} tick={{fontSize: 12, fill: '#78716c'}} />
                        <Tooltip 
                            cursor={{fill: 'transparent'}}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                            {stats.genreDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm">
             <h3 className="text-lg font-bold text-stone-800 mb-6">Autores Más Leídos</h3>
             <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.topAuthors} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" width={100} tick={{fontSize: 12, fill: '#78716c'}} />
                        <Tooltip 
                            cursor={{fill: 'transparent'}}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                            {stats.topAuthors.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
             </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm lg:col-span-2">
             <h3 className="text-lg font-bold text-stone-800 mb-6">Libros Leídos por Mes (Últimos 12 meses)</h3>
             <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={stats.monthlyProgress}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis dataKey="name" tick={{fontSize: 12, fill: '#78716c'}} />
                        <YAxis allowDecimals={false} tick={{fontSize: 12, fill: '#78716c'}} />
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Line type="monotone" dataKey="count" stroke="#b5763e" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                </ResponsiveContainer>
             </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;