import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, X, Lightbulb, Loader2, ChevronDown, Info } from "lucide-react";
import { ProgressBar } from "@/components/progress-bar";
import { buildScenarios } from "@/data/build-scenarios";
import { BuildScenario, SuggestionRequest, SuggestionResponse } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { updateBuildProgress } from "@/lib/storage";
import { apiRequest } from "@/lib/queryClient";

type BuildStage = 'intro' | 'scenarios' | 'context' | 'what' | 'metrics' | 'when' | 'review';

interface BuildData {
  scenarioId: string;
  what: string;
  metrics: Array<{ name: string; current: string; target: string }>;
  when: string;
}

export default function BuildMode() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [stage, setStage] = useState<BuildStage>('intro');
  const [selectedScenario, setSelectedScenario] = useState<BuildScenario | null>(null);
  const [buildData, setBuildData] = useState<BuildData>({
    scenarioId: '',
    what: '',
    metrics: [],
    when: '',
  });
  const [showHints, setShowHints] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [polishedStatement, setPolishedStatement] = useState('');

  // Cache for API suggestions
  const suggestionsCache = useRef(new Map<string, string[]>());

  // Clear cache on unmount
  useEffect(() => {
    return () => {
      suggestionsCache.current.clear();
    };
  }, []);

  // Reset AI suggestions state when stage changes
  useEffect(() => {
    setShowHints(false);
    setAiSuggestions([]);
  }, [stage]);

  // Helper function to get suggestions with caching
  const getSuggestions = (request: SuggestionRequest) => {
    const cacheKey = JSON.stringify(request);

    // Check cache first
    if (suggestionsCache.current.has(cacheKey)) {
      const cached = suggestionsCache.current.get(cacheKey)!;
      setAiSuggestions(cached);
      setShowHints(true);
      return;
    }

    // Make API call if not cached
    suggestionsMutation.mutate(request);
  };

  // Check if loading a saved JTBD from Recent Work
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const stageParam = urlParams.get('stage');

    if (stageParam === 'review') {
      try {
        const savedData = localStorage.getItem('build-review-data');
        if (savedData) {
          const jtbd = JSON.parse(savedData);
          const scenario = buildScenarios.find(s => s.id === jtbd.scenarioId);

          if (scenario) {
            setSelectedScenario(scenario);
            setBuildData({
              scenarioId: jtbd.scenarioId,
              what: jtbd.what,
              metrics: jtbd.metrics,
              when: jtbd.when,
            });
            setPolishedStatement(jtbd.assembled);
            setStage('review');
          }

          // Clean up
          localStorage.removeItem('build-review-data');
        }
      } catch (e) {
        console.error('Failed to load saved JTBD:', e);
      }
    }
  }, []);

  const suggestionsMutation = useMutation({
    mutationFn: async (request: SuggestionRequest) => {
      const response = await apiRequest('POST', '/api/suggestions', request);
      const data = await response.json();
      return { data: data as SuggestionResponse, request };
    },
    onSuccess: ({ data, request }) => {
      // Cache the result
      const cacheKey = JSON.stringify(request);
      suggestionsCache.current.set(cacheKey, data.suggestions);

      // Update UI
      setAiSuggestions(data.suggestions);
      setShowHints(true);
    },
    onError: (error: any) => {
      toast({
        title: "Suggestions unavailable",
        description: error.message || "Using preset hints instead",
        variant: "destructive",
      });
      setShowHints(true);
    },
  });

  const polishMutation = useMutation({
    mutationFn: async (rawStatement: string) => {
      const response = await apiRequest('POST', '/api/polish-jtbd', { rawStatement });
      const data = await response.json();
      return data.polishedStatement as string;
    },
    onSuccess: (polished) => {
      setPolishedStatement(polished);
    },
    onError: (error: any) => {
      toast({
        title: "Polish failed",
        description: error.message || "Using raw statement instead",
        variant: "destructive",
      });
      // Fallback to raw assembled statement
      setPolishedStatement(assembledJTBD);
    },
  });

  const handleScenarioSelect = (scenario: BuildScenario) => {
    setSelectedScenario(scenario);
    setBuildData({ ...buildData, scenarioId: scenario.id });
    setStage('context');
  };

  const handleAddMetric = () => {
    setBuildData({
      ...buildData,
      metrics: [...buildData.metrics, { name: '', current: '', target: '' }],
    });
  };

  const handleRemoveMetric = (index: number) => {
    setBuildData({
      ...buildData,
      metrics: buildData.metrics.filter((_, i) => i !== index),
    });
  };

  const handleMetricChange = (index: number, field: string, value: string) => {
    const newMetrics = [...buildData.metrics];
    newMetrics[index] = { ...newMetrics[index], [field]: value };
    setBuildData({ ...buildData, metrics: newMetrics });
  };

  const assembledJTBD = buildData.what && buildData.metrics.length > 0 && buildData.when
    ? `${buildData.what}, ${buildData.metrics.map(m => `${m.name} from ${m.current} to ${m.target}`).join(', ')}, by ${buildData.when}`
    : '';

  useEffect(() => {
    if (stage === 'review' && assembledJTBD) {
      // Save progress
      updateBuildProgress({
        scenarioId: buildData.scenarioId,
        what: buildData.what,
        metrics: buildData.metrics,
        when: buildData.when,
        assembled: assembledJTBD,
      });

      // Auto-polish the statement
      if (!polishedStatement && !polishMutation.isPending) {
        polishMutation.mutate(assembledJTBD);
      }
    }
  }, [stage, assembledJTBD]);

  if (stage === 'intro') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="p-4 border-b border-border">
          <Button variant="ghost" size="icon" onClick={() => setLocation('/')} data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </header>
        
        <div className="flex-1 flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl w-full text-center space-y-8">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }} className="inline-block p-6 rounded-full bg-primary/10 border border-primary/20">
              <div className="w-16 h-16 text-5xl">🔨</div>
            </motion.div>
            
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">Build Your First JTBD</h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
                The hardest part is starting from a blank page. We'll guide you step-by-step through the process.
                <br/><br/>
                You'll answer questions about the business context, the work to be done, how success is measured, and when it must be complete.
                <br/><br/>
                Then our AI will help you refine it until it's excellent.
              </p>
            </div>
            
            <Button size="lg" variant="primary" onClick={() => setStage('scenarios')} className="px-8" data-testid="button-choose-scenario">
              Choose a Scenario →
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (stage === 'scenarios') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="p-4 border-b border-border">
          <div className="max-w-6xl mx-auto">
            <Button variant="ghost" size="icon" onClick={() => setStage('intro')} data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-2 text-center text-foreground">Choose Your Challenge</h2>
            <p className="text-muted-foreground text-center mb-8">Select a scenario to build your JTBD</p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {buildScenarios.map((scenario) => (
                <ScenarioCard key={scenario.id} scenario={scenario} onSelect={() => handleScenarioSelect(scenario)} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'context' && selectedScenario) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="p-4 border-b border-border">
          <div className="max-w-4xl mx-auto">
            <Button variant="ghost" size="icon" onClick={() => setStage('scenarios')} data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2 text-foreground">{selectedScenario.role}</h2>
              <p className="text-primary font-medium">{selectedScenario.challenge}</p>
            </div>
            
            <Card className="p-8 bg-card/50 border-card-border">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-primary mb-2">YOUR ROLE</h3>
                  <p className="text-lg font-bold text-foreground">{selectedScenario.role}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-primary mb-2">COMPANY</h3>
                  <p className="text-foreground">{selectedScenario.context.company}</p>
                  <p className="text-sm text-muted-foreground mt-1">{selectedScenario.context.size}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-primary mb-3">THE SITUATION</h3>
                  <ul className="space-y-2">
                    {selectedScenario.context.situation.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span className="text-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="pt-4 border-t border-border">
                  <h3 className="text-sm font-semibold text-primary mb-2">YOUR VALUE AGENDA</h3>
                  <p className="text-foreground font-medium">{selectedScenario.context.valueAgenda}</p>
                </div>
              </div>
            </Card>
            
            <div className="flex justify-center">
              <Button size="lg" variant="primary" onClick={() => setStage('what')} data-testid="button-start-building">
                Start Building JTBD →
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentStep = stage === 'what' ? 1 : stage === 'metrics' ? 2 : stage === 'when' ? 3 : 4;

  if (stage === 'what' && selectedScenario) {
    return (
      <BuildStepLayout
        step={currentStep}
        scenario={selectedScenario}
        onBack={() => setStage('context')}
        onNext={() => setStage('metrics')}
        nextDisabled={!buildData.what.trim()}
      >
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2 text-foreground">What work needs to be done?</h2>
            <p className="text-muted-foreground">Think about the actual work, not just desired outcomes. Use action verbs.</p>
          </div>
          
          <Card className="p-6 bg-chart-4/5 border-chart-4/20">
            <p className="text-sm font-semibold text-chart-4 mb-2">⚠️ AVOID VAGUE VERBS:</p>
            <p className="text-muted-foreground">"Improve", "Enhance", "Drive", "Lead" are too vague</p>
          </Card>
          
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Describe the specific work</label>
            <Textarea
              value={buildData.what}
              onChange={(e) => setBuildData({ ...buildData, what: e.target.value })}
              placeholder="e.g., Implement lean manufacturing and Six Sigma quality control systems..."
              rows={4}
              className="w-full"
              data-testid="input-what"
            />
            <p className="text-sm text-muted-foreground mt-2">
              {buildData.what.length} characters {buildData.what.length < 50 ? '- keep going...' : '✓ Good length'}
            </p>
          </div>
          
          <Button
            variant="outline"
            onClick={() => {
              if (showHints) {
                setShowHints(false);
              } else {
                getSuggestions({
                  scenarioId: selectedScenario.id,
                  step: 'what',
                  currentInput: buildData.what,
                });
              }
            }}
            className="w-full"
            disabled={suggestionsMutation.isPending}
            data-testid="button-show-hints"
          >
            {suggestionsMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Getting AI Suggestions...
              </>
            ) : (
              <>
                <Lightbulb className="w-4 h-4 mr-2" />
                {showHints ? 'Hide' : 'Get'} AI Suggestions
              </>
            )}
          </Button>
          
          {showHints && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
              <p className="text-sm font-medium text-primary mb-2">
                {aiSuggestions.length > 0 ? 'AI-Generated Suggestions:' : 'Preset Hints:'}
              </p>
              {(aiSuggestions.length > 0 ? aiSuggestions : selectedScenario.hints.what).map((hint, i) => (
                <Card
                  key={i}
                  className="p-4 hover-elevate cursor-pointer"
                  onClick={() => setBuildData({ ...buildData, what: hint })}
                  data-testid={`hint-what-${i}`}
                >
                  <p className="text-foreground text-sm">{hint}</p>
                </Card>
              ))}
            </motion.div>
          )}
        </div>
      </BuildStepLayout>
    );
  }

  if (stage === 'metrics' && selectedScenario) {
    return (
      <BuildStepLayout
        step={currentStep}
        scenario={selectedScenario}
        onBack={() => setStage('what')}
        onNext={() => setStage('when')}
        nextDisabled={buildData.metrics.length === 0 || buildData.metrics.some(m => !m.name || !m.current || !m.target)}
      >
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2 text-foreground">How will you measure success?</h2>
            <p className="text-muted-foreground">Every JTBD needs metrics with BEFORE and AFTER values.</p>
          </div>

          <Card className="p-6 bg-primary/5 border-primary/20">
            <p className="text-sm font-semibold text-primary mb-2">💡 TIP:</p>
            <p className="text-muted-foreground">Format: "From X to Y" - Example: "Defect rate from 4.5% to 1.2%"</p>
          </Card>

          <div className="space-y-4">
            {buildData.metrics.map((metric, index) => (
              <Card key={index} className="p-4 bg-card/50">
                <div className="flex justify-between items-start mb-3">
                  <p className="text-sm font-medium text-foreground">Metric {index + 1}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveMetric(index)}
                    className="h-6 w-6"
                    data-testid={`button-remove-metric-${index}`}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid gap-3">
                  <Input
                    value={metric.name}
                    onChange={(e) => handleMetricChange(index, 'name', e.target.value)}
                    placeholder="What are you measuring? (e.g., Defect rate)"
                    data-testid={`input-metric-name-${index}`}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      value={metric.current}
                      onChange={(e) => handleMetricChange(index, 'current', e.target.value)}
                      placeholder="Current (e.g., 4.5%)"
                      data-testid={`input-metric-current-${index}`}
                    />
                    <Input
                      value={metric.target}
                      onChange={(e) => handleMetricChange(index, 'target', e.target.value)}
                      placeholder="Target (e.g., 1.2%)"
                      data-testid={`input-metric-target-${index}`}
                    />
                  </div>
                </div>
              </Card>
            ))}

            <Button
              variant="outline"
              onClick={handleAddMetric}
              className="w-full"
              data-testid="button-add-metric"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Metric
            </Button>
          </div>

          <Button
            variant="outline"
            onClick={() => {
              if (showHints) {
                setShowHints(false);
              } else {
                getSuggestions({
                  scenarioId: selectedScenario.id,
                  step: 'metrics',
                  currentInput: buildData.what,
                });
              }
            }}
            className="w-full"
            disabled={suggestionsMutation.isPending}
            data-testid="button-show-hints-metrics"
          >
            {suggestionsMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Getting AI Suggestions...
              </>
            ) : (
              <>
                <Lightbulb className="w-4 h-4 mr-2" />
                {showHints ? 'Hide' : 'Get'} AI Suggestions
              </>
            )}
          </Button>

          {showHints && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
              <p className="text-sm font-medium text-primary mb-2">
                {aiSuggestions.length > 0 ? '💡 AI-Generated Suggestions (click to add):' : 'Suggested metrics:'}
              </p>
              {aiSuggestions.length > 0 ? (
                aiSuggestions.map((suggestion, i) => {
                  // Parse suggestion format: "Metric name: from X to Y"
                  const match = suggestion.match(/^(.+?):\s*from\s+(.+?)\s+to\s+(.+)$/i);
                  return (
                    <Card
                      key={i}
                      className="p-4 hover-elevate cursor-pointer"
                      onClick={() => {
                        if (match) {
                          const [, name, current, target] = match;
                          setBuildData({
                            ...buildData,
                            metrics: [...buildData.metrics, { name: name.trim(), current: current.trim(), target: target.trim() }]
                          });
                        } else {
                          // If format doesn't match, just add the suggestion as the metric name
                          setBuildData({
                            ...buildData,
                            metrics: [...buildData.metrics, { name: suggestion, current: '', target: '' }]
                          });
                        }
                        setShowHints(false);
                      }}
                      data-testid={`hint-metrics-${i}`}
                    >
                      <p className="text-foreground text-sm">{suggestion}</p>
                    </Card>
                  );
                })
              ) : (
                selectedScenario.hints.howMuch.map((hint, i) => (
                  <p key={i} className="text-sm text-muted-foreground">• {hint}</p>
                ))
              )}
            </motion.div>
          )}
        </div>
      </BuildStepLayout>
    );
  }

  if (stage === 'when' && selectedScenario) {
    return (
      <BuildStepLayout
        step={currentStep}
        scenario={selectedScenario}
        onBack={() => setStage('metrics')}
        onNext={() => setStage('review')}
        nextDisabled={!buildData.when.trim()}
      >
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2 text-foreground">When must this be complete?</h2>
            <p className="text-muted-foreground">JTBDs need strategic deadlines - typically 3-5 years out.</p>
          </div>

          <Card className="p-6 bg-primary/5 border-primary/20">
            <p className="text-sm font-semibold text-primary mb-2">💡 STRATEGIC VIEW:</p>
            <p className="text-muted-foreground">Suggested timeline: {selectedScenario.hints.when}</p>
          </Card>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Strategic deadline</label>
            <Input
              value={buildData.when}
              onChange={(e) => setBuildData({ ...buildData, when: e.target.value })}
              placeholder="e.g., Q4 2026, December 2027"
              data-testid="input-when"
            />
          </div>

          <Button
            variant="outline"
            onClick={() => {
              if (showHints) {
                setShowHints(false);
              } else {
                const metricsText = buildData.metrics
                  .map(m => `${m.name}: ${m.current} to ${m.target}`)
                  .join('; ');
                getSuggestions({
                  scenarioId: selectedScenario.id,
                  step: 'when',
                  currentInput: `${buildData.what}. Metrics: ${metricsText}`,
                });
              }
            }}
            className="w-full"
            disabled={suggestionsMutation.isPending}
            data-testid="button-show-hints-when"
          >
            {suggestionsMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Getting AI Suggestions...
              </>
            ) : (
              <>
                <Lightbulb className="w-4 h-4 mr-2" />
                {showHints ? 'Hide' : 'Get'} AI Suggestions
              </>
            )}
          </Button>

          {showHints && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
              <p className="text-sm font-medium text-primary mb-2">
                {aiSuggestions.length > 0 ? '💡 AI-Generated Suggestions (click to use):' : 'Using preset hint'}
              </p>
              {aiSuggestions.length > 0 ? (
                aiSuggestions.map((suggestion, i) => (
                  <Card
                    key={i}
                    className="p-4 hover-elevate cursor-pointer"
                    onClick={() => {
                      setBuildData({ ...buildData, when: suggestion });
                      setShowHints(false);
                    }}
                    data-testid={`hint-when-${i}`}
                  >
                    <p className="text-foreground text-sm">{suggestion}</p>
                  </Card>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">• {selectedScenario.hints.when}</p>
              )}
            </motion.div>
          )}

          {assembledJTBD && (
            <Card className="p-6 bg-card/50 border-card-border">
              <p className="text-sm font-semibold text-primary mb-3">PREVIEW:</p>
              <p className="text-foreground">{assembledJTBD}</p>
            </Card>
          )}
        </div>
      </BuildStepLayout>
    );
  }

  if (stage === 'review') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="p-4 border-b border-border">
          <div className="max-w-4xl mx-auto">
            <Button variant="ghost" size="icon" onClick={() => setStage('when')} data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2 text-foreground">Your Completed JTBD</h2>
              <p className="text-muted-foreground">
                {polishMutation.isPending
                  ? "AI is polishing your statement into a cohesive sentence..."
                  : "AI has polished this into a professional statement. Feel free to edit if needed."}
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-semibold text-primary text-center">✨ POLISHED STATEMENT:</p>
              {polishMutation.isPending ? (
                <Card className="p-8 bg-gradient-to-br from-primary/10 to-chart-3/10 border-2 border-primary/30">
                  <div className="flex items-center justify-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <p className="text-lg text-muted-foreground">Polishing your JTBD statement...</p>
                  </div>
                </Card>
              ) : (
                <div className="relative">
                  <Textarea
                    value={polishedStatement || assembledJTBD}
                    onChange={(e) => setPolishedStatement(e.target.value)}
                    rows={4}
                    className="w-full text-lg font-semibold leading-relaxed p-6 bg-gradient-to-br from-primary/10 to-chart-3/10 border-2 border-primary/30 resize-none"
                    data-testid="textarea-polished-statement"
                  />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <p className="text-sm font-semibold text-muted-foreground text-center">Component Breakdown:</p>
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="p-6 bg-card/50">
                  <p className="text-sm font-semibold text-primary mb-2">WHAT</p>
                  <p className="text-foreground text-sm">{buildData.what}</p>
                </Card>
                <Card className="p-6 bg-card/50">
                  <p className="text-sm font-semibold text-primary mb-2">HOW MUCH</p>
                  <div className="space-y-1">
                    {buildData.metrics.map((m, i) => (
                      <p key={i} className="text-foreground text-sm">{m.name}: {m.current} → {m.target}</p>
                    ))}
                  </div>
                </Card>
                <Card className="p-6 bg-card/50">
                  <p className="text-sm font-semibold text-primary mb-2">WHEN</p>
                  <p className="text-foreground text-sm">{buildData.when}</p>
                </Card>
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                variant="default"
                size="lg"
                onClick={() => setLocation('/')}
                data-testid="button-save-exit"
                disabled={polishMutation.isPending}
              >
                Save & Exit
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function ScenarioCard({ scenario, onSelect }: { scenario: BuildScenario; onSelect: () => void }) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Card
        className="p-6 hover-elevate active-elevate-2 cursor-pointer h-full"
        onClick={onSelect}
        data-testid={`scenario-${scenario.id}`}
      >
        <div className="flex flex-col h-full">
          <h3 className="text-xl font-bold mb-2 text-foreground">{scenario.role}</h3>
          <p className="text-sm text-primary font-medium mb-3">{scenario.industry}</p>
          <p className="text-muted-foreground text-sm mb-4 flex-grow">{scenario.challenge}</p>
          <div className="flex items-center gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={`w-8 h-1 rounded-full ${
                  i < scenario.difficulty ? 'bg-primary' : 'bg-secondary'
                }`}
              />
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function BuildStepLayout({
  step,
  scenario,
  onBack,
  onNext,
  nextDisabled,
  children,
}: {
  step: number;
  scenario?: BuildScenario;
  onBack: () => void;
  onNext: () => void;
  nextDisabled: boolean;
  children: React.ReactNode;
}) {
  const [isScenarioOpen, setIsScenarioOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-4 border-b border-border">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={onBack} data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 max-w-md mx-8">
            <p className="text-sm text-muted-foreground text-center mb-2">Step {step} of 3</p>
            <div className="flex gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-2 flex-1 rounded-full ${
                    s <= step ? 'bg-primary' : 'bg-secondary'
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="w-10" />
        </div>
      </header>
      
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto">
          {scenario && (
            <Collapsible open={isScenarioOpen} onOpenChange={setIsScenarioOpen} className="mb-6">
              <CollapsibleTrigger asChild>
                <Card className="p-4 hover-elevate cursor-pointer" data-testid="button-toggle-scenario">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                        <Info className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{scenario.role}</p>
                        <p className="text-sm text-muted-foreground">Click to view scenario context</p>
                      </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isScenarioOpen ? 'rotate-180' : ''}`} />
                  </div>
                </Card>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <Card className="mt-2 p-6 bg-card/50 border-card-border">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-primary mb-1">COMPANY</h3>
                      <p className="text-foreground">{scenario.context.company}</p>
                      <p className="text-sm text-muted-foreground">{scenario.context.size}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-semibold text-primary mb-2">THE SITUATION</h3>
                      <ul className="space-y-1">
                        {scenario.context.situation.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="text-primary mt-0.5">•</span>
                            <span className="text-foreground">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="pt-3 border-t border-border">
                      <h3 className="text-sm font-semibold text-primary mb-1">YOUR VALUE AGENDA</h3>
                      <p className="text-foreground font-medium text-sm">{scenario.context.valueAgenda}</p>
                    </div>
                  </div>
                </Card>
              </CollapsibleContent>
            </Collapsible>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
          
          <div className="mt-8 flex justify-end">
            <Button
              variant="primary"
              size="lg"
              onClick={onNext}
              disabled={nextDisabled}
              data-testid="button-continue"
            >
              Continue →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
