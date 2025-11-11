import React, { useState, useEffect, useCallback, useMemo } from 'react';
import getIChingInterpretation from './services/geminiService';
import { ICHING_DATA, TRIGRAM_DATA } from './data/ichingData';
import type { Line, LineValue, HexagramData, DivinationResult } from './types';
import HexagramDisplay from './components/HexagramDisplay';
import CoinTossAnimation from './components/CoinTossAnimation';
import Coin from './components/Coin';
import InterpretingAnimation from './components/InterpretingAnimation';
import SettingsModal from './components/SettingsModal';

type GameState = 'start' | 'asking' | 'casting' | 'interpreting' | 'result' | 'error';
type ModelType = 'gemini-2.5-flash' | 'gemini-2.5-pro';

// Helper component for displaying static coins
const StaticCoinsDisplay: React.FC<{
  values: (2 | 3)[];
  sum: number;
  message?: string;
}> = ({ values, sum, message }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <div className="flex justify-center items-center gap-4 h-24">
        {values.map((v, i) => (
          <Coin key={i} outcome={v} isFlipping={false} />
        ))}
      </div>
      <div className="h-10 mt-4 text-center">
        {sum > 0 ? (
            <p className="text-xl text-amber-300 font-mono tracking-widest">
                {values.join(' + ')} = <span className="font-bold text-2xl">{sum}</span>
            </p>
        ) : message ? (
             <p className="text-lg text-gray-400">{message}</p>
        ) : null }
      </div>
    </div>
  );
};


