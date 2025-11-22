import React from 'react';
import { Book, BookStatus, StatData } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid } from 'recharts';
import { Trophy, BookOpen, Layers, Clock, Users } from 'lucide-react';

interface StatsProps {
  books: Book[];
}

const Stats: React.FC<StatsProps> = ({ books }) => {
  // Calculate Stats
  const calculateStats = (): StatData => {
    const finishedBooks = books.filter(b => b.status === BookStatus.TERMINADO);
    const readingBooks = books.filter(b => b.status === BookStatus.LEYENDO);
    const toReadBooks = books.filter(b => b.status === BookStatus.POR_LEER);

    const totalPages = finishedBooks.reduce((acc, curr) => acc + curr.totalPages, 0) + 
                       readingBooks.reduce((acc, curr) => acc + (curr.currentPage || 0), 0);

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


    return {
      totalBooks: finishedBooks.length,
      totalPages,
      readingCount: readingBooks.length,
      toReadCount: toReadBooks.length,
      avgPages: finishedBooks.length > 0 ? Math.round(totalPages / finishedBooks.length) : 0,
      streakDays: readingBooks.length > 0 ? 5 : 0, // Mock streak, could be calculated with finishDate
      genreDistribution,
      monthlyProgress,
      topAuthors
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