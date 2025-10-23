import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Search, Loader2, Check, X, AlertCircle } from "lucide-react";
import { ScoreRing } from "@/components/score-ring";
import { apiRequest } from "@/lib/queryClient";
import { CritiqueRequest, CritiqueResponse } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { updateCritiqueProgress } from "@/lib/storage";

export default function CritiqueMode() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [jtbdInput, setJtbdInput] = useState("");
  const [critique, setCritique] = useState<CritiqueResponse | null>(null);
  const analyzedStatementRef = useRef<string>("");

  const critiqueMutation = useMutation({
    mutationFn: async (request: CritiqueRequest) => {
      console.log('🚀 Sending request to API...');
      const response = await apiRequest('POST', '/api/critique', request);
      const data = await response.json();
      console.log('📦 Parsed JSON data:', data);
      return data as CritiqueResponse;
    },
    onSuccess: (data) => {
      console.log('✅ Critique data received:', data);
      console.log('Overall score:', data.overallScore);
      console.log('Component scores:', data.whatScore, data.howMuchScore, data.whenScore);
      setCritique(data);
      if (analyzedStatementRef.current) {
        updateCritiqueProgress(analyzedStatementRef.current, data);
      }
      toast({
        title: "Analysis complete",
        description: `Overall score: ${data.overallScore}/100`,
      });
    },
    onError: (error: any) => {
      analyzedStatementRef.current = "";
      toast({
        title: "Analysis failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleAnalyze = () => {
    if (!jtbdInput.trim()) {
      toast({
        title: "Input required",
        description: "Please enter a JTBD statement to analyze",
        variant: "destructive",
      });
      return;
    }
    console.log('🔥 Starting critique request...');
    console.log('JTBD input:', jtbdInput);
    analyzedStatementRef.current = jtbdInput;
    critiqueMutation.mutate({ jtbdStatement: jtbdInput });
  };

  const handleReset = () => {
    setJtbdInput("");
    setCritique(null);
    analyzedStatementRef.current = "";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-4 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/')}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" }}
              className="inline-block p-6 rounded-full bg-primary/10 border border-primary/20 mb-6"
            >
              <Search className="w-12 h-12 text-primary" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Critique Your JTBD
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Paste or type your JTBD statement below and get instant AI-powered feedback on all three components
            </p>
          </div>

          <Card className="p-8 bg-card/50 border-card-border">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Your JTBD Statement
                </label>
                <Textarea
                  value={jtbdInput}
                  onChange={(e) => setJtbdInput(e.target.value)}
                  placeholder='Example: "Implement lean manufacturing and Six Sigma quality control systems across all production lines, reducing defect rate from 4.5% to 1.2% and eliminating $2.1M in annual losses by December 2026"'
                  rows={6}
                  className="w-full"
                  disabled={critiqueMutation.isPending}
                  data-testid="input-jtbd-statement"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  {jtbdInput.length} characters
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="default"
                  size="lg"
                  onClick={handleAnalyze}
                  disabled={critiqueMutation.isPending || !jtbdInput.trim()}
                  className="flex-1"
                  data-testid="button-analyze"
                >
                  {critiqueMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-2" />
                      Analyze JTBD
                    </>
                  )}
                </Button>
                {critique && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleReset}
                    data-testid="button-reset"
                  >
                    New Analysis
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {critique && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-6 text-foreground">Analysis Results</h2>
                <div className="flex justify-center mb-8">
                  <ScoreRing
                    score={critique.overallScore}
                    size={160}
                    strokeWidth={12}
                    label="Overall Score"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <ComponentScoreCard
                  title="WHAT"
                  score={critique.whatScore}
                  feedback={critique.whatFeedback}
                />
                <ComponentScoreCard
                  title="HOW MUCH"
                  score={critique.howMuchScore}
                  feedback={critique.howMuchFeedback}
                />
                <ComponentScoreCard
                  title="WHEN"
                  score={critique.whenScore}
                  feedback={critique.whenFeedback}
                />
              </div>

              {critique.suggestions && critique.suggestions.length > 0 && (
                <Card className="p-8 bg-primary/5 border-primary/20">
                  <h3 className="text-xl font-bold mb-4 text-foreground flex items-center gap-2">
                    <AlertCircle className="w-6 h-6 text-primary" />
                    Suggestions for Improvement
                  </h3>
                  <ul className="space-y-3">
                    {critique.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-primary">{index + 1}</span>
                        </div>
                        <p className="text-foreground">{suggestion}</p>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {critique.improvedVersion && (
                <Card className="p-8 bg-gradient-to-br from-chart-3/5 to-primary/5 border-chart-3/20">
                  <div className="flex items-center gap-2 mb-4">
                    <Check className="w-6 h-6 text-chart-3" />
                    <h3 className="text-xl font-bold text-foreground">Improved Version</h3>
                  </div>
                  <p className="text-lg text-foreground leading-relaxed">
                    {critique.improvedVersion}
                  </p>
                </Card>
              )}

              <div className="flex gap-4 justify-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setLocation('/')}
                  data-testid="button-return-menu"
                >
                  Return to Menu
                </Button>
                <Button
                  variant="default"
                  size="lg"
                  onClick={handleReset}
                  data-testid="button-analyze-another"
                >
                  Analyze Another
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function ComponentScoreCard({
  title,
  score,
  feedback,
}: {
  title: string;
  score: number;
  feedback: string;
}) {
  const getIcon = (score: number) => {
    if (score >= 80) return <Check className="w-6 h-6 text-chart-3" />;
    if (score >= 60) return <AlertCircle className="w-6 h-6 text-chart-4" />;
    return <X className="w-6 h-6 text-destructive" />;
  };

  const getColor = (score: number) => {
    if (score >= 80) return "border-chart-3/30 bg-chart-3/5";
    if (score >= 60) return "border-chart-4/30 bg-chart-4/5";
    return "border-destructive/30 bg-destructive/5";
  };

  return (
    <Card className={`p-6 ${getColor(score)}`}>
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        {getIcon(score)}
      </div>
      <div className="mb-4">
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-3xl font-bold text-foreground">{score}</span>
          <span className="text-sm text-muted-foreground">/100</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              score >= 80 ? 'bg-chart-3' : score >= 60 ? 'bg-chart-4' : 'bg-destructive'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{feedback}</p>
    </Card>
  );
}
