
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Verb } from './types';
import { IRREGULAR_VERBS } from './constants';
import { CheckIcon, LightbulbIcon, ArrowRightIcon, RefreshIcon } from './components/Icons';

const App: React.FC = () => {
    const [correctVerbs, setCorrectVerbs] = useState<string[]>(() => {
        const saved = localStorage.getItem('correctVerbs');
        return saved ? JSON.parse(saved) : [];
    });
    const [currentVerb, setCurrentVerb] = useState<Verb | null>(null);
    const [pastSimpleInput, setPastSimpleInput] = useState('');
    const [pastParticipleInput, setPastParticipleInput] = useState('');
    const [feedback, setFeedback] = useState<{ past: 'correct' | 'incorrect' | 'idle'; participle: 'correct' | 'incorrect' | 'idle' } | null>(null);
    const [isAnswerChecked, setIsAnswerChecked] = useState(false);
    const [hint, setHint] = useState<{ past: boolean; participle: boolean; definition: boolean }>({ past: false, participle: false, definition: false });
    const [gameComplete, setGameComplete] = useState(false);

    const unguessedVerbs = useMemo(() => 
        IRREGULAR_VERBS.filter(verb => !correctVerbs.includes(verb.base)), 
        [correctVerbs]
    );

    const selectNextVerb = useCallback(() => {
        setIsAnswerChecked(false);
        setFeedback(null);
        setPastSimpleInput('');
        setPastParticipleInput('');
        setHint({ past: false, participle: false, definition: false });

        if (unguessedVerbs.length > 0) {
            const randomIndex = Math.floor(Math.random() * unguessedVerbs.length);
            setCurrentVerb(unguessedVerbs[randomIndex]);
            setGameComplete(false);
        } else {
            setGameComplete(true);
            setCurrentVerb(null);
        }
    }, [unguessedVerbs]);

    useEffect(() => {
        localStorage.setItem('correctVerbs', JSON.stringify(correctVerbs));
    }, [correctVerbs]);

    useEffect(() => {
        selectNextVerb();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [correctVerbs.length]);

    const handleCheckAnswer = () => {
        if (!currentVerb) return;

        const isPastSimpleCorrect = currentVerb.pastSimple
            .split('/')
            .includes(pastSimpleInput.trim().toLowerCase());
        
        const isPastParticipleCorrect = currentVerb.pastParticiple
            .split('/')
            .includes(pastParticipleInput.trim().toLowerCase());
        
        setFeedback({
            past: isPastSimpleCorrect ? 'correct' : 'incorrect',
            participle: isPastParticipleCorrect ? 'correct' : 'incorrect'
        });

        if (isPastSimpleCorrect && isPastParticipleCorrect) {
            if (!correctVerbs.includes(currentVerb.base)) {
                setCorrectVerbs(prev => [...prev, currentVerb.base]);
            }
        }
        setIsAnswerChecked(true);
    };

    const handleShowHint = () => {
        if (!hint.past) {
            setHint(h => ({ ...h, past: true }));
        } else if (!hint.participle) {
            setHint(h => ({ ...h, participle: true }));
        } else {
            setHint(h => ({ ...h, definition: true }));
        }
    };
    
    const handleRestart = () => {
        setCorrectVerbs([]);
        // This will trigger the useEffect to select a new verb
    };

    const progressPercentage = (correctVerbs.length / IRREGULAR_VERBS.length) * 100;

    const getBorderColor = (type: 'past' | 'participle') => {
        if (!feedback) return 'border-slate-600 focus:border-sky-500';
        return feedback[type] === 'correct' ? 'border-green-500' : 'border-red-500';
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 font-sans antialiased">
            <div className="w-full max-w-2xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-sky-400">Irregular Verbs Challenge</h1>
                    <p className="text-slate-400 mt-2">Master the past forms of English verbs!</p>
                </header>
                
                <main className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl shadow-sky-900/20 p-6 md:p-8">
                    {gameComplete ? (
                        <div className="text-center py-10">
                            <h2 className="text-3xl font-bold text-green-400 mb-4">Congratulations!</h2>
                            <p className="text-slate-300 text-lg mb-6">You have mastered all the irregular verbs!</p>
                            <button onClick={handleRestart} className="bg-sky-600 hover:bg-sky-500 transition-colors text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center mx-auto">
                                <RefreshIcon />
                                Play Again
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-2 text-slate-400">
                                    <span>Progress</span>
                                    <span>{correctVerbs.length} / {IRREGULAR_VERBS.length}</span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-3">
                                    <div className="bg-sky-500 h-3 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                                </div>
                            </div>
                            
                            <div className="bg-slate-900/50 text-center p-8 rounded-xl mb-6 border border-slate-700">
                                <p className="text-slate-400 text-lg mb-2">Base Form</p>
                                <h2 className="text-5xl font-bold capitalize text-sky-300">{currentVerb?.base}</h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label htmlFor="past-simple" className="block text-sm font-medium text-slate-400 mb-2">Past Simple</label>
                                    <input
                                        id="past-simple"
                                        type="text"
                                        value={pastSimpleInput}
                                        onChange={(e) => setPastSimpleInput(e.target.value)}
                                        disabled={isAnswerChecked && feedback?.past === 'correct'}
                                        placeholder={hint.past ? `${currentVerb?.pastSimple[0]}...` : 'e.g. went'}
                                        className={`w-full bg-slate-700 border-2 ${getBorderColor('past')} rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors`}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="past-participle" className="block text-sm font-medium text-slate-400 mb-2">Past Participle</label>
                                    <input
                                        id="past-participle"
                                        type="text"
                                        value={pastParticipleInput}
                                        onChange={(e) => setPastParticipleInput(e.target.value)}
                                        disabled={isAnswerChecked && feedback?.participle === 'correct'}
                                        placeholder={hint.participle ? `${currentVerb?.pastParticiple[0]}...` : 'e.g. gone'}
                                        className={`w-full bg-slate-700 border-2 ${getBorderColor('participle')} rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors`}
                                    />
                                </div>
                            </div>

                            {isAnswerChecked && (
                                <div className="text-center p-3 rounded-lg mb-4 bg-slate-700/50">
                                    {feedback?.past === 'correct' && feedback.participle === 'correct' ? (
                                        <p className="text-green-400 font-semibold">Excellent! Both are correct.</p>
                                    ) : (
                                        <p className="text-amber-400">
                                            Correct answer: <strong className="font-bold text-white">{currentVerb?.pastSimple} / {currentVerb?.pastParticiple}</strong>
                                        </p>
                                    )}
                                </div>
                            )}

                             {hint.definition && (
                                <div className="text-center p-3 rounded-lg mb-4 bg-sky-900/50 border border-sky-700">
                                    <p className="text-sky-300">
                                        <strong className="font-bold">Definition:</strong> {currentVerb?.definition}
                                    </p>
                                </div>
                            )}


                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <button onClick={handleCheckAnswer} disabled={isAnswerChecked} className="col-span-2 md:col-span-2 bg-green-600 hover:bg-green-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center">
                                    <CheckIcon /> Check Answer
                                </button>
                                <button onClick={handleShowHint} disabled={isAnswerChecked} className="bg-amber-600 hover:bg-amber-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center">
                                    <LightbulbIcon /> Hint
                                </button>
                                <button onClick={selectNextVerb} className="bg-sky-600 hover:bg-sky-500 transition-colors text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center">
                                    <ArrowRightIcon /> Next
                                </button>
                            </div>
                            <div className="mt-4 flex justify-center">
                                <button onClick={handleRestart} className="text-slate-400 hover:text-white transition-colors text-sm font-semibold flex items-center">
                                    <RefreshIcon /> Restart Game
                                </button>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default App;
