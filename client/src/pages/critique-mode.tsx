import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ArrowLeft, Search, Loader2, Check, ChevronDown } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { CritiqueRequest, CritiqueResponse } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { updateCritiqueProgress } from "@/lib/storage";

// Helper functions for status display
function getStatusIcon(status: 'missing' | 'weak' | 'strong' | 'excellent'): string {
  switch (status) {
    case 'missing': return '❌';
    case 'weak': return '⚠️';
    case 'strong': return '✅';
    case 'excellent': return '🌟';
  }
}

function getStatusText(status: 'missing' | 'weak' | 'strong' | 'excellent'): string {
  switch (status) {
    case 'missing': return 'Missing';
    case 'weak': return 'Weak';
    case 'strong': return 'Strong';
    case 'excellent': return 'Excellent';
  }
}

function getOverallStatusText(status: 'not-ready' | 'needs-work' | 'ready' | 'exemplary'): string {
  switch (status) {
    case 'not-ready': return '❌ Not Ready';
    case 'needs-work': return '⚠️ Needs Work';
    case 'ready': return '✅ Ready to Execute';
    case 'exemplary': return '🌟 Exemplary';
  }
}

function getComponentStatusColor(status: 'missing' | 'weak' | 'strong' | 'excellent'): string {
  switch (status) {
    case 'missing': return 'bg-destructive/20 text-destructive border-destructive/40';
    case 'weak': return 'bg-chart-4/20 text-chart-4 border-chart-4/40';
    case 'strong': return 'bg-chart-3/20 text-chart-3 border-chart-3/40';
    case 'excellent': return 'bg-purple-500/20 text-purple-600 border-purple-500/40';
  }
}

function getOverallStatusColor(status: 'not-ready' | 'needs-work' | 'ready' | 'exemplary'): string {
  switch (status) {
    case 'not-ready': return 'bg-destructive/20 text-destructive border-destructive/40';
    case 'needs-work': return 'bg-chart-4/20 text-chart-4 border-chart-4/40';
    case 'ready': return 'bg-chart-3/20 text-chart-3 border-chart-3/40';
    case 'exemplary': return 'bg-purple-500/20 text-purple-600 border-purple-500/40';
  }
}

