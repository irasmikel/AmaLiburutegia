import React from 'react';
import { Book, BookStatus, StatData } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from 'recharts';
import { Trophy, BookOpen, Layers, Clock } from 'lucide-react';

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
        genreMap.set(b.genre, (genreMap.get(b.genre) || 0) + 1);
    });
    const genreDistribution = Array.from(genreMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5); // Top 5 genres

    // Monthly Progress for the current year
    const currentYear = new Date().getFullYear();
    const monthlyCounts: { [key: string]: number } = {}; // e.g., { 'Ene': 5, 'Feb': 3 }
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    finishedBooks.forEach(b => {
      if (b.finishDate) {
        const finishDate = new Date(b.finishDate);
        if (finishDate.getFullYear() === currentYear) {
          const monthIndex = finishDate.getMonth(); // 0-11
          const monthKey = monthNames[monthIndex];
          monthlyCounts[monthKey] = (monthlyCounts[monthKey] || 0) + 1;
        }
      }
    });

    const monthlyProgress = monthNames.map(name => ({
      name,
      count: monthlyCounts[name] || 0
    }));

    // Top Authors
    const authorMap = new Map<string, number>();
    finishedBooks.forEach(b => {
        authorMap.set(b.author, (authorMap.get(b.author) || 0) + 1);
    });
    const topAuthors = Array.from(authorMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Top 5 authors

    return {
      totalBooks: finishedBooks.length,
      totalPages,
      readingCount: readingBooks.length,
      toReadCount: toReadBooks.length,
      avgPages: finishedBooks.length > 0 ? Math.round(totalPages / finishedBooks.length) : 0,
      streakDays: readingBooks.length > 0 ? 5 : 0, // Mock streak
      genreDistribution,
      monthlyProgress,
      topAuthors
    };
  };

  const stats = calculateStats();
  const COLORS = ['#b5763e', '#c28e50', '#d1aa78', '#e0c7a8', '#ede0d4'];
  const currentYear = new Date().getFullYear(); // Get current year for chart title

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
                {stats.genreDistribution.length > 0 ? (
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
                ) : (
                    <div className="h-full w-full flex items-center justify-center text-stone-400 bg-stone-50 rounded-lg border border-dashed border-stone-200">
                        <p>No hay datos de géneros.</p>
                    </div>
                )}
            </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm">
             <h3 className="text-lg font-bold text-stone-800 mb-6">Libros Leídos por Mes ({currentYear})</h3>
             <div className="h-64 w-full">
                {stats.monthlyProgress.some(m => m.count > 0) ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={stats.monthlyProgress} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <XAxis dataKey="name" tick={{fontSize: 12, fill: '#78716c'}} />
                            <YAxis allowDecimals={false} tick={{fontSize: 12, fill: '#78716c'}} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value: number) => [`${value} libros`, 'Total']}
                            />
                            <Line type="monotone" dataKey="count" stroke="#b5763e" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full w-full flex items-center justify-center text-stone-400 bg-stone-50 rounded-lg border border-dashed border-stone-200">
                        <p>No hay datos de libros terminados este año.</p>
                    </div>
                )}
             </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm">
            <h3 className="text-lg font-bold text-stone-800 mb-6">Autores Más Leídos</h3>
            <div className="h-64 w-full">
                {stats.topAuthors.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.topAuthors} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="name" width={100} tick={{fontSize: 12, fill: '#78716c'}} />
                            <Tooltip 
                                cursor={{fill: 'transparent'}}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value: number) => [`${value} libros`, 'Total']}
                            />
                            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                                {stats.topAuthors.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full w-full flex items-center justify-center text-stone-400 bg-stone-50 rounded-lg border border-dashed border-stone-200">
                        <p>No hay datos de autores leídos.</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;