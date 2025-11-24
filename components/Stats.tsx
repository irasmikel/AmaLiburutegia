import React from 'react';
import { Book, BookStatus, StatData } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid } from 'recharts';
import { Trophy, BookOpen, Layers, Clock, Users, Lightbulb, CalendarDays, BookCheck, TrendingUp } from 'lucide-react'; // Added new icons

interface StatsProps {
  books: Book[];
}

const Stats: React.FC<StatsProps> = ({ books }) => {
  // Calculate Stats
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

    let avgBooksPerMonth = 0;
    let avgPagesPerMonth = 0;
    let avgPagesPerDay = 0;
    let daysSinceFirstBook = 0;

    if (books.length > 0) {
      const firstBookDate = new Date(books.reduce((min, b) => new Date(b.createdAt) < new Date(min) ? b.createdAt : min, books[0].createdAt));
      const diffTime = Math.abs(now.getTime() - firstBookDate.getTime());
      daysSinceFirstBook = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const monthsSinceFirstBook = daysSinceFirstBook / 30.44; // Average days in a month

      if (monthsSinceFirstBook > 0) {
        avgBooksPerMonth = finishedBooks.length / monthsSinceFirstBook;
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

    // Longest Reading Streak (Placeholder for now, as it requires more complex logic or daily data)
    const longestReadingStreak = 0; // Placeholder

    let mostProductiveMonth = 'N/A';
    if (monthlyProgress.length > 0) {
      const mostProductive = monthlyProgress.reduce((max, current) => (current.count > max.count ? current : max), monthlyProgress[0]);
      mostProductiveMonth = mostProductive.name;
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
      avgBooksPerMonth,
      daysSinceLastFinishedBook,
      longestReadingStreak,
      mostProductiveMonth,
      avgPagesPerMonth,
      avgPagesPerDay,
    };
  };

  const stats = calculateStats();
  const COLORS = ['#b5763e', '#c28e50', '#d1aa78', '#e0c7a8', '#ede0d4']; // Earthy tones

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
            <CalendarDays size={20} className="text-blue-500" />
            <div>
              <p className="text-sm font-medium">Promedio Libros/Mes</p>
              <p className="font-bold text-lg">{stats.avgBooksPerMonth.toFixed(1)}</p>
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
            <TrendingUp size={20} className="text-emerald-500" />
            <div>
              <p className="text-sm font-medium">Racha más larga de lectura</p>
              <p className="font-bold text-lg">{stats.longestReadingStreak} días</p> {/* Placeholder */}
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
        </div>
      </div>

      {/* Datos Curiosos */}
      <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm">
        <h3 className="text-lg font-bold text-stone-800 mb-6 flex items-center gap-2">
          <Lightbulb size={20} className="text-earth-600" /> Datos Curiosos
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
        </ul>
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