export default function CritiqueMode() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [jtbdInput, setJtbdInput] = useState("");
  const [critique, setCritique] = useState<CritiqueResponse | null>(null);
  const analyzedStatementRef = useRef<string>("");
  const [expandedWhat, setExpandedWhat] = useState(false);
  const [expandedHowMuch, setExpandedHowMuch] = useState(false);
  const [expandedWhen, setExpandedWhen] = useState(false);
  const [isViewingHistory, setIsViewingHistory] = useState(false);

  // Cache for critique results
  const critiqueCache = useRef(new Map<string, CritiqueResponse>());

  useEffect(() => {
    // Check for saved critique from Recent Work (full critique data)
    const savedCritique = localStorage.getItem('view-critique');
    if (savedCritique) {
      try {
        const data = JSON.parse(savedCritique);
        setJtbdInput(data.statement);
        setCritique(data.critique);
        analyzedStatementRef.current = data.statement;
        setIsViewingHistory(true); // Mark as viewing history (read-only mode)
        localStorage.removeItem('view-critique');
        console.log('📖 Loaded saved critique from Recent Work (read-only mode)');
      } catch (e) {
        console.error('Failed to load saved critique:', e);
      }
      return;
    }

    // Legacy: Check for old prefill (just statement, no critique)
    const prefilled = localStorage.getItem('critique-prefill');
    if (prefilled) {
      setJtbdInput(prefilled);
      localStorage.removeItem('critique-prefill');
    }
  }, []);

  const critiqueMutation = useMutation({
    mutationFn: async (request: CritiqueRequest) => {
      console.log('🚀 Sending request to API...');
      const response = await apiRequest('POST', '/api/critique', request);
      const data = await response.json();
      console.log('📦 Parsed JSON data:', data);
      return { data: data as CritiqueResponse, statement: request.jtbdStatement };
    },
    onSuccess: ({ data, statement }) => {
      console.log('✅ Critique data received:', data);
      console.log('Overall status:', data.overallStatus);
      console.log('Component statuses:', data.whatStatus, data.howMuchStatus, data.whenStatus);

      // Cache the result
      const cacheKey = statement.trim();
      critiqueCache.current.set(cacheKey, data);

      setCritique(data);
      if (analyzedStatementRef.current) {
        updateCritiqueProgress(analyzedStatementRef.current, data);
      }
      toast({
        title: "Analysis complete",
        description: `Status: ${getOverallStatusText(data.overallStatus)}`,
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

    // Check cache first
    const cacheKey = jtbdInput.trim();
    if (critiqueCache.current.has(cacheKey)) {
      const cached = critiqueCache.current.get(cacheKey)!;
      console.log('✨ Using cached critique result');
      setCritique(cached);
      analyzedStatementRef.current = jtbdInput;
      toast({
        title: "Analysis complete (cached)",
        description: `Status: ${getOverallStatusText(cached.overallStatus)}`,
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
    setIsViewingHistory(false);
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
                  disabled={critiqueMutation.isPending || isViewingHistory}
                  data-testid="input-jtbd-statement"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  {jtbdInput.length} characters
                </p>
              </div>

              {!isViewingHistory && (
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
              )}
            </div>
          </Card>

          {critique && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="p-8">
                {/* Overall Status */}
                <div className="text-center mb-8">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Overall Status</h3>
                  <div className={`inline-block px-6 py-3 rounded-full border-2 ${getOverallStatusColor(critique.overallStatus)}`}>
                    <span className="text-lg font-bold">{getOverallStatusText(critique.overallStatus)}</span>
                  </div>
                </div>

                <div className="border-t border-border my-6"></div>

                {/* Component Statuses */}
                <div className="space-y-4">
                  {/* WHAT Component */}
                  <Collapsible open={expandedWhat} onOpenChange={setExpandedWhat}>
                    <div className="border border-border rounded-lg">
                      <CollapsibleTrigger className="w-full p-4 hover:bg-accent/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-foreground">WHAT</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getComponentStatusColor(critique.whatStatus)}`}>
                              {getStatusIcon(critique.whatStatus)} {getStatusText(critique.whatStatus)}
                            </span>
                          </div>
                          <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${expandedWhat ? 'rotate-180' : ''}`} />
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="p-4 border-t border-border bg-accent/20">
                          <p className="text-sm font-semibold text-foreground mb-2">Feedback:</p>
                          <p className="text-sm text-muted-foreground mb-4">{critique.whatFeedback}</p>
                          {critique.whatSuggestions && critique.whatSuggestions.length > 0 && (
                            <>
                              <p className="text-sm font-semibold text-foreground mb-2">Suggestions:</p>
                              <ul className="space-y-1">
                                {critique.whatSuggestions.map((suggestion, index) => (
                                  <li key={index} className="text-sm text-muted-foreground">• {suggestion}</li>
                                ))}
                              </ul>
                            </>
                          )}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>

                  {/* HOW MUCH Component */}
                  <Collapsible open={expandedHowMuch} onOpenChange={setExpandedHowMuch}>
                    <div className="border border-border rounded-lg">
                      <CollapsibleTrigger className="w-full p-4 hover:bg-accent/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-foreground">HOW MUCH</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getComponentStatusColor(critique.howMuchStatus)}`}>
                              {getStatusIcon(critique.howMuchStatus)} {getStatusText(critique.howMuchStatus)}
                            </span>
                          </div>
                          <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${expandedHowMuch ? 'rotate-180' : ''}`} />
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="p-4 border-t border-border bg-accent/20">
                          <p className="text-sm font-semibold text-foreground mb-2">Feedback:</p>
                          <p className="text-sm text-muted-foreground mb-4">{critique.howMuchFeedback}</p>
                          {critique.howMuchSuggestions && critique.howMuchSuggestions.length > 0 && (
                            <>
                              <p className="text-sm font-semibold text-foreground mb-2">Suggestions:</p>
                              <ul className="space-y-1">
                                {critique.howMuchSuggestions.map((suggestion, index) => (
                                  <li key={index} className="text-sm text-muted-foreground">• {suggestion}</li>
                                ))}
                              </ul>
                            </>
                          )}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>

                  {/* WHEN Component */}
                  <Collapsible open={expandedWhen} onOpenChange={setExpandedWhen}>
                    <div className="border border-border rounded-lg">
                      <CollapsibleTrigger className="w-full p-4 hover:bg-accent/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-foreground">WHEN</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getComponentStatusColor(critique.whenStatus)}`}>
                              {getStatusIcon(critique.whenStatus)} {getStatusText(critique.whenStatus)}
                            </span>
                          </div>
                          <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${expandedWhen ? 'rotate-180' : ''}`} />
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="p-4 border-t border-border bg-accent/20">
                          <p className="text-sm font-semibold text-foreground mb-2">Feedback:</p>
                          <p className="text-sm text-muted-foreground mb-4">{critique.whenFeedback}</p>
                          {critique.whenSuggestions && critique.whenSuggestions.length > 0 && (
                            <>
                              <p className="text-sm font-semibold text-foreground mb-2">Suggestions:</p>
                              <ul className="space-y-1">
                                {critique.whenSuggestions.map((suggestion, index) => (
                                  <li key={index} className="text-sm text-muted-foreground">• {suggestion}</li>
                                ))}
                              </ul>
                            </>
                          )}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                </div>

                {/* Improved Version */}
                {critique.improvedVersion && (
                  <>
                    <div className="border-t border-border my-6"></div>
                    <div className="bg-chart-3/10 border-l-4 border-chart-3 p-4 rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <Check className="w-5 h-5 text-chart-3" />
                        <h3 className="text-lg font-bold text-foreground">✨ Improved Version:</h3>
                      </div>
                      <p className="text-foreground leading-relaxed">{critique.improvedVersion}</p>
                    </div>
                  </>
                )}
              </Card>

              <div className="flex gap-4 justify-center">
                <Button
                  variant="default"
                  size="lg"
                  onClick={() => setLocation('/')}
                  data-testid="button-return-menu"
                >
                  Return to Menu
                </Button>
                {!isViewingHistory && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleReset}
                    data-testid="button-analyze-another"
                  >
                    Analyze Another
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
