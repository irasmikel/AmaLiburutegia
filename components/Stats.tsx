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
        .slice(0, 5);

    // Monthly Progress (Simple Mock logic for demo - assumes standard date format)
    // In real app, parse `finishDate` properly
    const monthlyProgress = [
        { name: 'Ene', count: 0 }, { name: 'Feb', count: 0 }, { name: 'Mar', count: 0 },
        { name: 'Abr', count: 0 }, { name: 'May', count: 0 }, { name: 'Jun', count: 0 }
    ];
    // Fill with real data if available in finishDate

    return {
      totalBooks: finishedBooks.length,
      totalPages,
      readingCount: readingBooks.length,
      toReadCount: toReadBooks.length,
      avgPages: finishedBooks.length > 0 ? Math.round(totalPages / finishedBooks.length) : 0,
      streakDays: readingBooks.length > 0 ? 5 : 0, // Mock streak
      genreDistribution,
      monthlyProgress,
      topAuthors: []
    };
  };

  const stats = calculateStats();
  const COLORS = ['#b5763e', '#c28e50', '#d1aa78', '#e0c7a8', '#ede0d4'];

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
             <h3 className="text-lg font-bold text-stone-800 mb-6">Actividad (Ejemplo)</h3>
             <div className="h-64 w-full flex items-center justify-center text-stone-400 bg-stone-50 rounded-lg border border-dashed border-stone-200">
                <p>Gráfico de actividad mensual (Próximamente)</p>
             </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
