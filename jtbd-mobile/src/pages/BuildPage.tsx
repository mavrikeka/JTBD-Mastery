import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '../navigation/SimpleNavigator';
import { useMutation } from '@tanstack/react-query';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { TextArea } from '../components/TextArea';
import { buildScenarios } from '../data/build-scenarios';
import { BuildScenario, SuggestionRequest, SuggestionResponse } from '../shared/schema';
import { updateBuildProgress } from '../lib/storage';
import { apiRequest } from '../lib/queryClient';
import { theme } from '../lib/theme';
import { Hammer, Plus, X, Info, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react-native';

type BuildStage = 'intro' | 'scenarios' | 'context' | 'what' | 'metrics' | 'when' | 'review';

interface Metric {
  name: string;
  current: string;
  target: string;
}

interface BuildData {
  scenarioId: string;
  what: string;
  metrics: Metric[];
  when: string;
}

// Simple in-memory cache for AI suggestions
const suggestionsCache = new Map<string, string[]>();

export default function BuildPage() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [stage, setStage] = useState<BuildStage>('intro');
  const [selectedScenario, setSelectedScenario] = useState<BuildScenario | null>(null);
  const [buildData, setBuildData] = useState<BuildData>({
    scenarioId: '',
    what: '',
    metrics: [],
    when: '',
  });
  const [showScenarioContext, setShowScenarioContext] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [polishedStatement, setPolishedStatement] = useState('');
  const [isViewingHistory, setIsViewingHistory] = useState(false);

  // Load saved JTBD from Recent Work if available
  useEffect(() => {
    const loadSavedJTBD = async () => {
      try {
        const saved = await AsyncStorage.getItem('view-built-jtbd');
        if (saved) {
          const jtbd = JSON.parse(saved);
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
            setIsViewingHistory(true); // Mark as viewing history
            console.log('📖 Loaded saved JTBD from Recent Work (read-only mode)');
          }

          // Clear after loading
          await AsyncStorage.removeItem('view-built-jtbd');
        }
      } catch (e) {
        console.error('Failed to load saved JTBD:', e);
      }
    };

    loadSavedJTBD();
  }, []);

  const suggestionsMutation = useMutation({
    mutationFn: async (request: SuggestionRequest) => {
      // Create cache key from request parameters
      const cacheKey = JSON.stringify(request);

      // Check cache first
      if (suggestionsCache.has(cacheKey)) {
        console.log('💾 Using cached suggestions');
        return { suggestions: suggestionsCache.get(cacheKey)! };
      }

      // Make API call if not cached
      console.log('🌐 Fetching new suggestions from API');
      const response = await apiRequest('POST', '/api/suggestions', request);
      const data = await response.json();

      // Cache the result
      suggestionsCache.set(cacheKey, data.suggestions);

      return data as SuggestionResponse;
    },
    onSuccess: (data) => {
      setAiSuggestions(data.suggestions);
      setShowHints(true);
    },
    onError: (error: any) => {
      console.error('Suggestions error:', error);
      // Fall back to showing preset hints
      setShowHints(true);
    },
  });

  const polishMutation = useMutation({
    mutationFn: async (rawStatement: string) => {
      // Use 30 second timeout for Claude Sonnet 4
      const response = await apiRequest('POST', '/api/polish-jtbd', { rawStatement }, 30000);
      const data = await response.json();
      return data.polishedStatement;
    },
    onSuccess: (polished) => {
      setPolishedStatement(polished);
      console.log('✨ Statement polished successfully');
    },
    onError: (error: any) => {
      console.error('Polish error:', error);
      // Fallback to raw statement
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

  const handleMetricChange = (index: number, field: keyof Metric, value: string) => {
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
        timestamp: new Date().toISOString(),
      });

      // Auto-polish the statement if not already polished
      if (!polishedStatement && !polishMutation.isPending && !polishMutation.data) {
        console.log('🪄 Auto-polishing statement...');
        polishMutation.mutate(assembledJTBD);
      }
    }
  }, [stage, assembledJTBD]);

  // Intro Stage
  if (stage === 'intro') {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.centerContent,
          {
            paddingTop: insets.top + theme.spacing.xl,
            paddingBottom: 100
          }
        ]}
      >
        <View style={styles.iconContainer}>
          <Hammer size={64} color={theme.colors.primary} />
        </View>
        <Text style={styles.title}>Build Your First JTBD</Text>
        <Text style={styles.introText}>
          The hardest part is starting from a blank page. We'll guide you step-by-step through the process.
          {'\n\n'}
          You'll answer questions about the business context, the work to be done, how success is measured, and when it must be complete.
        </Text>
        <Button size="lg" onPress={() => setStage('scenarios')} fullWidth>
          Choose a Scenario →
        </Button>
      </ScrollView>
    );
  }

  // Scenarios Stage
  if (stage === 'scenarios') {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + theme.spacing.lg,
            paddingBottom: 100
          }
        ]}
      >
        <Text style={styles.title}>Choose Your Challenge</Text>
        <Text style={styles.subtitle}>Select a scenario to build your JTBD</Text>

        {buildScenarios.map((scenario) => (
          <Card
            key={scenario.id}
            style={styles.scenarioCard}
            onPress={() => handleScenarioSelect(scenario)}
          >
            <Text style={styles.scenarioRole}>{scenario.role}</Text>
            <Text style={styles.scenarioIndustry}>{scenario.industry}</Text>
            <Text style={styles.scenarioChallenge}>{scenario.challenge}</Text>
            <View style={styles.difficultyContainer}>
              {[1, 2, 3].map((level) => (
                <View
                  key={level}
                  style={[
                    styles.difficultyBar,
                    level <= scenario.difficulty ? styles.difficultyBarActive : styles.difficultyBarInactive,
                  ]}
                />
              ))}
            </View>
          </Card>
        ))}
      </ScrollView>
    );
  }

  // Context Stage
  if (stage === 'context' && selectedScenario) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + theme.spacing.lg,
            paddingBottom: 100
          }
        ]}
      >
        <View style={styles.contextHeader}>
          <Text style={styles.title}>{selectedScenario.role}</Text>
          <Text style={styles.contextSubtitle}>{selectedScenario.challenge}</Text>
        </View>

        <Card style={styles.contextCard}>
          <View style={styles.contextSection}>
            <Text style={styles.contextLabel}>YOUR ROLE</Text>
            <Text style={styles.contextValue}>{selectedScenario.role}</Text>
          </View>

          <View style={styles.contextSection}>
            <Text style={styles.contextLabel}>COMPANY</Text>
            <Text style={styles.contextValue}>{selectedScenario.context.company}</Text>
            <Text style={styles.contextSubvalue}>{selectedScenario.context.size}</Text>
          </View>

          <View style={styles.contextSection}>
            <Text style={styles.contextLabel}>THE SITUATION</Text>
            {selectedScenario.context.situation.map((item, i) => (
              <View key={i} style={styles.bulletRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.contextSection, styles.contextSectionBorder]}>
            <Text style={styles.contextLabel}>YOUR VALUE AGENDA</Text>
            <Text style={styles.contextValueAgenda}>{selectedScenario.context.valueAgenda}</Text>
          </View>
        </Card>

        <Button size="lg" onPress={() => setStage('what')} fullWidth>
          Start Building JTBD →
        </Button>
      </ScrollView>
    );
  }

  const currentStep = stage === 'what' ? 1 : stage === 'metrics' ? 2 : stage === 'when' ? 3 : 4;

  // What Stage
  if (stage === 'what' && selectedScenario) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + theme.spacing.lg,
            paddingBottom: 100
          }
        ]}
      >
        <ProgressBar current={currentStep} total={3} />

        {selectedScenario && (
          <TouchableOpacity onPress={() => setShowScenarioContext(!showScenarioContext)}>
            <Card style={styles.collapsibleCard}>
              <View style={styles.collapsibleHeader}>
                <View style={styles.collapsibleHeaderLeft}>
                  <View style={styles.infoIconContainer}>
                    <Info size={16} color={theme.colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.collapsibleTitle}>{selectedScenario.role}</Text>
                    <Text style={styles.collapsibleSubtitle}>Tap to view scenario context</Text>
                  </View>
                </View>
                {showScenarioContext ? (
                  <ChevronUp size={20} color={theme.colors.textMuted} />
                ) : (
                  <ChevronDown size={20} color={theme.colors.textMuted} />
                )}
              </View>
            </Card>
          </TouchableOpacity>
        )}

        {showScenarioContext && selectedScenario && (
          <Card style={styles.scenarioContextCard}>
            <View style={styles.contextSection}>
              <Text style={styles.contextLabel}>COMPANY</Text>
              <Text style={styles.contextValue}>{selectedScenario.context.company}</Text>
              <Text style={styles.contextSubvalue}>{selectedScenario.context.size}</Text>
            </View>
            <View style={styles.contextSection}>
              <Text style={styles.contextLabel}>THE SITUATION</Text>
              {selectedScenario.context.situation.map((item, i) => (
                <View key={i} style={styles.bulletRow}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        <Text style={styles.stageTitle}>What work needs to be done?</Text>
        <Text style={styles.stageSubtitle}>Think about the actual work, not just desired outcomes. Use action verbs.</Text>

        <Card style={styles.warningCard}>
          <Text style={styles.warningTitle}>⚠️ AVOID VAGUE VERBS:</Text>
          <Text style={styles.warningText}>"Improve", "Enhance", "Drive", "Lead" are too vague</Text>
        </Card>

        <TextArea
          label="Describe the specific work"
          value={buildData.what}
          onChangeText={(text) => setBuildData({ ...buildData, what: text })}
          placeholder="e.g., Implement lean manufacturing and Six Sigma quality control systems..."
          minHeight={120}
        />
        <Text style={styles.characterCount}>
          {buildData.what.length} characters {buildData.what.length < 50 ? '- keep going...' : '✓ Good length'}
        </Text>

        <Button
          variant="outline"
          onPress={() => {
            if (showHints) {
              setShowHints(false);
            } else {
              suggestionsMutation.mutate({
                scenarioId: selectedScenario.id,
                step: 'what',
                currentInput: buildData.what,
              });
            }
          }}
          disabled={suggestionsMutation.isPending}
          fullWidth
          style={styles.suggestionsButton}
        >
          {suggestionsMutation.isPending ? (
            <>
              <ActivityIndicator size="small" color={theme.colors.text} style={{ marginRight: 8 }} />
              <Text style={styles.buttonText}>Getting AI Suggestions...</Text>
            </>
          ) : (
            <>
              <Lightbulb size={16} color={theme.colors.text} style={{ marginRight: 8 }} />
              <Text style={styles.buttonText}>{showHints ? 'Hide' : 'Get'} AI Suggestions</Text>
            </>
          )}
        </Button>

        {showHints && (
          <View style={styles.hintsContainer}>
            {aiSuggestions.length > 0 ? (
              <>
                {buildData.what.trim().length > 0 && (
                  <>
                    <Text style={styles.hintsTitle}>✨ REFINED VERSION (tap to use)</Text>
                    <TouchableOpacity onPress={() => setBuildData({ ...buildData, what: aiSuggestions[0] })}>
                      <Card style={[styles.hintCard, styles.refinementCard]}>
                        <Text style={styles.hintText}>{aiSuggestions[0]}</Text>
                      </Card>
                    </TouchableOpacity>
                    {aiSuggestions.length > 1 && (
                      <Text style={[styles.hintsTitle, { marginTop: 12 }]}>💡 ALTERNATIVES (tap to use)</Text>
                    )}
                  </>
                )}
                {!buildData.what.trim() && (
                  <Text style={styles.hintsTitle}>💡 AI SUGGESTIONS (tap to use)</Text>
                )}
                {aiSuggestions.slice(buildData.what.trim().length > 0 ? 1 : 0).map((hint, i) => (
                  <TouchableOpacity key={i} onPress={() => setBuildData({ ...buildData, what: hint })}>
                    <Card style={styles.hintCard}>
                      <Text style={styles.hintText}>{hint}</Text>
                    </Card>
                  </TouchableOpacity>
                ))}
              </>
            ) : (
              <>
                <Text style={styles.hintsTitle}>💡 PRESET HINTS (tap to use)</Text>
                {selectedScenario.hints.what.map((hint, i) => (
                  <TouchableOpacity key={i} onPress={() => setBuildData({ ...buildData, what: hint })}>
                    <Card style={styles.hintCard}>
                      <Text style={styles.hintText}>{hint}</Text>
                    </Card>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </View>
        )}

        <Button
          size="lg"
          onPress={() => {
            setAiSuggestions([]);
            setShowHints(false);
            setStage('metrics');
          }}
          disabled={!buildData.what.trim()}
          fullWidth
          style={styles.continueButton}
        >
          Continue →
        </Button>
      </ScrollView>
    );
  }

  // Metrics Stage
  if (stage === 'metrics' && selectedScenario) {
    const metricsValid = buildData.metrics.length > 0 && buildData.metrics.every(m => m.name && m.current && m.target);

    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + theme.spacing.lg,
            paddingBottom: 100
          }
        ]}
      >
        <ProgressBar current={currentStep} total={3} />

        {selectedScenario && (
          <TouchableOpacity onPress={() => setShowScenarioContext(!showScenarioContext)}>
            <Card style={styles.collapsibleCard}>
              <View style={styles.collapsibleHeader}>
                <View style={styles.collapsibleHeaderLeft}>
                  <View style={styles.infoIconContainer}>
                    <Info size={16} color={theme.colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.collapsibleTitle}>{selectedScenario.role}</Text>
                    <Text style={styles.collapsibleSubtitle}>Tap to view scenario context</Text>
                  </View>
                </View>
                {showScenarioContext ? (
                  <ChevronUp size={20} color={theme.colors.textMuted} />
                ) : (
                  <ChevronDown size={20} color={theme.colors.textMuted} />
                )}
              </View>
            </Card>
          </TouchableOpacity>
        )}

        {showScenarioContext && selectedScenario && (
          <Card style={styles.scenarioContextCard}>
            <View style={styles.contextSection}>
              <Text style={styles.contextLabel}>COMPANY</Text>
              <Text style={styles.contextValue}>{selectedScenario.context.company}</Text>
              <Text style={styles.contextSubvalue}>{selectedScenario.context.size}</Text>
            </View>
            <View style={styles.contextSection}>
              <Text style={styles.contextLabel}>THE SITUATION</Text>
              {selectedScenario.context.situation.map((item, i) => (
                <View key={i} style={styles.bulletRow}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        <Text style={styles.stageTitle}>How will you measure success?</Text>
        <Text style={styles.stageSubtitle}>Every JTBD needs metrics with BEFORE and AFTER values.</Text>

        {buildData.what && (
          <Card style={styles.progressCard}>
            <Text style={styles.progressLabel}>WHAT YOU'RE BUILDING:</Text>
            <Text style={styles.progressContent}>{buildData.what}</Text>
          </Card>
        )}

        <Card style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 TIP:</Text>
          <Text style={styles.tipText}>Format: "From X to Y" - Example: "Defect rate from 4.5% to 1.2%"</Text>
        </Card>

        {buildData.metrics.map((metric, index) => (
          <Card key={index} style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricLabel}>Metric {index + 1}</Text>
              <TouchableOpacity onPress={() => handleRemoveMetric(index)}>
                <X size={20} color={theme.colors.error} />
              </TouchableOpacity>
            </View>
            <Input
              value={metric.name}
              onChangeText={(text) => handleMetricChange(index, 'name', text)}
              placeholder="What are you measuring? (e.g., Defect rate)"
            />
            <View style={styles.metricRow}>
              <Input
                value={metric.current}
                onChangeText={(text) => handleMetricChange(index, 'current', text)}
                placeholder="Current (e.g., 4.5%)"
                style={styles.metricInput}
              />
              <Input
                value={metric.target}
                onChangeText={(text) => handleMetricChange(index, 'target', text)}
                placeholder="Target (e.g., 1.2%)"
                style={styles.metricInput}
              />
            </View>
          </Card>
        ))}

        <Button variant="outline" onPress={handleAddMetric} fullWidth>
          <Plus size={16} color={theme.colors.text} /> Add Metric
        </Button>

        <Button
          variant="outline"
          onPress={() => {
            if (showHints) {
              setShowHints(false);
            } else {
              suggestionsMutation.mutate({
                scenarioId: selectedScenario.id,
                step: 'metrics',
                currentInput: buildData.what,
              });
            }
          }}
          disabled={suggestionsMutation.isPending}
          fullWidth
          style={styles.suggestionsButton}
        >
          {suggestionsMutation.isPending ? (
            <>
              <ActivityIndicator size="small" color={theme.colors.text} style={{ marginRight: 8 }} />
              <Text style={styles.buttonText}>Getting AI Suggestions...</Text>
            </>
          ) : (
            <>
              <Lightbulb size={16} color={theme.colors.text} style={{ marginRight: 8 }} />
              <Text style={styles.buttonText}>{showHints ? 'Hide' : 'Get'} AI Suggestions</Text>
            </>
          )}
        </Button>

        {showHints && aiSuggestions.length > 0 && (
          <View style={styles.hintsContainer}>
            <Text style={styles.hintsTitle}>💡 AI SUGGESTIONS (tap to use)</Text>
            {aiSuggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  // Parse suggestion format: "Metric name: from X to Y"
                  const match = suggestion.match(/^(.+?):\s*from\s+(.+?)\s+to\s+(.+)$/i);
                  if (match) {
                    const [, name, current, target] = match;
                    // Add as a new metric
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
                  // Don't close hints for metrics - user might want to add multiple
                }}
              >
                <Card style={styles.hintCard}>
                  <Text style={styles.hintText}>{suggestion}</Text>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Button
          size="lg"
          onPress={() => {
            setAiSuggestions([]);
            setShowHints(false);
            setStage('when');
          }}
          disabled={!metricsValid}
          fullWidth
          style={styles.continueButton}
        >
          Continue →
        </Button>
      </ScrollView>
    );
  }

  // When Stage
  if (stage === 'when' && selectedScenario) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + theme.spacing.lg,
            paddingBottom: 100
          }
        ]}
      >
        <ProgressBar current={currentStep} total={3} />

        {selectedScenario && (
          <TouchableOpacity onPress={() => setShowScenarioContext(!showScenarioContext)}>
            <Card style={styles.collapsibleCard}>
              <View style={styles.collapsibleHeader}>
                <View style={styles.collapsibleHeaderLeft}>
                  <View style={styles.infoIconContainer}>
                    <Info size={16} color={theme.colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.collapsibleTitle}>{selectedScenario.role}</Text>
                    <Text style={styles.collapsibleSubtitle}>Tap to view scenario context</Text>
                  </View>
                </View>
                {showScenarioContext ? (
                  <ChevronUp size={20} color={theme.colors.textMuted} />
                ) : (
                  <ChevronDown size={20} color={theme.colors.textMuted} />
                )}
              </View>
            </Card>
          </TouchableOpacity>
        )}

        {showScenarioContext && selectedScenario && (
          <Card style={styles.scenarioContextCard}>
            <View style={styles.contextSection}>
              <Text style={styles.contextLabel}>COMPANY</Text>
              <Text style={styles.contextValue}>{selectedScenario.context.company}</Text>
              <Text style={styles.contextSubvalue}>{selectedScenario.context.size}</Text>
            </View>
            <View style={styles.contextSection}>
              <Text style={styles.contextLabel}>THE SITUATION</Text>
              {selectedScenario.context.situation.map((item, i) => (
                <View key={i} style={styles.bulletRow}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        <Text style={styles.stageTitle}>When must this be complete?</Text>
        <Text style={styles.stageSubtitle}>JTBDs need strategic deadlines - typically 3-5 years out.</Text>

        {buildData.what && (
          <Card style={styles.progressCard}>
            <Text style={styles.progressLabel}>WHAT YOU'RE BUILDING:</Text>
            <Text style={styles.progressContent}>{buildData.what}</Text>
          </Card>
        )}

        {buildData.metrics.length > 0 && (
          <Card style={styles.progressCard}>
            <Text style={styles.progressLabel}>HOW YOU'LL MEASURE SUCCESS:</Text>
            {buildData.metrics.map((metric, index) => (
              <Text key={index} style={styles.progressMetric}>
                • {metric.name}: {metric.current} → {metric.target}
              </Text>
            ))}
          </Card>
        )}

        <Card style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 STRATEGIC VIEW:</Text>
          <Text style={styles.tipText}>Suggested timeline: {selectedScenario.hints.when}</Text>
        </Card>

        <Input
          label="Strategic deadline"
          value={buildData.when}
          onChangeText={(text) => setBuildData({ ...buildData, when: text })}
          placeholder="e.g., Q4 2026, December 2027"
        />

        <Button
          variant="outline"
          onPress={() => {
            if (showHints) {
              setShowHints(false);
            } else {
              const metricsText = buildData.metrics
                .map(m => `${m.name}: ${m.current} to ${m.target}`)
                .join('; ');
              suggestionsMutation.mutate({
                scenarioId: selectedScenario.id,
                step: 'when',
                currentInput: `${buildData.what}. Metrics: ${metricsText}`,
              });
            }
          }}
          disabled={suggestionsMutation.isPending}
          fullWidth
          style={styles.suggestionsButton}
        >
          {suggestionsMutation.isPending ? (
            <>
              <ActivityIndicator size="small" color={theme.colors.text} style={{ marginRight: 8 }} />
              <Text style={styles.buttonText}>Getting AI Suggestions...</Text>
            </>
          ) : (
            <>
              <Lightbulb size={16} color={theme.colors.text} style={{ marginRight: 8 }} />
              <Text style={styles.buttonText}>{showHints ? 'Hide' : 'Get'} AI Suggestions</Text>
            </>
          )}
        </Button>

        {showHints && aiSuggestions.length > 0 && (
          <View style={styles.hintsContainer}>
            <Text style={styles.hintsTitle}>💡 AI SUGGESTIONS (tap to use)</Text>
            {aiSuggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setBuildData({ ...buildData, when: suggestion });
                  setShowHints(false);
                }}
              >
                <Card style={styles.hintCard}>
                  <Text style={styles.hintText}>{suggestion}</Text>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {assembledJTBD && (
          <Card style={styles.previewCard}>
            <Text style={styles.previewLabel}>PREVIEW:</Text>
            <Text style={styles.previewText}>{assembledJTBD}</Text>
          </Card>
        )}

        <Button
          size="lg"
          onPress={() => {
            setAiSuggestions([]);
            setShowHints(false);
            setStage('review');
          }}
          disabled={!buildData.when.trim()}
          fullWidth
        >
          Continue →
        </Button>
      </ScrollView>
    );
  }

  // Review Stage
  if (stage === 'review') {
    const displayStatement = polishedStatement || polishMutation.data || assembledJTBD;

    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + theme.spacing.lg,
            paddingBottom: 100
          }
        ]}
      >
        <Text style={styles.title}>Your Completed JTBD</Text>
        <Text style={styles.subtitle}>
          {polishMutation.isPending
            ? 'AI is polishing your statement into a cohesive sentence...'
            : 'AI has polished this into a professional statement. Feel free to edit if needed.'}
        </Text>

        {polishMutation.isPending ? (
          <Card style={styles.finalCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
              <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginRight: 12 }} />
              <Text style={styles.loadingText}>Polishing your JTBD statement...</Text>
            </View>
          </Card>
        ) : (
          <>
            <Text style={styles.finalLabel}>✨ POLISHED STATEMENT:</Text>
            <TextArea
              value={displayStatement}
              onChangeText={setPolishedStatement}
              minHeight={120}
              style={styles.editableStatement}
            />
          </>
        )}

        <Text style={styles.breakdownLabel}>Component Breakdown:</Text>

        <Card style={styles.componentCard}>
          <Text style={styles.componentLabel}>WHAT</Text>
          <Text style={styles.componentText}>{buildData.what}</Text>
        </Card>

        <Card style={styles.componentCard}>
          <Text style={styles.componentLabel}>HOW MUCH</Text>
          {buildData.metrics.map((m, i) => (
            <Text key={i} style={styles.componentText}>
              {m.name}: {m.current} → {m.target}
            </Text>
          ))}
        </Card>

        <Card style={styles.componentCard}>
          <Text style={styles.componentLabel}>WHEN</Text>
          <Text style={styles.componentText}>{buildData.when}</Text>
        </Card>

        <View style={{ gap: 12 }}>
          <Button
            variant="default"
            onPress={() => navigation.goBack()}
            fullWidth
            disabled={polishMutation.isPending}
          >
            Return to Menu
          </Button>
          {!isViewingHistory && (
            <Button
              variant="outline"
              onPress={() => {
                // Reset and go back to scenarios
                setBuildData({ scenarioId: '', what: '', metrics: [], when: '' });
                setSelectedScenario(null);
                setPolishedStatement('');
                setStage('scenarios');
              }}
              fullWidth
              disabled={polishMutation.isPending}
            >
              Build Another
            </Button>
          )}
        </View>
      </ScrollView>
    );
  }

  return null;
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <View style={styles.progressContainer}>
      <Text style={styles.progressText}>Step {current} of {total}</Text>
      <View style={styles.progressBarContainer}>
        {Array.from({ length: total }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressBarSegment,
              index < current ? styles.progressBarActive : styles.progressBarInactive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
  },
  centerContent: {
    padding: theme.spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.3)',
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: 'bold' as 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  introText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 24,
    maxWidth: 600,
  },
  scenarioCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  scenarioRole: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold' as 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs / 2,
  },
  scenarioIndustry: {
    fontSize: theme.fontSize.base,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  scenarioChallenge: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  difficultyContainer: {
    flexDirection: 'row',
    marginTop: theme.spacing.xs,
  },
  difficultyBar: {
    width: 32,
    height: 4,
    borderRadius: theme.borderRadius.full,
    marginRight: theme.spacing.xs / 2,
  },
  difficultyBarActive: {
    backgroundColor: theme.colors.primary,
  },
  difficultyBarInactive: {
    backgroundColor: theme.colors.border,
  },
  contextHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  contextSubtitle: {
    fontSize: theme.fontSize.base,
    color: theme.colors.primary,
    fontWeight: '600' as '600',
  },
  contextCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  contextSection: {
    marginBottom: theme.spacing.md,
  },
  contextSectionBorder: {
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  contextLabel: {
    fontSize: theme.fontSize.xs,
    fontWeight: 'bold' as 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
    letterSpacing: 0.5,
  },
  contextValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold' as 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs / 2,
  },
  contextSubvalue: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
  },
  contextValueAgenda: {
    fontSize: theme.fontSize.base,
    fontWeight: '600' as '600',
    color: theme.colors.text,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.xs / 2,
  },
  bullet: {
    fontSize: theme.fontSize.base,
    color: theme.colors.primary,
    marginRight: theme.spacing.xs,
    marginTop: 2,
  },
  bulletText: {
    flex: 1,
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
    lineHeight: 22,
  },
  progressContainer: {
    marginBottom: theme.spacing.lg,
  },
  progressText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  progressBarContainer: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  progressBarSegment: {
    flex: 1,
    height: 8,
    borderRadius: theme.borderRadius.full,
  },
  progressBarActive: {
    backgroundColor: theme.colors.primary,
  },
  progressBarInactive: {
    backgroundColor: theme.colors.border,
  },
  collapsibleCard: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  collapsibleHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoIconContainer: {
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.2)',
    marginRight: theme.spacing.sm,
  },
  collapsibleTitle: {
    fontSize: theme.fontSize.base,
    fontWeight: '600' as '600',
    color: theme.colors.text,
  },
  collapsibleSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
  },
  scenarioContextCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  stageTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold' as 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  stageSubtitle: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.md,
  },
  warningCard: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    backgroundColor: 'rgba(251, 191, 36, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.2)',
  },
  warningTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: 'bold' as 'bold',
    color: theme.colors.warning,
    marginBottom: theme.spacing.xs,
  },
  warningText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
  },
  characterCount: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  suggestionsButton: {
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
    fontWeight: '600' as '600',
  },
  hintsContainer: {
    marginBottom: theme.spacing.md,
  },
  hintsTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600' as '600',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  hintCard: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  hintText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    lineHeight: 20,
  },
  refinementCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  tipCard: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    backgroundColor: 'rgba(255, 107, 53, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.2)',
  },
  tipTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: 'bold' as 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  tipText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
  },
  progressCard: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    backgroundColor: 'rgba(52, 211, 153, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.2)',
  },
  progressLabel: {
    fontSize: theme.fontSize.xs,
    fontWeight: 'bold' as 'bold',
    color: theme.colors.chart3,
    marginBottom: theme.spacing.xs,
    letterSpacing: 0.5,
  },
  progressContent: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    lineHeight: 20,
  },
  progressMetric: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    lineHeight: 20,
    marginBottom: theme.spacing.xs / 2,
  },
  metricCard: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  metricLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600' as '600',
    color: theme.colors.text,
  },
  metricRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  metricInput: {
    flex: 1,
  },
  continueButton: {
    marginTop: theme.spacing.md,
  },
  previewCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  previewLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: 'bold' as 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  previewText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
    lineHeight: 22,
  },
  finalCard: {
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 53, 0.3)',
  },
  finalLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: 'bold' as 'bold',
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  finalStatement: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600' as '600',
    color: theme.colors.text,
    textAlign: 'center',
    lineHeight: 26,
  },
  breakdownLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600' as '600',
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  componentCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  componentLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: 'bold' as 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  componentText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    lineHeight: 20,
    marginBottom: theme.spacing.xs / 2,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: theme.spacing.md,
    justifyContent: 'space-between',
  },
  halfButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  editableStatement: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600' as '600',
    lineHeight: 28,
    marginBottom: theme.spacing.lg,
  },
  loadingText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textMuted,
  },
});