const findHexagram = (lines: (0 | 1)[]): HexagramData | undefined => {
    if (lines.length !== 6) return undefined;
    return ICHING_DATA.find(h => h.lines.every((l, i) => l === lines[i]));
};

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>('start');
    const [lines, setLines] = useState<Line[]>([]);
    const [question, setQuestion] = useState('');
    const [result, setResult] = useState<DivinationResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isCasting, setIsCasting] = useState(false);
    const [lastToss, setLastToss] = useState<{values: (2|3)[], sum: LineValue} | null>(null);
    const [isAskingDissolving, setIsAskingDissolving] = useState(false);
    const [isSendingOff, setIsSendingOff] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [selectedModel, setSelectedModel] = useState<ModelType>(
        () => (localStorage.getItem('geminiModel') as ModelType) || 'gemini-2.5-flash'
    );

    useEffect(() => {
        localStorage.setItem('geminiModel', selectedModel);
    }, [selectedModel]);

    const primaryHexagramLines = useMemo(() => lines.map(l => (l.value === 7 || l.value === 9) ? 1 : 0), [lines]);
    const primaryHexagram = useMemo(() => findHexagram(primaryHexagramLines), [primaryHexagramLines]);

    const secondaryHexagramLines = useMemo(() => lines.map(l => {
        if (l.value === 6) return 1;
        if (l.value === 9) return 0;
        return (l.value === 7) ? 1 : 0;
    }), [lines]);
    const secondaryHexagram = useMemo(() => findHexagram(secondaryHexagramLines), [secondaryHexagramLines]);

    const changingLineIndices = useMemo(() => lines.reduce((acc, l, i) => {
        if (l.isChanging) acc.push(i);
        return acc;
    }, [] as number[]), [lines]);

    const handleToss = () => {
        if (isCasting || lines.length >= 6) return;
        setIsCasting(true);
    };

    const handleTossComplete = (sum: LineValue, values: (2|3)[]) => {
        setLines(prev => [...prev, {
            value: sum,
            isChanging: sum === 6 || sum === 9,
        }]);
        setLastToss({ values, sum });
        setIsCasting(false);
    };

    const fetchInterpretation = useCallback(async () => {
        if (!primaryHexagram) return;
        setGameState('interpreting');
        try {
            const changingLineNumbers = changingLineIndices.map(i => i + 1);
            const hasChangingLines = changingLineNumbers.length > 0;

            const interpretation = await getIChingInterpretation(
                primaryHexagram,
                hasChangingLines ? secondaryHexagram : null,
                changingLineNumbers,
                question,
                selectedModel
            );
            setResult(interpretation);
            setGameState('result');
        } catch (err: any) {
            setError(err.message || 'Произошла неизвестная ошибка.');
            setGameState('error');
        }
    }, [primaryHexagram, secondaryHexagram, changingLineIndices, question, selectedModel]);

    useEffect(() => {
        if (lines.length === 6) {
            setIsSendingOff(true);
            setTimeout(() => {
                fetchInterpretation();
            }, 2000); // Match animation duration
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lines.length]);

    const handleReset = () => {
        setLines([]);
        setResult(null);
        setError(null);
        setLastToss(null);
        setQuestion('');
        setIsAskingDissolving(false);
        setIsSendingOff(false);
        setGameState('start');
    };

    const handleStartCasting = () => {
        setIsAskingDissolving(true);
        setTimeout(() => {
            setGameState('casting');
            handleToss(); // Automatic first toss
        }, 600); // Match animation duration
    };

    const renderContent = () => {
        switch (gameState) {
            case 'start':
                return (
                    <div className="text-center animate-fade-in">
                        <h1 className="text-6xl md:text-8xl font-bold text-amber-300">И-Цзин</h1>
                        <p className="mt-4 text-lg md:text-xl text-gray-400">Путеводитель по переменам</p>
                        <button
                            onClick={() => setGameState('asking')}
                            className="mt-12 px-8 py-4 bg-amber-400 text-slate-900 font-bold rounded-full hover:bg-amber-300 transition-colors duration-300 shadow-lg shadow-amber-500/20 text-lg"
                        >
                            Задать вопрос оракулу
                        </button>
                    </div>
                );
             case 'asking':
                return (
                    <div className={`w-full max-w-xl mx-auto flex flex-col items-center text-center ${isAskingDissolving ? 'animate-dissolve-out' : 'animate-fade-in'}`}>
                        <h2 className="text-5xl md:text-6xl font-semibold mb-6 text-amber-300">Сформулируйте вопрос</h2>
                        <p className="mb-8 text-gray-300 max-w-lg">Четко сформулированный вопрос или намерение помогут получить более ясный ответ. </p>
                        <textarea
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            rows={5}
                            placeholder="Вы можете оставить поле пустым, чтобы получить общее напутствие..."
                            className="w-full text-center text-lg parchment transition focus:outline-none resize-none"
                        />
                        <button
                             onClick={handleStartCasting}
                             className="mt-10 px-10 py-4 bg-gradient-to-b from-yellow-400 to-amber-500 text-slate-900 font-bold rounded-full hover:from-yellow-500 hover:to-amber-600 transition-all duration-300 shadow-lg shadow-amber-500/30 text-lg"
                        >
                             Приступить к броску
                        </button>
                    </div>
                );
            case 'casting':
                return (
                    <div className={`w-full max-w-md mx-auto flex flex-col items-center ${isSendingOff ? 'animate-send-off' : 'animate-fade-in'}`}>
                        <h2 className="text-3xl font-semibold mb-8 text-center">Бросьте монеты шесть раз</h2>
                        <div className="w-full flex flex-col items-center">
                            <div className="flex justify-center items-center h-48 w-full p-6">
                                {isCasting ? (
                                    <CoinTossAnimation key={lines.length} onComplete={handleTossComplete} />
                                ) : lastToss ? (
                                    <StaticCoinsDisplay values={lastToss.values} sum={lastToss.sum} />
                                ) : (
                                    // This state should not be visible with auto-toss, but kept as fallback
                                    <StaticCoinsDisplay values={[3, 2, 3]} sum={0} message="Нажмите, чтобы бросить" />
                                )}
                            </div>
                            <p className="mt-4 text-gray-400 h-6">
                                {isCasting ? 'Бросок...' : lines.length >= 6 ? 'Все линии построены' : `Бросок ${lines.length + 1} из 6`}
                            </p>
                            <button
                                onClick={handleToss}
                                disabled={isCasting || lines.length >= 6}
                                className="mt-8 px-8 py-4 bg-amber-400 text-slate-900 font-bold rounded-full hover:bg-amber-300 transition-colors duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20"
                            >
                                {lines.length >= 6 ? 'К толкованию' : 'Бросить монеты'}
                            </button>
                        </div>
                    </div>
                );
            case 'interpreting':
                 return <InterpretingAnimation />;
            case 'result':
                if (!result) return null;
                return (
                    <div className="w-full max-w-6xl mx-auto animate-fade-in space-y-12">
                        <div className="flex flex-col md:flex-row justify-center items-start gap-8 md:gap-12">
                           {primaryHexagram && <HexagramDisplay hexagram={primaryHexagram} trigramData={TRIGRAM_DATA} changingIndices={changingLineIndices} label="Начало"/>}
                           {changingLineIndices.length > 0 && (
                             <>
                              <div className="text-5xl text-amber-400 transform rotate-90 md:rotate-0 mt-0 md:mt-24">→</div>
                              {secondaryHexagram && <HexagramDisplay hexagram={secondaryHexagram} trigramData={TRIGRAM_DATA} label="Итог"/>}
                             </>
                           )}
                        </div>

                         {question.trim() && (
                             <div className="bg-slate-800/30 p-6 md:p-8 rounded-lg shadow-xl ring-1 ring-slate-700/50">
                                <h3 className="text-xl font-semibold text-amber-300/80 mb-2">Ваш вопрос:</h3>
                                <p className="text-lg italic text-gray-300">"{question}"</p>
                            </div>
                         )}

                        <div className="bg-slate-800/50 p-6 md:p-8 rounded-lg shadow-xl space-y-6 ring-1 ring-slate-700/50">
                            <h2 className="text-3xl font-bold text-amber-300">{result.primaryHexagram.name}</h2>
                            <p className="text-lg leading-relaxed whitespace-pre-wrap">{result.primaryHexagram.judgment}</p>
                            <h3 className="text-2xl font-semibold border-t border-slate-700 pt-4 mt-4 text-amber-400/80">Образ</h3>
                            <p className="italic text-gray-400 whitespace-pre-wrap">{result.primaryHexagram.image}</p>
                        </div>
                        
                        {result.changingLines && result.changingLines.length > 0 && (
                             <div className="bg-slate-800/50 p-6 md:p-8 rounded-lg shadow-xl space-y-6 ring-1 ring-slate-700/50">
                                <h3 className="text-2xl font-bold text-amber-300">Движение перемен</h3>
                                {result.changingLines.map(line => {
                                    const originalLine = lines[line.line - 1];
                                    const lineValueText = originalLine?.value === 6 ? 'Шестёрка' : 'Девятка';
                                    const positionText = ["первой", "второй", "третьей", "четвёртой", "пятой", "шестой"][line.line - 1];
                                    const title = `${lineValueText} на ${positionText} позиции`;

                                    return (
                                        <div key={line.line} className="border-l-4 border-amber-400 pl-4">
                                            <p className="font-semibold text-lg">{title}:</p>
                                            <p className="leading-relaxed whitespace-pre-wrap">{line.text}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {changingLineIndices.length > 0 && result.secondaryHexagram && result.secondaryHexagram.name && (
                             <div className="bg-slate-800/50 p-6 md:p-8 rounded-lg shadow-xl space-y-6 ring-1 ring-slate-700/50">
                                <h2 className="text-3xl font-bold text-amber-300">{result.secondaryHexagram.name}</h2>
                                <p className="text-lg leading-relaxed whitespace-pre-wrap">{result.secondaryHexagram.judgment}</p>
                            </div>
                        )}

                        <div className="bg-gradient-to-t from-slate-900 to-slate-800/50 p-6 md:p-8 rounded-lg shadow-xl space-y-4 ring-1 ring-amber-400/20">
                            <h3 className="text-2xl font-bold text-amber-300">Итоговый совет</h3>
                            <p className="text-xl leading-relaxed whitespace-pre-wrap">{result.summary}</p>
                        </div>

                        <div className="text-center pt-8">
                           <button onClick={handleReset} className="px-8 py-4 bg-amber-400 text-slate-900 font-bold rounded-full hover:bg-amber-300 transition-colors duration-300 shadow-lg shadow-amber-500/20">
                                Спросить снова
                           </button>
                        </div>
                    </div>
                );
            case 'error':
                 return (
                    <div className="text-center animate-fade-in bg-[#4d2b2c] p-8 md:p-12 rounded-xl shadow-2xl max-w-lg w-full">
                        <h2 className="text-4xl font-semibold text-[#d1a3a3]">Произошла ошибка</h2>
                        <p className="mt-4 text-lg text-gray-300">{error}</p>
                        <button onClick={handleReset} className="mt-8 px-8 py-3 bg-gray-200 text-slate-900 font-bold rounded-full hover:bg-white transition-colors duration-300 shadow-lg">
                            Попробовать снова
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <main className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 bg-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-700/20 via-slate-900 to-slate-900">
             <div 
                className="absolute top-0 left-0 w-16 h-16 cursor-pointer z-10" 
                onClick={() => setIsSettingsOpen(true)}
                aria-label="Открыть настройки"
                role="button"
             />
             <SettingsModal 
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                currentModel={selectedModel}
                onModelChange={setSelectedModel}
             />
            {renderContent()}
        </main>
    );
};

export default App;