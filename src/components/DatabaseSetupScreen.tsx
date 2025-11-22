"use client";

import React, { useState } from 'react';
import { Database, Copy, Check } from 'lucide-react';
import { showSuccess } from '../src/utils/toast';

interface DatabaseSetupScreenProps {
  sqlScript: string;
  onReloadApp: () => void;
}

const DatabaseSetupScreen: React.FC<DatabaseSetupScreenProps> = ({ sqlScript, onReloadApp }) => {
  const [copied, setCopied] = useState(false);

  const copySQL = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showSuccess('SQL copiado al portapapeles.');
  };

  return (
    <div className="min-h-screen bg-earth-50 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-earth-200">
        <div className="bg-earth-600 p-6 text-white flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-full">
            <Database size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Configuración Necesaria</h2>
            <p className="opacity-90">La base de datos aún no tiene la tabla de libros creada.</p>
          </div>
        </div>
        
        <div className="p-8 space-y-6">
          <p className="text-stone-600 text-lg">
            Parece que es la primera vez que conectas. Para que la app funcione, necesitas ejecutar el siguiente código SQL en tu panel de Supabase.
          </p>

          <ol className="list-decimal list-inside space-y-2 text-stone-700 font-medium">
            <li>Ve al <a href="https://supabase.com/dashboard/project/iaxvnfrplqmxgohsaeci/sql" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">Editor SQL de tu proyecto Supabase</a>.</li>
            <li>Crea una "New Query" (Nueva Consulta).</li>
            <li>Copia y pega el código de abajo.</li>
            <li>Haz clic en "Run" (Ejecutar).</li>
          </ol>

          <div className="relative">
            <div className="absolute top-2 right-2">
              <button 
                onClick={copySQL}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-stone-300 rounded text-sm transition-colors border border-stone-600"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copiado' : 'Copiar SQL'}
              </button>
            </div>
            <pre className="bg-stone-900 text-stone-100 p-4 rounded-lg overflow-x-auto text-sm font-mono leading-relaxed border border-stone-700">
              {sqlScript}
            </pre>
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              onClick={onReloadApp} 
              className="px-6 py-3 bg-earth-600 text-white rounded-lg font-bold hover:bg-earth-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              ¡Ya lo he ejecutado! Recargar App
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseSetupScreen;