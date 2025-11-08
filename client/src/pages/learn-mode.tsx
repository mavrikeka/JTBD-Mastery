import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ChevronLeft, ChevronRight, X, Check } from "lucide-react";
import { ProgressBar } from "@/components/progress-bar";
import { jtbdExamples } from "@/data/jtbd-examples";
import { quizQuestions } from "@/data/quiz-questions";
import { JTBDExample, QuizQuestion } from "@shared/schema";
import { updateLearnProgress, saveQuizResult } from "@/lib/storage";

type LearnStage = 'intro' | 'gallery' | 'quiz' | 'summary' | 'review';

export default function LearnMode() {
  const [, setLocation] = useLocation();
  const [stage, setStage] = useState<LearnStage>('intro');
  const [currentExample, setCurrentExample] = useState(0);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string[]>>({});
  const [currentQuiz, setCurrentQuiz] = useState(0);
  const [showQuizFeedback, setShowQuizFeedback] = useState(false);

  // Load resume data or quiz result to view on mount
  useEffect(() => {
    // Check for quiz result to view
    const viewQuizData = localStorage.getItem('view-quiz-result');
    if (viewQuizData) {
      try {
        const quizResult = JSON.parse(viewQuizData);
        setQuizAnswers(quizResult.answers);
        setStage('review');
        localStorage.removeItem('view-quiz-result'); // Clear after loading
        return;
      } catch (e) {
        console.error('Failed to load quiz result:', e);
      }
    }

    // Check for resume data
    const resumeData = localStorage.getItem('resume-learn');
    if (resumeData) {
      try {
        const { currentExample: savedExample, stage: savedStage } = JSON.parse(resumeData);
        setCurrentExample(savedExample);
        setStage(savedStage);
        localStorage.removeItem('resume-learn'); // Clear after loading
      } catch (e) {
        console.error('Failed to load resume data:', e);
      }
    }
  }, []);

  // Save resume state on unmount (unless completed)
  useEffect(() => {
    return () => {
      if (stage !== 'summary') {
        localStorage.setItem('resume-learn', JSON.stringify({
          currentExample,
          stage,
        }));
      }
    };
  }, [currentExample, stage]);

  useEffect(() => {
    if (stage === 'gallery') {
      updateLearnProgress(currentExample + 1);
    }
  }, [currentExample, stage]);

  const example = jtbdExamples[currentExample];
  const quiz = quizQuestions[currentQuiz];
  const quizScore = Object.entries(quizAnswers).filter(([qId, answers]) => {
    const question = quizQuestions.find(q => q.id === parseInt(qId));
    if (!question) return false;
    const correctIds = question.options.filter(o => o.correct).map(o => o.id);
    return JSON.stringify(answers.sort()) === JSON.stringify(correctIds.sort());
  }).length;

  useEffect(() => {
    if (stage === 'summary') {
      updateLearnProgress(jtbdExamples.length, quizScore);
      // Save quiz result for Recent Work
      saveQuizResult(quizScore, quizQuestions.length, quizAnswers);
    }
  }, [stage, quizScore, quizAnswers]);

  const handleNext = () => {
    if (currentExample < jtbdExamples.length - 1) {
      setCurrentExample(currentExample + 1);
      setShowAnalysis(false);
    } else {
      setStage('quiz');
    }
  };

  const handlePrevious = () => {
    if (currentExample > 0) {
      setCurrentExample(currentExample - 1);
      setShowAnalysis(false);
    }
  };

  const handleQuizAnswer = (optionId: string) => {
    if (quiz.multiSelect) {
      const current = quizAnswers[quiz.id] || [];
      const newAnswers = current.includes(optionId)
        ? current.filter(id => id !== optionId)
        : [...current, optionId];
      setQuizAnswers({ ...quizAnswers, [quiz.id]: newAnswers });
      // Don't auto-show feedback for multi-select, wait for Submit button
    } else {
      setQuizAnswers({ ...quizAnswers, [quiz.id]: [optionId] });
      setShowQuizFeedback(true);
    }
  };

  const handleSubmitMultiSelect = () => {
    setShowQuizFeedback(true);
  };

  const handleQuizNext = () => {
    if (currentQuiz < quizQuestions.length - 1) {
      setCurrentQuiz(currentQuiz + 1);
      setShowQuizFeedback(false);
    } else {
      setStage('summary');
    }
  };

  if (stage === 'intro') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="p-4 border-b border-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/')}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </header>
        
        <div className="flex-1 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl w-full text-center space-y-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-block p-6 rounded-full bg-primary/10 border border-primary/20"
            >
              <div className="w-16 h-16 text-primary">💡</div>
            </motion.div>
            
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                Learn What Great Looks Like
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
                Before you write your first JTBD, let's train your eye.
                You'll see 10 real examples—some excellent, some terrible.
                Learn to spot the difference instantly.
              </p>
            </div>
            
            <Button
              size="lg"
              onClick={() => setStage('gallery')}
              className="px-8"
              data-testid="button-start-learning"
            >
              Start Learning →
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (stage === 'gallery') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="p-4 border-b border-border">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setStage('intro')}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <ProgressBar current={currentExample + 1} total={jtbdExamples.length} className="flex-1 max-w-md mx-8" />
            <div className="w-10" />
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentExample}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(e, info) => {
                  const swipeThreshold = 100;
                  if (info.offset.x > swipeThreshold && currentExample > 0) {
                    handlePrevious();
                  } else if (info.offset.x < -swipeThreshold && currentExample < jtbdExamples.length - 1) {
                    handleNext();
                  }
                }}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
                className="touch-none"
              >
                <ExampleCard
                  example={example}
                  showAnalysis={showAnalysis}
                  onToggleAnalysis={() => setShowAnalysis(!showAnalysis)}
                />
              </motion.div>
            </AnimatePresence>
            
            <p className="text-center text-sm text-muted-foreground mt-6">
              Swipe left or right to navigate • Tap cards to {showAnalysis ? 'hide' : 'reveal'} analysis
            </p>
            
            <div className="flex gap-4 mt-8 justify-center">
              <Button
                variant="outline"
                size="lg"
                onClick={handlePrevious}
                disabled={currentExample === 0}
                data-testid="button-previous"
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Previous
              </Button>
              <Button
                size="lg"
                onClick={handleNext}
                data-testid="button-next"
              >
                {currentExample === jtbdExamples.length - 1 ? 'Take Quiz' : 'Next'}
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'quiz') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="p-4 border-b border-border">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setStage('gallery')}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <ProgressBar current={currentQuiz + 1} total={quizQuestions.length} className="flex-1 max-w-md mx-8" />
            <div className="w-10" />
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-3xl mx-auto">
            <QuizCard
              question={quiz}
              selectedAnswers={quizAnswers[quiz.id] || []}
              onSelectAnswer={handleQuizAnswer}
              showFeedback={showQuizFeedback}
            />

            {!showQuizFeedback && quiz.multiSelect && (quizAnswers[quiz.id]?.length > 0) && (
              <div className="mt-8 flex justify-center">
                <Button
                  size="lg"
                  onClick={handleSubmitMultiSelect}
                  data-testid="button-submit-answer"
                >
                  Submit Answer
                </Button>
              </div>
            )}

            {showQuizFeedback && (
              <div className="mt-8 flex justify-center">
                <Button
                  size="lg"
                  onClick={handleQuizNext}
                  data-testid="button-quiz-next"
                >
                  {currentQuiz === quizQuestions.length - 1 ? 'See Results' : 'Next Question'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Review stage
  if (stage === 'review') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="p-4 border-b border-border">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/')}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h2 className="text-lg font-semibold">Review Your Answers</h2>
            <div className="w-10" />
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {quizQuestions.map((question, index) => {
              const userAnswers = quizAnswers[question.id] || [];
              const correctAnswers = question.options.filter(o => o.correct).map(o => o.id);
              const isCorrect = JSON.stringify(userAnswers.sort()) === JSON.stringify(correctAnswers.sort());

              return (
                <Card key={question.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground">Question {index + 1}</h3>
                    {isCorrect ? (
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-chart-3/20 border border-chart-3">
                        <Check className="w-4 h-4 text-chart-3" />
                        <span className="text-sm font-semibold text-chart-3">Correct</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/20 border border-destructive">
                        <X className="w-4 h-4 text-destructive" />
                        <span className="text-sm font-semibold text-destructive">Incorrect</span>
                      </div>
                    )}
                  </div>

                  <p className="text-foreground mb-4 whitespace-pre-line">{question.question}</p>

                  <div className="space-y-2 mb-4">
                    {question.options.map((option) => {
                      const wasSelected = userAnswers.includes(option.id);
                      const isCorrectOption = option.correct;

                      return (
                        <div
                          key={option.id}
                          className={`
                            p-3 rounded-lg border-2
                            ${isCorrectOption
                              ? 'border-chart-3 bg-chart-3/10'
                              : wasSelected && !isCorrectOption
                                ? 'border-destructive bg-destructive/10'
                                : 'border-border bg-card'
                            }
                          `}
                        >
                          <div className="flex items-start gap-3">
                            {isCorrectOption ? (
                              <Check className="w-5 h-5 text-chart-3 mt-0.5 flex-shrink-0" />
                            ) : wasSelected ? (
                              <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                            ) : (
                              <div className="w-5 h-5" />
                            )}
                            <div className="flex-1">
                              <p className={`text-foreground ${isCorrectOption ? 'font-semibold' : ''}`}>
                                {option.text}
                              </p>
                              {wasSelected && !isCorrectOption && (
                                <p className="text-sm text-destructive italic mt-1">(Your answer)</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {question.feedback && (
                    <div className="p-4 rounded-lg border-2 border-primary/30 bg-primary/5">
                      <p className="text-foreground">{question.feedback}</p>
                    </div>
                  )}
                </Card>
              );
            })}

            <div className="flex gap-4 justify-center pt-4">
              <Button
                variant="default"
                size="lg"
                onClick={() => setLocation('/')}
                data-testid="button-return-home"
              >
                Return to Menu
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  // Reset quiz and go back to examples
                  setQuizScore(0);
                  setQuizAnswers({});
                  setStage('examples');
                }}
                data-testid="button-take-quiz-again"
              >
                Take Quiz Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Summary stage
  const scorePercentage = (quizScore / quizQuestions.length) * 100;
  const getMessage = () => {
    if (scorePercentage === 100) return { title: "⭐ Pattern Master!", subtitle: "You've got the eye." };
    if (scorePercentage >= 60) return { title: "Good work!", subtitle: "You're spotting the patterns." };
    return { title: "Keep learning", subtitle: "Review the examples again." };
  };
  const message = getMessage();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-4 border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation('/')}
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </header>
      
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full text-center space-y-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-block p-6 rounded-full bg-chart-3/10 border border-chart-3/20"
          >
            <div className="w-16 h-16 text-5xl">🏆</div>
          </motion.div>
          
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">{message.title}</h1>
            <p className="text-lg text-muted-foreground">{message.subtitle}</p>
            <p className="text-3xl font-bold text-primary">Score: {quizScore}/{quizQuestions.length}</p>
          </div>
          
          <Card className="p-8 text-left bg-card/50 border-card-border">
            <h3 className="text-xl font-bold mb-4 text-foreground">Key Patterns to Remember:</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-chart-3 mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground"><span className="font-semibold text-foreground">WHAT:</span> Specific work, not vague goals</p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-chart-3 mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground"><span className="font-semibold text-foreground">HOW MUCH:</span> Metrics with before → after</p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-chart-3 mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground"><span className="font-semibold text-foreground">WHEN:</span> Clear strategic deadline</p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-chart-3 mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground"><span className="font-semibold text-foreground">BESPOKE:</span> If you can Google it, it's not a JTBD</p>
              </div>
            </div>
          </Card>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              variant="default"
              size="lg"
              onClick={() => setLocation('/')}
              data-testid="button-return-menu"
            >
              Return to Menu
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setStage('review')}
              data-testid="button-review-answers"
            >
              Review Answers
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                // Reset quiz and go back to examples
                setQuizScore(0);
                setQuizAnswers({});
                setStage('examples');
              }}
              data-testid="button-take-quiz-again"
            >
              Take Quiz Again
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function ExampleCard({ example, showAnalysis, onToggleAnalysis }: { 
  example: JTBDExample; 
  showAnalysis: boolean; 
  onToggleAnalysis: () => void;
}) {
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-card/50 border-card-border">
        <h2 className="text-2xl font-bold mb-2 text-foreground">{example.role}</h2>
        <p className="text-sm text-primary font-medium mb-4">{example.context.title}</p>
        <div className="space-y-2 text-sm">
          <p className="text-muted-foreground"><span className="font-semibold text-foreground">Company:</span> {example.context.company}</p>
          <p className="text-muted-foreground"><span className="font-semibold text-foreground">Challenge:</span> {example.context.challenge}</p>
          <p className="text-muted-foreground"><span className="font-semibold text-foreground">Priority:</span> {example.context.priority}</p>
        </div>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 border-2 border-destructive/30 bg-destructive/5 hover-elevate cursor-pointer" onClick={onToggleAnalysis} data-testid="card-bad-jtbd">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 rounded-full bg-destructive/20">
              <X className="w-5 h-5 text-destructive" />
            </div>
            <h3 className="text-lg font-bold text-destructive">Bad JTBD</h3>
          </div>
          <p className="text-foreground/70 mb-4 line-through italic">{example.badJtbd.statement}</p>
          {showAnalysis && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-2 pt-4 border-t border-destructive/20"
            >
              <p className="text-xs font-semibold text-destructive mb-2">WHY IT'S BAD:</p>
              {example.badJtbd.whyBad.map((reason, i) => (
                <p key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <X className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                  {reason}
                </p>
              ))}
            </motion.div>
          )}
        </Card>
        
        <Card className="p-6 border-2 border-chart-3/30 bg-chart-3/5 hover-elevate cursor-pointer" onClick={onToggleAnalysis} data-testid="card-good-jtbd">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 rounded-full bg-chart-3/20">
              <Check className="w-5 h-5 text-chart-3" />
            </div>
            <h3 className="text-lg font-bold text-chart-3">Good JTBD</h3>
          </div>
          <p className="text-foreground font-medium mb-4">{example.goodJtbd.statement}</p>
          {showAnalysis && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-2 pt-4 border-t border-chart-3/20"
            >
              <p className="text-xs font-semibold text-chart-3 mb-2">WHY IT'S GOOD:</p>
              {example.goodJtbd.whyGood.map((reason, i) => (
                <p key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <Check className="w-4 h-4 text-chart-3 mt-0.5 flex-shrink-0" />
                  {reason}
                </p>
              ))}
            </motion.div>
          )}
        </Card>
      </div>
      
      <p className="text-center text-sm text-muted-foreground">
        {showAnalysis ? 'Tap cards to hide analysis' : 'Tap cards to reveal analysis'}
      </p>
    </div>
  );
}

function QuizCard({ question, selectedAnswers, onSelectAnswer, showFeedback }: {
  question: QuizQuestion;
  selectedAnswers: string[];
  onSelectAnswer: (optionId: string) => void;
  showFeedback: boolean;
}) {
  const isCorrect = (optionId: string) => {
    const option = question.options.find(o => o.id === optionId);
    return option?.correct || false;
  };

  const userIsCorrect = () => {
    const correctIds = question.options.filter(o => o.correct).map(o => o.id);
    return JSON.stringify(selectedAnswers.sort()) === JSON.stringify(correctIds.sort());
  };

  return (
    <Card className="p-8">
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium text-primary mb-2">
            {question.type === 'spot-flaw' && 'Spot the Flaw'}
            {question.type === 'choose-better' && 'Choose the Better JTBD'}
            {question.type === 'missing-component' && 'Missing Component'}
            {question.type === 'google-test' && 'The Google Test'}
            {question.type === 'identify-good' && 'Identify Good Elements'}
          </p>
          <h3 className="text-xl font-bold text-foreground whitespace-pre-line">{question.question}</h3>
          {question.multiSelect && (
            <p className="text-sm text-muted-foreground mt-2">Select all that apply</p>
          )}
        </div>
        
        <div className="space-y-3">
          {question.options.map(option => {
            const isSelected = selectedAnswers.includes(option.id);
            const showCorrectness = showFeedback;
            const optionIsCorrect = isCorrect(option.id);
            
            return (
              <button
                key={option.id}
                onClick={() => !showFeedback && onSelectAnswer(option.id)}
                disabled={showFeedback && !question.multiSelect}
                className={`
                  w-full p-4 rounded-lg border-2 text-left transition-all
                  ${isSelected 
                    ? showCorrectness 
                      ? optionIsCorrect 
                        ? 'border-chart-3 bg-chart-3/10' 
                        : 'border-destructive bg-destructive/10'
                      : 'border-primary bg-primary/10'
                    : 'border-border bg-card hover-elevate'
                  }
                  ${showFeedback && !question.multiSelect ? 'cursor-not-allowed' : 'cursor-pointer'}
                `}
                data-testid={`quiz-option-${option.id}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5
                    ${isSelected
                      ? showCorrectness
                        ? optionIsCorrect
                          ? 'border-chart-3 bg-chart-3'
                          : 'border-destructive bg-destructive'
                        : 'border-primary bg-primary'
                      : 'border-muted-foreground'
                    }
                  `}>
                    {isSelected && (
                      <Check className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <p className="text-foreground flex-1">{option.text}</p>
                </div>
              </button>
            );
          })}
        </div>
        
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg border-2 ${
              userIsCorrect()
                ? 'border-chart-3 bg-chart-3/10'
                : 'border-chart-4 bg-chart-4/10'
            }`}
          >
            <p className={`font-semibold mb-2 ${userIsCorrect() ? 'text-chart-3' : 'text-chart-4'}`}>
              {userIsCorrect() ? '✓ Correct!' : 'Keep learning!'}
            </p>
            <p className="text-foreground">{question.feedback}</p>
          </motion.div>
        )}
      </div>
    </Card>
  );
}
