import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Lightbulb, Hammer, Search, History, Clock, ChevronDown } from "lucide-react";
import { ModeCard } from "@/components/mode-card";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { UserProgress, BuiltJTBD, QuizResult } from "@shared/schema";
import { getProgress, getBuiltJTBDs, getCritiques, getQuizResults } from "@/lib/storage";

export default function Home() {
  const [, setLocation] = useLocation();
  const [progress, setProgress] = useState<UserProgress>({
    learnMode: { completed: false, examplesViewed: 0 },
    buildMode: { completed: false, jtbdsCreated: 0 },
    critiqueMode: { completed: false, jtbdsCritiqued: 0 },
  });
  const [builtJTBDs, setBuiltJTBDs] = useState<BuiltJTBD[]>([]);
  const [critiques, setCritiques] = useState<Array<{statement: string, critique: any, timestamp: string}>>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [builtJTBDsOpen, setBuiltJTBDsOpen] = useState(true);
  const [critiquesOpen, setCritiquesOpen] = useState(true);
  const [quizResultsOpen, setQuizResultsOpen] = useState(true);

  useEffect(() => {
    // Initial load
    setProgress(getProgress());
    setBuiltJTBDs(getBuiltJTBDs().slice(-3).reverse()); // Last 3, most recent first
    setCritiques(getCritiques().slice(-3).reverse()); // Last 3, most recent first
    setQuizResults(getQuizResults().slice(-3).reverse()); // Last 3, most recent first

    // Auto-refresh every 2 seconds
    const interval = setInterval(() => {
      setProgress(getProgress());
      setBuiltJTBDs(getBuiltJTBDs().slice(-3).reverse());
      setCritiques(getCritiques().slice(-3).reverse());
      setQuizResults(getQuizResults().slice(-3).reverse());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-foreground">
            JTBD Mastery Studio
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Master the art of writing excellent Jobs-to-be-Done statements through interactive learning
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <ModeCard
              icon={Lightbulb}
              title="LEARN"
              description="Train your eye to recognize excellent vs terrible JTBDs through 10 real examples and pattern recognition"
              completed={progress.learnMode.completed}
              progress={progress.learnMode.examplesViewed > 0 
                ? `${progress.learnMode.examplesViewed}/10 examples viewed`
                : undefined
              }
              onClick={() => setLocation('/learn')}
              testId="mode-learn"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ModeCard
              icon={Hammer}
              title="BUILD"
              description="Create your first JTBD with step-by-step guidance and AI-powered suggestions for each component"
              completed={progress.buildMode.completed}
              progress={progress.buildMode.jtbdsCreated > 0
                ? `${progress.buildMode.jtbdsCreated} JTBD${progress.buildMode.jtbdsCreated > 1 ? 's' : ''} created`
                : undefined
              }
              onClick={() => setLocation('/build')}
              testId="mode-build"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <ModeCard
              icon={Search}
              title="CRITIQUE"
              description="Get instant AI analysis and detailed feedback on existing JTBD statements with component-by-component scoring"
              completed={progress.critiqueMode.completed}
              progress={progress.critiqueMode.jtbdsCritiqued > 0
                ? `${progress.critiqueMode.jtbdsCritiqued} JTBD${progress.critiqueMode.jtbdsCritiqued > 1 ? 's' : ''} critiqued`
                : undefined
              }
              onClick={() => setLocation('/critique')}
              testId="mode-critique"
            />
          </motion.div>
        </div>

        {(builtJTBDs.length > 0 || critiques.length > 0 || quizResults.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <div className="flex items-center gap-2 mb-6">
              <History className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Your Recent Work</h2>
            </div>

            <div className="space-y-4">
              {builtJTBDs.length > 0 && (
                <Collapsible open={builtJTBDsOpen} onOpenChange={setBuiltJTBDsOpen}>
                  <Card className="bg-card/50 border-card-border overflow-hidden">
                    <CollapsibleTrigger className="w-full p-6 hover:bg-accent/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Hammer className="w-5 h-5 text-primary" />
                          <h3 className="text-lg font-semibold text-foreground">Built JTBDs</h3>
                          <span className="text-sm text-muted-foreground">({builtJTBDs.length})</span>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${builtJTBDsOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="px-6 pb-6 space-y-3">
                        {builtJTBDs.map((jtbd, index) => (
                          <div
                            key={index}
                            className="p-3 rounded-lg bg-background border border-border hover-elevate cursor-pointer"
                            onClick={() => {
                              // Store the JTBD data and navigate to build review page
                              localStorage.setItem('build-review-data', JSON.stringify(jtbd));
                              setLocation('/build?stage=review');
                            }}
                          >
                            <p className="text-sm text-foreground line-clamp-2">{jtbd.assembled}</p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>{jtbd.timestamp ? new Date(jtbd.timestamp).toLocaleDateString() : jtbd.scenarioId}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              )}

              {critiques.length > 0 && (
                <Collapsible open={critiquesOpen} onOpenChange={setCritiquesOpen}>
                  <Card className="bg-card/50 border-card-border overflow-hidden">
                    <CollapsibleTrigger className="w-full p-6 hover:bg-accent/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Search className="w-5 h-5 text-primary" />
                          <h3 className="text-lg font-semibold text-foreground">Critiqued JTBDs</h3>
                          <span className="text-sm text-muted-foreground">({critiques.length})</span>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${critiquesOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="px-6 pb-6 space-y-3">
                        {critiques.map((item, index) => (
                          <div
                            key={index}
                            className="p-3 rounded-lg bg-background border border-border hover-elevate cursor-pointer"
                            onClick={() => {
                              localStorage.setItem('critique-prefill', item.statement);
                              setLocation('/critique');
                            }}
                          >
                            <p className="text-sm text-foreground line-clamp-2">{item.statement}</p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <span className="font-semibold text-primary capitalize">Status: {item.critique.overallStatus || 'needs-work'}</span>
                              {item.timestamp && (
                                <>
                                  <Clock className="w-3 h-3 ml-auto" />
                                  <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              )}

              {quizResults.length > 0 && (
                <Collapsible open={quizResultsOpen} onOpenChange={setQuizResultsOpen}>
                  <Card className="bg-card/50 border-card-border overflow-hidden">
                    <CollapsibleTrigger className="w-full p-6 hover:bg-accent/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="w-5 h-5 text-primary" />
                          <h3 className="text-lg font-semibold text-foreground">Quiz Results</h3>
                          <span className="text-sm text-muted-foreground">({quizResults.length})</span>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${quizResultsOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="px-6 pb-6 space-y-3">
                        {quizResults.map((result, index) => {
                          const percentage = Math.round((result.score / result.totalQuestions) * 100);
                          const scoreColor = percentage >= 80 ? 'text-chart-3' : percentage >= 60 ? 'text-primary' : 'text-destructive';
                          const bgColor = percentage >= 80 ? 'bg-chart-3/20 border-chart-3' : percentage >= 60 ? 'bg-primary/20 border-primary' : 'bg-destructive/20 border-destructive';

                          return (
                            <div
                              key={index}
                              className="p-3 rounded-lg bg-background border border-border hover-elevate cursor-pointer"
                              onClick={() => {
                                localStorage.setItem('view-quiz-result', JSON.stringify(result));
                                setLocation('/learn');
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-foreground">
                                  Quiz Score: {result.score}/{result.totalQuestions} ({percentage}%)
                                </p>
                                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${bgColor}`}>
                                  <span className={`text-sm font-bold ${scoreColor}`}>{percentage}%</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                <span>{new Date(result.timestamp).toLocaleDateString()}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              )}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <div className="inline-block px-6 py-3 rounded-full bg-primary/10 border border-primary/20">
            <p className="text-sm font-medium text-primary">
              💡 Tip: Start with LEARN to build pattern recognition, then BUILD your own
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
