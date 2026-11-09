'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  GraduationCap,
  Sparkles,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  BookOpen,
  HelpCircle,
  Layers,
  ChevronRight,
  Flame,
  Check,
  X,
  Loader2,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  deckName: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  dueDate: string;
  noteId?: string;
  note?: { id: string; title: string };
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  userAnswer?: number;
}

interface Quiz {
  id: string;
  title: string;
  description?: string;
  score?: number;
  questionCount?: number;
  questions?: QuizQuestion[];
  note?: { id: string; title: string };
  createdAt: string;
}

interface NoteOption {
  id: string;
  title: string;
}

export default function StudyPage() {
  const [activeTab, setActiveTab] = useState<'review' | 'quiz' | 'cards'>('review');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [stats, setStats] = useState({ total: 0, due: 0, mastered: 0 });
  const [decks, setDecks] = useState<{ name: string; count: number }[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Review session state
  const [reviewQueue, setReviewQueue] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  // Quiz execution state
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loadingQuizDetails, setLoadingQuizDetails] = useState(false);

  // AI Generator Modal state
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [notesList, setNotesList] = useState<NoteOption[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Manual Card Creation state
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newDeck, setNewDeck] = useState('Default');

  // Load flashcards and study data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [cardsRes, quizzesRes, notesRes] = await Promise.all([
        axios.get('/api/study/flashcards'),
        axios.get('/api/study/quizzes'),
        axios.get('/api/notes?limit=100'),
      ]);

      const cards: Flashcard[] = cardsRes.data.data.flashcards || [];
      setFlashcards(cards);
      setStats(cardsRes.data.data.stats || { total: 0, due: 0, mastered: 0 });
      setDecks(cardsRes.data.data.decks || []);
      setQuizzes(quizzesRes.data.data.quizzes || []);

      const notes: NoteOption[] = (notesRes.data.data.notes || []).map((n: any) => ({
        id: n.id,
        title: n.title,
      }));
      setNotesList(notes);

      // Initialize review queue with cards due today
      const now = new Date();
      const dueCards = cards.filter((c) => new Date(c.dueDate) <= now);
      setReviewQueue(dueCards.length > 0 ? dueCards : cards);
      setCurrentIndex(0);
      setIsFlipped(false);
      setSessionCompleted(false);
    } catch (err) {
      console.error('Failed to load study data:', err);
      toast.error('Failed to load study data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Keyboard navigation for review
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab !== 'review' || sessionCompleted || reviewQueue.length === 0) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (isFlipped) {
        if (e.key === '1') handleRateCard(1);
        else if (e.key === '2') handleRateCard(2);
        else if (e.key === '3') handleRateCard(3);
        else if (e.key === '4') handleRateCard(4);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, isFlipped, reviewQueue, currentIndex, sessionCompleted]);

  // Review card rating handler (SM-2 spaced repetition)
  const handleRateCard = async (grade: number) => {
    const currentCard = reviewQueue[currentIndex];
    if (!currentCard) return;

    try {
      await axios.put('/api/study/flashcards', {
        id: currentCard.id,
        grade,
      });

      if (currentIndex + 1 < reviewQueue.length) {
        setCurrentIndex((prev) => prev + 1);
        setIsFlipped(false);
      } else {
        setSessionCompleted(true);
        toast.success('Study session complete! Great work.');
      }
    } catch (err) {
      console.error('Failed to record review:', err);
      toast.error('Failed to save card rating');
    }
  };

  // Trigger AI generation
  const handleGenerateStudyMaterials = async () => {
    if (!selectedNoteId) {
      toast.error('Please select a note to generate from');
      return;
    }

    try {
      setIsGenerating(true);
      const res = await axios.post('/api/study/generate', {
        noteId: selectedNoteId,
      });

      toast.success(res.data.data.message || 'Study set generated successfully!');
      setShowGenerateModal(false);
      setSelectedNoteId('');
      await fetchData();
      setActiveTab('review');
    } catch (err: any) {
      console.error('Generation error:', err);
      toast.error(err.response?.data?.message || 'Failed to generate study materials');
    } finally {
      setIsGenerating(false);
    }
  };

  // Add card manually
  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) {
      toast.error('Please fill in both front and back');
      return;
    }

    try {
      await axios.post('/api/study/flashcards', {
        front: newFront.trim(),
        back: newBack.trim(),
        deckName: newDeck.trim() || 'Default',
      });
      toast.success('Flashcard created!');
      setNewFront('');
      setNewBack('');
      setShowAddCardModal(false);
      await fetchData();
    } catch (err) {
      toast.error('Failed to create flashcard');
    }
  };

  // Delete card
  const handleDeleteCard = async (id: string) => {
    try {
      await axios.delete(`/api/study/flashcards?id=${id}`);
      toast.success('Card deleted');
      setFlashcards((prev) => prev.filter((c) => c.id !== id));
      setReviewQueue((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      toast.error('Failed to delete card');
    }
  };

  // Start Quiz
  const handleStartQuiz = async (quizId: string) => {
    try {
      setLoadingQuizDetails(true);
      const res = await axios.get(`/api/study/quizzes?id=${quizId}`);
      const fullQuiz: Quiz = res.data.data.quiz;
      setSelectedQuiz(fullQuiz);
      setCurrentQuestionIndex(0);
      setSelectedAnswerIndex(null);
      setHasSubmittedAnswer(false);
      setQuizScore(0);
      setQuizCompleted(false);
      setActiveTab('quiz');
    } catch (err) {
      toast.error('Failed to load quiz details');
    } finally {
      setLoadingQuizDetails(false);
    }
  };

  // Submit Answer in Quiz
  const handleSelectAnswer = (index: number) => {
    if (hasSubmittedAnswer || !selectedQuiz?.questions) return;
    setSelectedAnswerIndex(index);
    setHasSubmittedAnswer(true);

    const currentQ = selectedQuiz.questions[currentQuestionIndex];
    if (index === currentQ.correctAnswer) {
      setQuizScore((prev) => prev + 1);
    }
  };

  // Next Question or Complete Quiz
  const handleNextQuestion = async () => {
    if (!selectedQuiz?.questions) return;

    if (currentQuestionIndex + 1 < selectedQuiz.questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswerIndex(null);
      setHasSubmittedAnswer(false);
    } else {
      setQuizCompleted(true);
      const finalScorePct = Math.round(
        ((quizScore + (selectedAnswerIndex === selectedQuiz.questions[currentQuestionIndex].correctAnswer ? 0 : 0)) /
          selectedQuiz.questions.length) *
          100
      );
      try {
        await axios.post('/api/study/quizzes', {
          quizId: selectedQuiz.id,
          score: finalScorePct,
        });
      } catch (e) {
        console.warn('Failed to save quiz score:', e);
      }
    }
  };

  const currentCard = reviewQueue[currentIndex];
  const progressPct =
    reviewQueue.length > 0 ? Math.round(((currentIndex) / reviewQueue.length) * 100) : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
              Study Mode & Active Recall
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
              SM-2 Spaced Repetition
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Turn your knowledge base into high-retention flashcards and interactive quizzes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddCardModal(true)}
            className="flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Add Flashcard
          </Button>

          <Button
            size="sm"
            onClick={() => setShowGenerateModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="h-4 w-4" />
            Generate with AI
          </Button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Due for Review
            </span>
            <RotateCw className="h-4 w-4" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.due}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Cards scheduled for today
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Mastered
            </span>
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.mastered}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Retained over 3+ reviews
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Total Flashcards
            </span>
            <Layers className="h-4 w-4" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Across {decks.length} deck{decks.length === 1 ? '' : 's'}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-violet-600 dark:text-violet-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Practice Quizzes
            </span>
            <HelpCircle className="h-4 w-4" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{quizzes.length}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Available self-tests
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('review')}
          className={`py-3 px-5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'review'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <RotateCw className="h-4 w-4" />
          Review Flashcards
          {stats.due > 0 && (
            <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
              {stats.due}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('quiz')}
          className={`py-3 px-5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'quiz'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <HelpCircle className="h-4 w-4" />
          Interactive Quizzes ({quizzes.length})
        </button>

        <button
          onClick={() => setActiveTab('cards')}
          className={`py-3 px-5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'cards'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          Manage Decks & Cards
        </button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-sm">Loading active recall engine...</p>
        </div>
      ) : null}

      {/* TAB 1: FLASHCARD REVIEW */}
      {!isLoading && activeTab === 'review' && (
        <div className="space-y-6">
          {sessionCompleted || reviewQueue.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-12 text-center max-w-xl mx-auto shadow-sm">
              <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {reviewQueue.length === 0 ? 'No Cards in Deck' : 'All Caught Up for Today! 🎉'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                {reviewQueue.length === 0
                  ? 'Generate cards from any of your notes with AI or add a custom card to start.'
                  : 'You reviewed all due cards in this session. The SM-2 algorithm will schedule your next intervals.'}
              </p>
              <div className="flex items-center justify-center gap-3">
                {flashcards.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setReviewQueue([...flashcards]);
                      setCurrentIndex(0);
                      setIsFlipped(false);
                      setSessionCompleted(false);
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Review All Cards Anyway
                  </Button>
                )}
                <Button
                  onClick={() => setShowGenerateModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate New Cards
                </Button>
              </div>
            </div>
          ) : currentCard ? (
            <div className="max-w-2xl mx-auto space-y-4">
              {/* Progress Indicator */}
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>
                  Card {currentIndex + 1} of {reviewQueue.length}
                </span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {currentCard.deckName}
                </span>
                <span>{progressPct}% Completed</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              {/* The Flippable Card */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className={`cursor-pointer min-h-[320px] rounded-2xl border transition-all duration-300 flex flex-col justify-between p-8 shadow-md select-none relative ${
                  isFlipped
                    ? 'bg-gradient-to-br from-indigo-50/50 to-white dark:from-gray-800 dark:to-indigo-950/20 border-indigo-200 dark:border-indigo-800'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                }`}
              >
                {/* Header label on card */}
                <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                  <span className="uppercase font-semibold tracking-wider">
                    {isFlipped ? 'Answer & Explanation' : 'Question / Concept'}
                  </span>
                  {currentCard.note && (
                    <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <BookOpen className="h-3 w-3" />
                      {currentCard.note.title}
                    </span>
                  )}
                </div>

                {/* Card Content Body */}
                <div className="py-8 text-center">
                  <div className="text-xl md:text-2xl font-medium text-gray-900 dark:text-white leading-relaxed">
                    {isFlipped ? currentCard.back : currentCard.front}
                  </div>
                </div>

                {/* Bottom Card Footer Hint */}
                <div className="text-center text-xs text-gray-400 dark:text-gray-500">
                  {isFlipped
                    ? 'Rate your recall difficulty below or press 1-4'
                    : 'Click card or press Space to reveal answer'}
                </div>
              </div>

              {/* Rating Buttons (Revealed when card is flipped) */}
              {isFlipped ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 animate-in fade-in duration-200">
                  <button
                    onClick={() => handleRateCard(1)}
                    className="p-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/50 text-rose-700 dark:text-rose-300 flex flex-col items-center justify-center transition-all group"
                  >
                    <span className="font-semibold text-sm">Again (1)</span>
                    <span className="text-[11px] text-rose-500 dark:text-rose-400 mt-0.5">
                      &lt; 1 day
                    </span>
                  </button>

                  <button
                    onClick={() => handleRateCard(2)}
                    className="p-3 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-950/50 text-amber-700 dark:text-amber-300 flex flex-col items-center justify-center transition-all group"
                  >
                    <span className="font-semibold text-sm">Hard (2)</span>
                    <span className="text-[11px] text-amber-500 dark:text-amber-400 mt-0.5">
                      1 - 2 days
                    </span>
                  </button>

                  <button
                    onClick={() => handleRateCard(3)}
                    className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 flex flex-col items-center justify-center transition-all group"
                  >
                    <span className="font-semibold text-sm">Good (3)</span>
                    <span className="text-[11px] text-emerald-500 dark:text-emerald-400 mt-0.5">
                      3 - 5 days
                    </span>
                  </button>

                  <button
                    onClick={() => handleRateCard(4)}
                    className="p-3 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/60 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 flex flex-col items-center justify-center transition-all group"
                  >
                    <span className="font-semibold text-sm">Easy (4)</span>
                    <span className="text-[11px] text-indigo-500 dark:text-indigo-400 mt-0.5">
                      7+ days
                    </span>
                  </button>
                </div>
              ) : (
                <div className="flex justify-center pt-2">
                  <Button
                    onClick={() => setIsFlipped(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto px-8 py-2.5 rounded-xl"
                  >
                    Reveal Answer (Space)
                  </Button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* TAB 2: INTERACTIVE QUIZZES */}
      {!isLoading && activeTab === 'quiz' && (
        <div className="space-y-6">
          {/* Active Quiz Player */}
          {selectedQuiz && selectedQuiz.questions && selectedQuiz.questions.length > 0 ? (
            <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 md:p-8 shadow-sm">
              {quizCompleted ? (
                <div className="text-center py-6">
                  <div className="h-16 w-16 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <GraduationCap className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Quiz Finished!
                  </h3>
                  <div className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 my-4">
                    {Math.round((quizScore / selectedQuiz.questions.length) * 100)}%
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                    You got {quizScore} out of {selectedQuiz.questions.length} questions correct.
                  </p>
                  <div className="flex justify-center gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedQuiz(null)}
                    >
                      Back to All Quizzes
                    </Button>
                    <Button
                      onClick={() => handleStartQuiz(selectedQuiz.id)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retake Quiz
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Quiz Header */}
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4">
                    <div>
                      <span className="text-xs uppercase font-semibold text-indigo-600 dark:text-indigo-400">
                        {selectedQuiz.title}
                      </span>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Question {currentQuestionIndex + 1} of {selectedQuiz.questions.length}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedQuiz(null)}
                      className="text-xs text-gray-500"
                    >
                      Exit Quiz
                    </Button>
                  </div>

                  {/* Question Text */}
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedQuiz.questions[currentQuestionIndex].question}
                  </h3>

                  {/* Options */}
                  <div className="space-y-2.5">
                    {selectedQuiz.questions[currentQuestionIndex].options.map((opt, idx) => {
                      const isCorrect =
                        idx === selectedQuiz.questions![currentQuestionIndex].correctAnswer;
                      const isSelected = selectedAnswerIndex === idx;

                      let btnStyle =
                        'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-800 dark:text-gray-200';

                      if (hasSubmittedAnswer) {
                        if (isCorrect) {
                          btnStyle =
                            'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-medium';
                        } else if (isSelected) {
                          btnStyle =
                            'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200';
                        } else {
                          btnStyle = 'opacity-50 border-gray-200 dark:border-gray-700';
                        }
                      }

                      return (
                        <button
                          key={idx}
                          disabled={hasSubmittedAnswer}
                          onClick={() => handleSelectAnswer(idx)}
                          className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${btnStyle}`}
                        >
                          <span className="h-6 w-6 rounded-full border border-current flex items-center justify-center shrink-0 text-xs font-semibold">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="text-sm mt-0.5 flex-1">{opt}</span>
                          {hasSubmittedAnswer && isCorrect && (
                            <Check className="h-5 w-5 text-emerald-600 shrink-0" />
                          )}
                          {hasSubmittedAnswer && isSelected && !isCorrect && (
                            <X className="h-5 w-5 text-rose-600 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation banner */}
                  {hasSubmittedAnswer && (
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 text-xs space-y-1">
                      <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                        <HelpCircle className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        Explanation:
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedQuiz.questions[currentQuestionIndex].explanation ||
                          'Review this note in your knowledge base for full context.'}
                      </p>
                    </div>
                  )}

                  {/* Next Question Button */}
                  {hasSubmittedAnswer && (
                    <div className="flex justify-end pt-2">
                      <Button
                        onClick={handleNextQuestion}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
                      >
                        {currentQuestionIndex + 1 === selectedQuiz.questions.length
                          ? 'Finish Quiz'
                          : 'Next Question'}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Quizzes List */
            <div>
              {quizzes.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-12 text-center max-w-lg mx-auto">
                  <HelpCircle className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    No Practice Quizzes Yet
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                    Generate an interactive multiple-choice quiz from any of your notes with 1-click.
                  </p>
                  <Button
                    onClick={() => setShowGenerateModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Quiz from Note
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {quizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col justify-between shadow-xs"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                          <span>{quiz.questionCount || 0} Questions</span>
                          {quiz.score !== null && quiz.score !== undefined && (
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                              Last Score: {quiz.score}%
                            </span>
                          )}
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-1 mb-1">
                          {quiz.title}
                        </h4>
                        {quiz.note && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mb-4 flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            {quiz.note.title}
                          </div>
                        )}
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handleStartQuiz(quiz.id)}
                        className="w-full bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                      >
                        Start Quiz
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MANAGE DECKS & FLASHCARDS */}
      {!isLoading && activeTab === 'cards' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
              <button
                onClick={() => setSelectedDeck('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedDeck === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                All Cards ({flashcards.length})
              </button>
              {decks.map((deck) => (
                <button
                  key={deck.name}
                  onClick={() => setSelectedDeck(deck.name)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedDeck === deck.name
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {deck.name} ({deck.count})
                </button>
              ))}
            </div>

            <Button
              size="sm"
              onClick={() => setShowAddCardModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              New Card
            </Button>
          </div>

          {/* Cards Table */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-xs">
            {flashcards.length === 0 ? (
              <div className="py-12 text-center text-gray-500 text-sm">
                No flashcards created yet.
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {flashcards
                  .filter((c) => selectedDeck === 'all' || c.deckName === selectedDeck)
                  .map((card) => (
                    <div
                      key={card.id}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                            {card.deckName}
                          </span>
                          {card.note && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              {card.note.title}
                            </span>
                          )}
                          <span className="text-[11px] text-gray-400">
                            Repetitions: {card.repetitions} | Interval: {card.interval}d
                          </span>
                        </div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                          {card.front}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400 text-xs">
                          {card.back}
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCard(card.id)}
                        className="text-gray-400 hover:text-rose-600 shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: AI GENERATE FROM NOTE */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-200 dark:border-gray-700 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                  AI Study Generator
                </h3>
              </div>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              Select any note from your knowledge base. Antigravity will extract key concepts, create
              spaced-repetition flashcards, and build an interactive practice quiz.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Choose Source Note:
              </label>
              <select
                value={selectedNoteId}
                onChange={(e) => setSelectedNoteId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Select a note --</option>
                {notesList.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowGenerateModal(false)}
                disabled={isGenerating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerateStudyMaterials}
                disabled={!selectedNoteId || isGenerating}
                className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating Materials...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Study Set
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD FLASHCARD MANUALLY */}
      {showAddCardModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateCard}
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-200 dark:border-gray-700 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                Create Flashcard
              </h3>
              <button
                type="button"
                onClick={() => setShowAddCardModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Deck Name:
                </label>
                <Input
                  value={newDeck}
                  onChange={(e) => setNewDeck(e.target.value)}
                  placeholder="e.g. Computer Science, Languages..."
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Front (Question / Prompt):
                </label>
                <textarea
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                  placeholder="What is the difference between..."
                  rows={3}
                  className="w-full mt-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2.5 text-sm text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Back (Answer / Definition):
                </label>
                <textarea
                  value={newBack}
                  onChange={(e) => setNewBack(e.target.value)}
                  placeholder="The concise explanation..."
                  rows={3}
                  className="w-full mt-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2.5 text-sm text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddCardModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Create Card
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
