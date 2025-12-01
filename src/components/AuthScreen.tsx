"use client";

import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { LogIn, AlertCircle } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (user: UserProfile) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (username === UserProfile.MAIXUX && password === '3') {
      onLogin(UserProfile.MAIXUX);
    } else if (username === UserProfile.ARANTXA && password === '31') {
      onLogin(UserProfile.ARANTXA);
    } else {
      setError('Usuario o contraseña incorrectos.');
    }
  };

  return (
    <div className="min-h-screen bg-earth-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-earth-200 animate-fade-in">
        <div className="bg-earth-600 p-6 text-white flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-full">
            <LogIn size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Bienvenido a Liburutegia</h2>
            <p className="opacity-90">Inicia sesión para acceder a tu biblioteca.</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-3">
              <AlertCircle size={20} />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
            <select
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-earth-400 focus:border-transparent outline-none transition-all bg-white"
              required
            >
              <option value="">Selecciona un usuario</option>
              <option value={UserProfile.MAIXUX}>{UserProfile.MAIXUX}</option>
              <option value={UserProfile.ARANTXA}>{UserProfile.ARANTXA}</option>
            </select>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-earth-400 focus:border-transparent outline-none transition-all"
              placeholder="Introduce tu contraseña"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full px-6 py-3 bg-earth-600 text-white rounded-lg font-bold hover:bg-earth-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            <LogIn size={20} /> Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthScreen;