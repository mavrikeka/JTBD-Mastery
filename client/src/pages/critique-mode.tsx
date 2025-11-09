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
    case 'not-ready': return 'Not Ready';
    case 'needs-work': return 'Needs Work';
    case 'ready': return 'Ready to Execute';
    case 'exemplary': return 'Exemplary';
  }
}

function getComponentStatusColor(status: 'missing' | 'weak' | 'strong' | 'excellent'): string {
  switch (status) {
    case 'missing': return 'bg-red-50 text-red-700 border-red-200';
    case 'weak': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'strong': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'excellent': return 'bg-purple-50 text-purple-700 border-purple-200';
  }
}

function getOverallStatusColor(status: 'not-ready' | 'needs-work' | 'ready' | 'exemplary'): string {
  switch (status) {
    case 'not-ready': return 'bg-red-50 text-red-700 border-red-300';
    case 'needs-work': return 'bg-amber-50 text-amber-700 border-amber-300';
    case 'ready': return 'bg-emerald-50 text-emerald-700 border-emerald-300';
    case 'exemplary': return 'bg-purple-50 text-purple-700 border-purple-300';
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
      // Use 60 second timeout for Claude Sonnet 4
      const response = await apiRequest('POST', '/api/critique', request, 60000);
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
                  disabled={critiqueMutation.isPending || isViewingHistory || critique !== null}
                  data-testid="input-jtbd-statement"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  {jtbdInput.length} characters
                </p>
              </div>

              {!isViewingHistory && !critique && (
                <Button
                  variant="default"
                  size="lg"
                  onClick={handleAnalyze}
                  disabled={critiqueMutation.isPending || !jtbdInput.trim()}
                  className="w-full"
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
                  <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-4">Overall Status</h3>
                  <div className={`inline-block px-8 py-3 rounded-lg border shadow-sm ${getOverallStatusColor(critique.overallStatus)}`}>
                    <span className="text-xl font-semibold">{getOverallStatusText(critique.overallStatus)}</span>
                  </div>
                </div>

                <div className="border-t border-border my-6"></div>

                {/* Component Statuses */}
                <div className="space-y-4">
                  {/* WHAT Component */}
                  <Collapsible open={expandedWhat} onOpenChange={setExpandedWhat}>
                    <div className="border border-border rounded-lg">
                      <CollapsibleTrigger className="w-full p-5 hover:bg-accent/30 transition-colors rounded-t-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-foreground text-sm uppercase tracking-wide">What</span>
                            <span className={`px-3 py-1.5 rounded-md text-xs font-semibold border shadow-sm ${getComponentStatusColor(critique.whatStatus)}`}>
                              {getStatusText(critique.whatStatus)}
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
                      <CollapsibleTrigger className="w-full p-5 hover:bg-accent/30 transition-colors rounded-t-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-foreground text-sm uppercase tracking-wide">How Much</span>
                            <span className={`px-3 py-1.5 rounded-md text-xs font-semibold border shadow-sm ${getComponentStatusColor(critique.howMuchStatus)}`}>
                              {getStatusText(critique.howMuchStatus)}
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
                      <CollapsibleTrigger className="w-full p-5 hover:bg-accent/30 transition-colors rounded-t-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-foreground text-sm uppercase tracking-wide">When</span>
                            <span className={`px-3 py-1.5 rounded-md text-xs font-semibold border shadow-sm ${getComponentStatusColor(critique.whenStatus)}`}>
                              {getStatusText(critique.whenStatus)}
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
                    <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-lg shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <Check className="w-5 h-5 text-emerald-600" />
                        <h3 className="text-base font-semibold text-emerald-900">Improved Version</h3>
                      </div>
                      <p className="text-emerald-800 leading-relaxed text-sm">{critique.improvedVersion}</p>
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
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleReset}
                  data-testid="button-analyze-another"
                >
                  Critique Another
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
