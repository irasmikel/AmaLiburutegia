"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Book, BookStatus, StatData } from '../../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid } from 'recharts';
import { Trophy, Layers, Clock, Lightbulb, CalendarDays, BookCheck, Globe, BookMarked, Award } from 'lucide-react';

interface StatsProps {
  books: Book[];
  selectedYear: number | 'ALL';
}

const Stats: React.FC<StatsProps> = ({ books, selectedYear }) => {
  const [randomFact, setRandomFact] = useState('');

  const calculateStats = (): StatData => {
    const filteredBooks = selectedYear === 'ALL'
      ? books
      : books.filter(book => {
          const finishYear = book.finishDate ? new Date(book.finishDate).getFullYear() : null;
          const creationYear = book.createdAt ? new Date(book.createdAt).getFullYear() : null;
          return finishYear === selectedYear || creationYear === selectedYear;
        });

    const finishedBooks = filteredBooks.filter(b => b.status === BookStatus.TERMINADO);
    const toReadBooks = filteredBooks.filter(b => b.status === BookStatus.POR_LEER);

    const totalPagesFinished = finishedBooks.reduce((acc, curr) => acc + curr.totalPages, 0);
    const totalPagesOverall = filteredBooks.reduce((acc, curr) => acc + curr.totalPages, 0);

    const genreMap = new Map<string, number>();
    filteredBooks.forEach(b => {
        if (b.genre) genreMap.set(b.genre, (genreMap.get(b.genre) || 0) + 1);
    });
    const genreDistribution = Array.from(genreMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    const authorMap = new Map<string, number>();
    finishedBooks.forEach(b => {
        if (b.author) authorMap.set(b.author, (authorMap.get(b.author) || 0) + 1);
    });
    const topAuthors = Array.from(authorMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    const monthlyCounts = new Map<string, number>();
    const now = new Date();
    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

    for (let i = 0; i < 12; i++) {
        let d = selectedYear === 'ALL' ? new Date(now.getFullYear(), now.getMonth() - (11 - i), 1) : new Date(selectedYear, i, 1);
        const monthYear = `${monthNames[d.getMonth()]} ${d.getFullYear() % 100}`;
        monthlyCounts.set(monthYear, 0);
    }

    finishedBooks.forEach(b => {
        if (b.finishDate) {
            const finishDate = new Date(b.finishDate);
            const monthYear = `${monthNames[finishDate.getMonth()]} ${finishDate.getFullYear() % 100}`;
            if (monthlyCounts.has(monthYear)) monthlyCounts.set(monthYear, monthlyCounts.get(monthYear)! + 1);
        }
    });

    const monthlyProgress = Array.from(monthlyCounts.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => {
            const dateA = new Date(`01 ${a.name}`);
            const dateB = new Date(`01 ${b.name}`);
            return dateA.getTime() - dateB.getTime();
        });

    const totalBooksInLibrary = filteredBooks.length;
    const pageThicknessMm = 0.1;
    const totalLengthMeters = (totalPagesOverall * pageThicknessMm) / 1000;
    const readingSpeedPagesPerHour = 40;
    const totalReadingHours = totalPagesFinished / readingSpeedPagesPerHour;
    const continuousReadingDays = totalReadingHours / 24;

    let favoriteGenreName = 'N/A';
    let favoriteGenrePercentage = 0;
    if (genreDistribution.length > 0 && totalBooksInLibrary > 0) {
        favoriteGenreName = genreDistribution[0].name;
        favoriteGenrePercentage = (genreDistribution[0].value / totalBooksInLibrary) * 100;
    }

    let monthlyComparisonPercentage = 0;
    if (monthlyProgress.length >= 2) {
        const current = monthlyProgress[monthlyProgress.length - 1].count;
        const prev = monthlyProgress[monthlyProgress.length - 2].count;
        monthlyComparisonPercentage = prev > 0 ? ((current - prev) / prev) * 100 : (current > 0 ? 100 : 0);
    }

    const currentYearForStats = selectedYear === 'ALL' ? now.getFullYear() : selectedYear;
    const totalBooksFinishedSelectedYear = finishedBooks.filter(b => b.finishDate && new Date(b.finishDate).getFullYear() === currentYearForStats).length;
    const totalBooksFinishedPreviousToSelectedYear = finishedBooks.filter(b => b.finishDate && new Date(b.finishDate).getFullYear() === (currentYearForStats as number) - 1).length;

    let daysSinceLastFinishedBook: number | null = null;
    if (finishedBooks.length > 0) {
      const latest = finishedBooks.reduce((max, b) => (b.finishDate && new Date(b.finishDate) > new Date(max)) ? b.finishDate : max, finishedBooks[0].finishDate || new Date(0).toISOString());
      daysSinceLastFinishedBook = Math.floor(Math.abs(now.getTime() - new Date(latest).getTime()) / (1000 * 60 * 60 * 24));
    }

    const uniqueAuthorsCount = new Set(filteredBooks.map(b => b.author).filter(Boolean)).size;
    const longestBookPages = finishedBooks.length > 0 ? Math.max(...finishedBooks.map(b => b.totalPages)) : null;
    const shortestBookPages = finishedBooks.length > 0 ? Math.min(...finishedBooks.map(b => b.totalPages)) : null;
    const avgPagesPerBookFinished = finishedBooks.length > 0 ? totalPagesFinished / finishedBooks.length : 0;

    return {
      totalBooks: finishedBooks.length,
      totalPages: totalPagesFinished,
      readingCount: 0,
      toReadCount: toReadBooks.length,
      avgPages: Math.round(avgPagesPerBookFinished),
      streakDays: 0,
      genreDistribution,
      monthlyProgress,
      topAuthors,
      totalLengthMeters,
      continuousReadingDays,
      favoriteGenreName,
      favoriteGenrePercentage,
      monthlyComparisonPercentage,
      totalBooksFinishedCurrentYear: totalBooksFinishedSelectedYear,
      daysSinceLastFinishedBook,
      mostProductiveMonth: monthlyProgress.length > 0 ? monthlyProgress.reduce((max, c) => c.count > max.count ? c : max).name : 'N/A',
      avgPagesPerMonth: null,
      avgPagesPerDay: null,
      avgDaysPerBookFinished: null,
      uniqueAuthorsCount,
      longestBookPages,
      shortestBookPages,
      pageDifferenceLongShort: (longestBookPages && shortestBookPages) ? longestBookPages - shortestBookPages : null,
      avgPagesPerBookFinished,
      bestMonthName: monthlyProgress.length > 0 ? monthlyProgress.reduce((max, c) => c.count > max.count ? c : max).name : 'N/A',
      bestMonthBooks: monthlyProgress.length > 0 ? Math.max(...monthlyProgress.map(m => m.count)) : 0,
      worstMonthName: monthlyProgress.length > 0 ? monthlyProgress.reduce((min, c) => c.count < min.count ? c : min).name : 'N/A',
      worstMonthBooks: monthlyProgress.length > 0 ? Math.min(...monthlyProgress.map(m => m.count)) : 0,
      longestTimeWithoutFinishingBookDays: null,
      recordBooksInMonth: monthlyProgress.length > 0 ? Math.max(...monthlyProgress.map(m => m.count)) : 0,
      paceImprovementPercentage: totalBooksFinishedPreviousToSelectedYear > 0 ? ((totalBooksFinishedSelectedYear - totalBooksFinishedPreviousToSelectedYear) / totalBooksFinishedPreviousToSelectedYear) * 100 : (totalBooksFinishedSelectedYear > 0 ? 100 : null),
      totalBooksFinishedPreviousYear: totalBooksFinishedPreviousToSelectedYear,
      randomFact: ''
    };
  };

  const stats = useMemo(() => calculateStats(), [books, selectedYear]);
  const COLORS = ['#b5763e', '#c28e50', '#d1aa78', '#e0c7a8', '#ede0d4'];

  const funFactsList = useMemo(() => {
    const yearText = selectedYear === 'ALL' ? 'todos los años' : `el año ${selectedYear}`;
    return [
      `Has leído un total de ${stats.totalBooks} libros ${yearText}.`,
      `Tu género favorito es "${stats.favoriteGenreName}" (${stats.favoriteGenrePercentage.toFixed(1)}%).`,
      stats.longestBookPages ? `El libro más largo tenía ${stats.longestBookPages} páginas.` : null,
      stats.uniqueAuthorsCount > 0 ? `Has descubierto ${stats.uniqueAuthorsCount} autores únicos.` : null,
    ].filter(Boolean) as string[];
  }, [stats, selectedYear]);

  useEffect(() => {
    if (funFactsList.length > 0) setRandomFact(funFactsList[Math.floor(Math.random() * funFactsList.length)]);
  }, [funFactsList]);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-stone-100 shadow-sm flex items-center justify-between">
          <div><p className="text-stone-500 text-sm font-medium">Leídos</p><p className="text-3xl font-bold text-stone-800">{stats.totalBooks}</p></div>
          <div className="p-3 bg-amber-100 text-amber-600 rounded-full"><Trophy size={24} /></div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-stone-100 shadow-sm flex items-center justify-between">
          <div><p className="text-stone-500 text-sm font-medium">Páginas</p><p className="text-3xl font-bold text-stone-800">{stats.totalPages.toLocaleString()}</p></div>
          <div className="p-3 bg-stone-100 text-stone-600 rounded-full"><Layers size={24} /></div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-stone-100 shadow-sm flex items-center justify-between">
          <div><p className="text-stone-500 text-sm font-medium">Pendientes</p><p className="text-3xl font-bold text-stone-800">{stats.toReadCount}</p></div>
          <div className="p-3 bg-orange-100 text-orange-600 rounded-full"><Clock size={24} /></div>
        </div>
      </div>

      {randomFact && (
        <div className="bg-gradient-to-r from-earth-600 to-earth-500 rounded-2xl p-6 text-white shadow-lg flex items-center gap-4">
          <Lightbulb size={28} className="flex-shrink-0" />
          <p className="text-lg font-medium">{randomFact}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm">
          <h3 className="text-lg font-bold text-stone-800 mb-6">Géneros Favoritos</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.genreDistribution} layout="vertical">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={100} tick={{fontSize: 12, fill: '#78716c'}} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {stats.genreDistribution.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm">
          <h3 className="text-lg font-bold text-stone-800 mb-6">Autores Más Leídos</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.topAuthors} layout="vertical">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={100} tick={{fontSize: 12, fill: '#78716c'}} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                  {stats.topAuthors.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;