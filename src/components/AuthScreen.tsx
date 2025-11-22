"use client";

import React from 'react';
import { UserProfile } from '../../types';

interface AuthScreenProps {
  onSelectUser: (user: UserProfile) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onSelectUser }) => {
  return (
    <div className="min-h-screen bg-earth-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-earth-800 mb-4 font-serif">Liburutegia</h1>
          <p className="text-earth-600 text-lg">Selecciona tu perfil para entrar a tu biblioteca</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <button 
            onClick={() => onSelectUser(UserProfile.MAIXUX)}
            className="group bg-white p-8 rounded-2xl shadow-sm border-2 border-transparent hover:border-earth-400 transition-all transform hover:-translate-y-1"
          >
            <div className="w-24 h-24 bg-earth-200 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
              👩‍🏫
            </div>
            <h2 className="text-2xl font-bold text-center text-earth-900">Maixux</h2>
            <p className="text-center text-earth-500 mt-2">Entrar a mi biblioteca</p>
          </button>

          <button 
            onClick={() => onSelectUser(UserProfile.ARANTXA)}
            className="group bg-white p-8 rounded-2xl shadow-sm border-2 border-transparent hover:border-earth-400 transition-all transform hover:-translate-y-1"
          >
            <div className="w-24 h-24 bg-stone-200 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
              👩‍💻
            </div>
            <h2 className="text-2xl font-bold text-center text-stone-900">Arantxa</h2>
            <p className="text-center text-stone-500 mt-2">Entrar a mi biblioteca</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;