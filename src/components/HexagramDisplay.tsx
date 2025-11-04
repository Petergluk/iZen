import React from 'react';
import { HexagramData, TrigramData } from '../types';

interface HexagramLineProps {
  isYang: boolean;
  isChanging: boolean;
}

const HexagramLine: React.FC<HexagramLineProps> = ({ isYang, isChanging }) => {
  const baseClasses = 'h-2 rounded-full transition-all duration-500';
  const colorClasses = isChanging ? 'bg-amber-400' : 'bg-gray-300';

  if (isYang) {
    return <div className={`${baseClasses} ${colorClasses} w-full`}></div>;
  } else {
    return (
      <div className="flex justify-between w-full gap-4">
        <div className={`${baseClasses} ${colorClasses} w-1/2`}></div>
        <div className={`${baseClasses} ${colorClasses} w-1/2`}></div>
      </div>
    );
  }
};

interface HexagramDisplayProps {
  hexagram: HexagramData;
  trigramData: TrigramData[];
  changingIndices?: number[];
  label?: string;
}

const HexagramDisplay: React.FC<HexagramDisplayProps> = ({ hexagram, trigramData, changingIndices = [], label }) => {
  const lowerTrigram = trigramData.find(t => t.name === hexagram.lowerTrigram);
  const upperTrigram = trigramData.find(t => t.name === hexagram.upperTrigram);

  return (
    <div className="flex flex-col items-center gap-4 bg-slate-800/30 p-4 md:p-6 rounded-2xl shadow-lg w-full max-w-xs ring-1 ring-slate-700/50">
      <div className="text-center">
        {label && <p className="text-lg text-amber-300 font-serif mb-2">{label}</p>}
        <h3 className="text-2xl font-bold font-serif text-gray-100">{hexagram.number}. {hexagram.russianName}</h3>
        <p className="text-lg text-gray-400 font-mono">{hexagram.name}</p>
      </div>

      <div className="flex flex-col-reverse gap-3 w-24 my-4">
        {hexagram.lines.map((line, index) => (
          <HexagramLine
            key={index}
            isYang={line === 1}
            isChanging={changingIndices.includes(index)}
          />
        ))}
      </div>

      <div className="w-full text-sm text-gray-300 border-t border-slate-700 pt-4 space-y-2 font-mono">
        {upperTrigram && (
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Верхняя:</span>
            <span className="font-semibold text-right">{`${upperTrigram.symbol} ${upperTrigram.russianName} (${upperTrigram.image})`}</span>
          </div>
        )}
        {lowerTrigram && (
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Нижняя:</span>
            <span className="font-semibold text-right">{`${lowerTrigram.symbol} ${lowerTrigram.russianName} (${lowerTrigram.image})`}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default HexagramDisplay;