
import React from 'react';

interface CoinProps {
  outcome: 2 | 3; // 2 for Yin/Tails, 3 for Yang/Heads
  animationDelay?: string;
  isFlipping?: boolean;
}

const Coin: React.FC<CoinProps> = ({ outcome, animationDelay = '0s', isFlipping = false }) => {
  const isHeads = outcome === 3;
  const animationName = isHeads ? 'flip-heads' : 'flip-tails';
  const flippingClass = isFlipping ? 'is-flipping' : '';
  const finalTransform = !isFlipping ? { transform: `rotateY(${isHeads ? 0 : 180}deg)` } : {};

  return (
    <div className="coin-container">
      <div 
        className={`coin ${flippingClass}`}
        style={{
          animationName: isFlipping ? animationName : 'none',
          animationDelay,
          ...finalTransform,
        }}
      >
        <div className="coin-face coin-face-front">陽</div> {/* Yang / Heads */}
        <div className="coin-face coin-face-back">陰</div> {/* Yin / Tails */}
      </div>
    </div>
  );
};

export default Coin;
