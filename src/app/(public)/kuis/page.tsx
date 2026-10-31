'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  answer_key: string;
  explanation: string;
}

export default function Kuis() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => { loadQuiz(); }, []);

  async function loadQuiz() {
    try {
      const res = await fetch('/api/quiz');
      if (!res.ok) throw new Error('Failed');
      const data = (await res.json()) as { questions: QuizQuestion[] };
      setQuestions(data.questions);
    } finally {
      setLoading(false);
    }
  }

  function handleAnswer(answer: string) {
    const current = questions[currentIndex];
    if (!current) return;
    setSelectedAnswer(answer);
    setShowExplanation(true);
    if (answer === current.answer_key) setScore(score + 1);
  }

  function nextQuestion() {
    setSelectedAnswer(null);
    setShowExplanation(false);
    setCurrentIndex(currentIndex + 1);
  }

  function resetQuiz() {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    loadQuiz();
  }

  if (loading) return <p className="p-6">Memuat...</p>;
  if (questions.length === 0) return <div className="p-6"><p>Belum ada kuis tersedia.</p><Link href="/konten" className="mt-4 inline-block text-primary-700 underline">Kembali</Link></div>;

  const isFinished = currentIndex >= questions.length;
  if (isFinished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="mx-auto max-w-2xl space-y-6 p-6">
        <div className="rounded-md border border-success-200 bg-success-50 p-6 text-center">
          <h1 className="text-h1 font-bold">Kuis Selesai!</h1>
          <p className="mt-4 text-h2">Skor: {score}/{questions.length} ({pct}%)</p>
        </div>
        <p className="text-body-sm text-neutral-600">✓ Kuis ini tidak menyimpan identitas Anda.</p>
        <div className="flex gap-3">
          <Button onClick={resetQuiz}>Coba Lagi</Button>
          <Link href="/konten"><Button variant="secondary">Konten Edukasi</Button></Link>
        </div>
      </div>
    );
  }

  const current = questions[currentIndex];
  if (!current) return <p className="p-6">Error: soal tidak ditemukan</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Link href="/konten" className="text-body-sm text-neutral-600 hover:text-primary-700">← Kembali</Link>
        <p className="text-body-sm">Soal {currentIndex + 1}/{questions.length}</p>
      </div>

      <div className="space-y-4 rounded-md border border-neutral-200 bg-surface p-6">
        <h2 className="text-h2 font-semibold">{current.question}</h2>

        <ul className="space-y-2">
          {current.options.map((opt, i) => {
            const letter = String.fromCharCode(65 + i);
            const isSelected = selectedAnswer === letter;
            const isCorrect = letter === current.answer_key;
            let cls = 'w-full rounded-md border p-3 text-left';
            if (!showExplanation) cls += isSelected ? ' border-primary-700 bg-primary-50' : ' border-neutral-200';
            else if (isCorrect) cls += ' border-success-700 bg-success-50';
            else if (isSelected) cls += ' border-danger-700 bg-danger-50';
            else cls += ' border-neutral-200';

            return (
              <li key={i}>
                <button onClick={() => !showExplanation && handleAnswer(letter)} disabled={showExplanation} className={cls}>
                  {letter}. {opt}
                </button>
              </li>
            );
          })}
        </ul>

        {showExplanation && (
          <div className="mt-4 rounded-md border border-primary-200 bg-primary-50 p-4">
            <p className="font-semibold">{selectedAnswer === current.answer_key ? '✓ Benar!' : '✗ Jawaban: ' + current.answer_key}</p>
            <p className="mt-2 text-body-sm">{current.explanation}</p>
          </div>
        )}
      </div>

      {showExplanation && <Button onClick={nextQuestion}>{currentIndex < questions.length - 1 ? 'Berikutnya' : 'Selesai'}</Button>}
      <p className="text-body-sm text-neutral-600">Tidak ada pencatatan identitas.</p>
    </div>
  );
}
