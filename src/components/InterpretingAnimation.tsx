import React from 'react';

const InterpretingAnimation: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center animate-fade-in w-full max-w-lg">
      <svg width="200" height="200" viewBox="0 0 200 200" className="mb-8 opacity-50">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'rgb(251, 191, 36)', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: 'rgb(245, 158, 11)', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        {/* Some mystical pattern */}
        <path
          className="pattern"
          d="M 100,20 C 140,20 180,60 180,100 C 180,140 140,180 100,180 C 60,180 20,140 20,100 C 20,60 60,20 100,20 Z"
          fill="none"
          stroke="url(#grad1)"
          strokeWidth="2"
          style={{ animationDuration: '24s', strokeDasharray: '200 50' }}
        />
        <path
          className="pattern"
          d="M 100,60 C 120,60 140,80 140,100 C 140,120 120,140 100,140 C 80,140 60,120 60,100 C 60,80 80,60 100,60 Z"
          fill="none"
          stroke="url(#grad1)"
          strokeWidth="2"
          style={{ animationDuration: '18s', animationDirection: 'reverse', strokeDasharray: '30 30' }}
        />
        <path
          className="pattern"
          d="M 50,50 L 150,150 M 150,50 L 50,150"
          fill="none"
          stroke="url(#grad1)"
          strokeWidth="1"
          style={{ animationDuration: '20s', strokeDasharray: '10 10 100 10' }}
        />
      </svg>

      <div className="overflow-hidden">
        <h2 
          className="text-2xl md:text-3xl font-semibold text-amber-300 animate-slow-fade-in-up"
          style={{ animationDelay: '0.5s' }}
        >
          Поток перемен сплетает узор...
        </h2>
      </div>
      <div className="overflow-hidden mt-4">
        <p 
          className="text-gray-400 animate-slow-fade-in-up"
          style={{ animationDelay: '1.5s' }}
        >
          Вай Дэ Хань вглядывается в суть вещей, чтобы поведать вам ответ.
        </p>
      </div>
    </div>
  );
};

export default InterpretingAnimation;