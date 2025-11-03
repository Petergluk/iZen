import React, { useState, useEffect } from 'react';
import type { LineValue } from '../types';
import Coin from './Coin';

interface CoinTossAnimationProps {
  onComplete: (sum: LineValue, values: (2|3)[]) => void;
}

interface CoinState {
  value: 2 | 3;
  id: number;
}

const CoinTossAnimation: React.FC<CoinTossAnimationProps> = ({ onComplete }) => {
  const [coins, setCoins] = useState<CoinState[]>([]);
  const [showResult, setShowResult] = useState(false);

  const sum = coins.reduce((acc, c) => acc + c.value, 0) as LineValue;

  useEffect(() => {
    // Generate random coin outcomes on mount
    const newCoins: CoinState[] = Array.from({ length: 3 }, (_, i) => ({
      value: (Math.floor(Math.random() * 2) + 2) as 2 | 3,
      id: i,
    }));
    setCoins(newCoins);

    // Wait for the animation to finish
    const animationTimer = setTimeout(() => {
      setShowResult(true);
    }, 2200); // A bit longer than the animation duration + max delay

    // Wait a bit more before calling onComplete to let user see the result
    const completeTimer = setTimeout(() => {
        const coinValues = newCoins.map(c => c.value);
        onComplete(newCoins.reduce((acc, c) => acc + c.value, 0) as LineValue, coinValues);
    }, 2800); // Reduced delay for a snappier feel


    return () => {
      clearTimeout(animationTimer);
      clearTimeout(completeTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <div className="flex justify-center items-center gap-4 h-24">
        {coins.map((coin, index) => (
          <Coin
            key={coin.id}
            outcome={coin.value}
            animationDelay={`${index * 0.15}s`}
            isFlipping={true}
          />
        ))}
      </div>
      <div className="h-10 mt-4 text-center">
        {showResult && (
           <p className="text-xl text-amber-300 animate-fade-in font-mono tracking-widest">
                {coins.map(c => c.value).join(' + ')} = <span className="font-bold text-2xl">{sum}</span>
           </p>
        )}
      </div>
    </div>
  );
};

export default CoinTossAnimation;