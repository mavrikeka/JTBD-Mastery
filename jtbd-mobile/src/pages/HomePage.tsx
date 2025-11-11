import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '../navigation/SimpleNavigator';
import { Lightbulb, Hammer, Search, History, Clock, ChevronDown } from 'lucide-react-native';
import { ModeCard } from '../components/ModeCard';
import { Card } from '../components/Card';
import { UserProgress, BuiltJTBD, QuizResult } from '../shared/schema';
import { getProgress, getBuiltJTBDs, getCritiques, getQuizResults } from '../lib/storage';
import { theme } from '../lib/theme';

export default function HomePage() {
  const navigation = useNavigation();
  const [progress, setProgress] = useState<UserProgress>({
    learnMode: { completed: false, examplesViewed: 0 },
    buildMode: { completed: false, jtbdsCreated: 0 },
    critiqueMode: { completed: false, jtbdsCritiqued: 0 },
  });
  const [builtJTBDs, setBuiltJTBDs] = useState<BuiltJTBD[]>([]);
  const [critiques, setCritiques] = useState<Array<{statement: string, critique: any, timestamp: string}>>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [totalBuiltCount, setTotalBuiltCount] = useState(0);
  const [totalCritiquesCount, setTotalCritiquesCount] = useState(0);
  const [totalQuizCount, setTotalQuizCount] = useState(0);
  const [builtJTBDsOpen, setBuiltJTBDsOpen] = useState(false);
  const [critiquesOpen, setCritiquesOpen] = useState(false);
  const [quizResultsOpen, setQuizResultsOpen] = useState(false);

  // Load data once on mount
  // Note: Previously had setInterval polling every 2 seconds, but this caused
  // state update conflicts with navigation in production builds (Hermes engine).
  // Trade-off: Recent Work updates when navigating back to Home, not in real-time.
  // See docs/CHANGELOG.md [2025-11-11] for details.
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const prog = await getProgress();
    const jtbds = await getBuiltJTBDs();
    const crits = await getCritiques();
    const quizRes = await getQuizResults();

    console.log('Loaded data:', {
      builtCount: jtbds.length,
      critiquesCount: crits.length,
      quizCount: quizRes.length,
      critiques: crits
    });

    setProgress(prog);
    setTotalBuiltCount(jtbds.length);
    setTotalCritiquesCount(crits.length);
    setTotalQuizCount(quizRes.length);
    setBuiltJTBDs(jtbds.slice(-3).reverse());
    setCritiques(crits.slice(-3).reverse());
    setQuizResults(quizRes.slice(-3).reverse());
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
      <View style={styles.header}>
        <Text style={styles.greeting}>JTBD Mastery!</Text>
        <Text style={styles.subtitle}>
          Master the art of writing excellent Jobs-to-be-Done statements.
        </Text>
      </View>

      {/* Progress Overview */}
      <Card style={styles.progressOverview}>
        <Text style={styles.progressOverviewTitle}>Your Progress</Text>
        <View style={styles.progressStats}>
          <View style={styles.progressStat}>
            <Lightbulb size={20} color={theme.colors.primary} strokeWidth={2.5} />
            <Text style={styles.progressStatLabel}>Learn</Text>
            <Text style={styles.progressStatValue}>{progress.learnMode.examplesViewed}/10</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressBarFill, { width: `${(progress.learnMode.examplesViewed / 10) * 100}%` }]} />
            </View>
          </View>

          <View style={styles.progressStat}>
            <Hammer size={20} color={theme.colors.primary} strokeWidth={2.5} />
            <Text style={styles.progressStatLabel}>Build</Text>
            <Text style={styles.progressStatValue}>{totalBuiltCount}</Text>
          </View>

          <View style={styles.progressStat}>
            <Search size={20} color={theme.colors.primary} strokeWidth={2.5} />
            <Text style={styles.progressStatLabel}>Critique</Text>
            <Text style={styles.progressStatValue}>{totalCritiquesCount}</Text>
          </View>
        </View>
      </Card>


      {(builtJTBDs.length > 0 || critiques.length > 0 || quizResults.length > 0) && (
        <View style={styles.recentWork}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Work</Text>
            <Text style={styles.sectionSubtitle}>Last 3 items</Text>
          </View>

          {builtJTBDs.length > 0 && (
            <Card style={styles.recentCard}>
              <TouchableOpacity
                style={styles.collapsibleHeader}
                onPress={() => setBuiltJTBDsOpen(!builtJTBDsOpen)}
              >
                <View style={styles.recentCardHeader}>
                  <Hammer size={20} color={theme.colors.primary} />
                  <Text style={styles.recentCardTitle}>Built JTBDs</Text>
                  <Text style={styles.countBadge}>({totalBuiltCount})</Text>
                </View>
                <ChevronDown
                  size={20}
                  color={theme.colors.textMuted}
                  style={{
                    transform: [{ rotate: builtJTBDsOpen ? '180deg' : '0deg' }],
                  }}
                />
              </TouchableOpacity>
              {builtJTBDsOpen && builtJTBDs.map((jtbd, index) => (
                <Card
                  key={index}
                  style={styles.recentItem}
                  onPress={async () => {
                    // Store the JTBD in AsyncStorage as a temporary view
                    await AsyncStorage.setItem('view-built-jtbd', JSON.stringify(jtbd));
                    navigation.navigate('Build');
                  }}
                >
                  <Text style={styles.recentItemText} numberOfLines={2}>{jtbd.assembled}</Text>
                  <View style={styles.recentItemMeta}>
                    <Clock size={12} color={theme.colors.textMuted} />
                    <Text style={styles.recentItemDate}>
                      {jtbd.timestamp ? new Date(jtbd.timestamp).toLocaleDateString() : jtbd.scenarioId}
                    </Text>
                  </View>
                </Card>
              ))}
            </Card>
          )}

          {critiques.length > 0 && (
            <Card style={styles.recentCard}>
              <TouchableOpacity
                style={styles.collapsibleHeader}
                onPress={() => setCritiquesOpen(!critiquesOpen)}
              >
                <View style={styles.recentCardHeader}>
                  <Search size={20} color={theme.colors.primary} />
                  <Text style={styles.recentCardTitle}>Critiqued JTBDs</Text>
                  <Text style={styles.countBadge}>({totalCritiquesCount})</Text>
                </View>
                <ChevronDown
                  size={20}
                  color={theme.colors.textMuted}
                  style={{
                    transform: [{ rotate: critiquesOpen ? '180deg' : '0deg' }],
                  }}
                />
              </TouchableOpacity>
              {critiquesOpen && critiques.map((item, index) => (
                <Card
                  key={index}
                  style={styles.recentItem}
                  onPress={async () => {
                    // Store the critique in AsyncStorage to view it
                    await AsyncStorage.setItem('view-critique', JSON.stringify(item));
                    navigation.navigate('Critique');
                  }}
                >
                  <Text style={styles.recentItemText} numberOfLines={2}>{item.statement}</Text>
                  <View style={styles.recentItemMeta}>
                    <Text style={styles.recentItemScore}>
                      Status: {item.critique.overallStatus || 'needs-work'}
                    </Text>
                    <View style={{ flex: 1 }} />
                    {item.timestamp && (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Clock size={12} color={theme.colors.textMuted} />
                        <Text style={[styles.recentItemDate, { marginLeft: 4 }]}>
                          {new Date(item.timestamp).toLocaleDateString()}
                        </Text>
                      </View>
                    )}
                  </View>
                </Card>
              ))}
            </Card>
          )}

          {quizResults.length > 0 && (
            <Card style={styles.recentCard}>
              <TouchableOpacity
                style={styles.collapsibleHeader}
                onPress={() => setQuizResultsOpen(!quizResultsOpen)}
              >
                <View style={styles.recentCardHeader}>
                  <Lightbulb size={20} color={theme.colors.primary} />
                  <Text style={styles.recentCardTitle}>Quiz Results</Text>
                  <Text style={styles.countBadge}>({totalQuizCount})</Text>
                </View>
                <ChevronDown
                  size={20}
                  color={theme.colors.textMuted}
                  style={{
                    transform: [{ rotate: quizResultsOpen ? '180deg' : '0deg' }],
                  }}
                />
              </TouchableOpacity>
              {quizResultsOpen && quizResults.map((result, index) => {
                const percentage = Math.round((result.score / result.totalQuestions) * 100);
                const scoreColor = percentage >= 80 ? theme.colors.success : percentage >= 60 ? theme.colors.primary : theme.colors.error;

                return (
                  <Card
                    key={index}
                    style={styles.recentItem}
                    onPress={async () => {
                      // Store the quiz result to view it
                      await AsyncStorage.setItem('view-quiz-result', JSON.stringify(result));
                      navigation.navigate('Learn');
                    }}
                  >
                    <View style={styles.quizResultHeader}>
                      <Text style={styles.recentItemText}>
                        Quiz Score: {result.score}/{result.totalQuestions} ({percentage}%)
                      </Text>
                      <View style={[styles.scoreCircle, { borderColor: scoreColor }]}>
                        <Text style={[styles.scoreCircleText, { color: scoreColor }]}>
                          {percentage}%
                        </Text>
                      </View>
                    </View>
                    <View style={styles.recentItemMeta}>
                      <Clock size={12} color={theme.colors.textMuted} />
                      <Text style={styles.recentItemDate}>
                        {new Date(result.timestamp).toLocaleDateString()}
                      </Text>
                    </View>
                  </Card>
                );
              })}
            </Card>
          )}
        </View>
      )}

      <View style={styles.tipContainer}>
        <Text style={styles.tipText}>
          💡 Use the tabs below to <Text style={styles.tipHighlight}>Learn</Text> from examples, <Text style={styles.tipHighlight}>Build</Text> your own JTBDs, or <Text style={styles.tipHighlight}>Critique</Text> existing statements
        </Text>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: 100, // Extra space for tab bar
  },
  header: {
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
  },
  greeting: {
    fontSize: theme.fontSize.largeTitle,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: theme.fontSize.subhead,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  progressOverview: {
    marginBottom: theme.spacing.xl,
  },
  progressOverviewTitle: {
    fontSize: theme.fontSize.headline,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  progressStat: {
    flex: 1,
    alignItems: 'center',
  },
  progressStatLabel: {
    fontSize: theme.fontSize.caption,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
    marginBottom: 2,
  },
  progressStatValue: {
    fontSize: theme.fontSize.title3,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: theme.colors.divider,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
  },
  sectionHeader: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.headline,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  sectionSubtitle: {
    fontSize: theme.fontSize.footnote,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  recentWork: {
    marginBottom: theme.spacing.lg,
  },
  recentCard: {
    marginBottom: theme.spacing.md,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  recentCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentCardTitle: {
    fontSize: theme.fontSize.callout,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  countBadge: {
    fontSize: theme.fontSize.footnote,
    color: theme.colors.textMuted,
    marginLeft: theme.spacing.xs,
  },
  recentItem: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  recentItemText: {
    fontSize: theme.fontSize.subhead,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    lineHeight: 20,
  },
  recentItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentItemScore: {
    fontSize: theme.fontSize.caption,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
    marginRight: theme.spacing.xs,
  },
  recentItemDate: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.textMuted,
  },
  tipContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: 'rgba(220, 38, 38, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.2)',
  },
  tipText: {
    fontSize: theme.fontSize.subhead,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    textAlign: 'center',
    lineHeight: 20,
  },
  tipHighlight: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.bold,
  },
  quizResultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  scoreCircle: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.full,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreCircleText: {
    fontSize: theme.fontSize.footnote,
    fontWeight: theme.fontWeight.bold,
  },
});
