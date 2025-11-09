import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '../navigation/SimpleNavigator';
import { useMutation } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, Search } from 'lucide-react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { TextArea } from '../components/TextArea';
import { theme } from '../lib/theme';
import { apiRequest } from '../lib/queryClient';
import { CritiqueRequest, CritiqueResponse } from '../shared/schema';
import { updateCritiqueProgress } from '../lib/storage';

// Simple in-memory cache for critique results
const critiqueCache = new Map<string, CritiqueResponse>();

// Helper functions for status display
function getStatusText(status: 'missing' | 'weak' | 'strong' | 'excellent'): string {
  switch (status) {
    case 'missing': return 'Missing';
    case 'weak': return 'Weak';
    case 'strong': return 'Strong';
    case 'excellent': return 'Excellent';
  }
}

function getComponentStatusStyle(status: 'missing' | 'weak' | 'strong' | 'excellent') {
  const baseStyle = {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
    borderWidth: 1,
  };

  switch (status) {
    case 'missing':
      return { ...baseStyle, backgroundColor: '#FEF2F2', borderColor: '#FECACA' };
    case 'weak':
      return { ...baseStyle, backgroundColor: '#FFFBEB', borderColor: '#FDE68A' };
    case 'strong':
      return { ...baseStyle, backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' };
    case 'excellent':
      return { ...baseStyle, backgroundColor: '#FAF5FF', borderColor: '#E9D5FF' };
  }
}

function getStatusTextColor(status: 'missing' | 'weak' | 'strong' | 'excellent'): string {
  switch (status) {
    case 'missing': return '#B91C1C';
    case 'weak': return '#B45309';
    case 'strong': return '#15803D';
    case 'excellent': return '#7E22CE';
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

function getOverallStatusStyle(status: 'not-ready' | 'needs-work' | 'ready' | 'exemplary') {
  const baseStyle = {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'center' as const,
    marginTop: 12,
    borderWidth: 1,
  };

  switch (status) {
    case 'not-ready':
      return { ...baseStyle, backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' };
    case 'needs-work':
      return { ...baseStyle, backgroundColor: '#FFFBEB', borderColor: '#FCD34D' };
    case 'ready':
      return { ...baseStyle, backgroundColor: '#F0FDF4', borderColor: '#86EFAC' };
    case 'exemplary':
      return { ...baseStyle, backgroundColor: '#FAF5FF', borderColor: '#D8B4FE' };
  }
}

function getOverallStatusTextColor(status: 'not-ready' | 'needs-work' | 'ready' | 'exemplary'): string {
  switch (status) {
    case 'not-ready': return '#B91C1C';
    case 'needs-work': return '#B45309';
    case 'ready': return '#15803D';
    case 'exemplary': return '#7E22CE';
  }
}

export default function CritiquePage() {
  const navigation = useNavigation();
  const [jtbdStatement, setJtbdStatement] = useState('');
  const [critique, setCritique] = useState<CritiqueResponse | null>(null);
  const [expandedSection, setExpandedSection] = useState<'what' | 'howMuch' | 'when' | null>(null);
  const [isViewingHistory, setIsViewingHistory] = useState(false);

  // Load saved critique from Recent Work if available
  useEffect(() => {
    const loadSavedCritique = async () => {
      try {
        const saved = await AsyncStorage.getItem('view-critique');
        if (saved) {
          const data = JSON.parse(saved);
          setJtbdStatement(data.statement);
          setCritique(data.critique);
          setIsViewingHistory(true); // Mark as viewing history (read-only mode)
          // Clear after loading
          await AsyncStorage.removeItem('view-critique');
          console.log('📖 Loaded saved critique from Recent Work (read-only mode)');
        }
      } catch (e) {
        console.error('Failed to load saved critique:', e);
      }
    };

    loadSavedCritique();
  }, []);

  const critiqueMutation = useMutation({
    mutationFn: async (request: CritiqueRequest) => {
      // Create cache key from the JTBD statement (trimmed and normalized)
      const cacheKey = request.jtbdStatement.trim();

      // Check cache first
      if (critiqueCache.has(cacheKey)) {
        console.log('💾 Using cached critique result');
        return critiqueCache.get(cacheKey)!;
      }

      // Make API call if not cached - use 60 second timeout for Claude Sonnet 4
      console.log('🌐 Fetching new critique from API');
      const response = await apiRequest('POST', '/api/critique', request, 60000);
      const data = await response.json();

      // Cache the result
      critiqueCache.set(cacheKey, data);

      return data as CritiqueResponse;
    },
    onSuccess: async (data) => {
      console.log('✅ Critique received, updating state');
      setCritique(data);
      setExpandedSection(null); // Reset expanded section for new critique

      // Save the critique to storage for "Your Recent Work"
      await updateCritiqueProgress(jtbdStatement, data);
      console.log('💾 Critique saved to storage');
    },
    onError: (error: any) => {
      console.error('Critique error:', error);
      // Show error to user
      alert('Failed to get critique. Please try again.');
    },
  });

  const handleCritique = async () => {
    console.log('🔍 handleCritique called with statement:', jtbdStatement);
    if (!jtbdStatement.trim()) {
      console.log('❌ Empty statement, returning');
      return;
    }

    // Dismiss keyboard and wait a bit before triggering mutation
    // This prevents the "two tap" issue
    Keyboard.dismiss();

    // Use setTimeout to ensure keyboard dismissal doesn't interfere
    setTimeout(() => {
      console.log('📤 Triggering mutation...');
      setExpandedSection(null); // Reset expanded section when starting new critique
      critiqueMutation.mutate({ jtbdStatement });
    }, 100);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Search size={48} color={theme.colors.primary} />
        </View>
        <Text style={styles.title}>Critique a JTBD</Text>
        <Text style={styles.subtitle}>
          Paste your JTBD statement below to get detailed AI-powered feedback
        </Text>
      </View>

      <TextArea
        label="Your JTBD Statement"
        value={jtbdStatement}
        onChangeText={setJtbdStatement}
        placeholder="Paste your Jobs-to-be-Done statement here..."
        minHeight={150}
        editable={!isViewingHistory && critique === null}
      />

      {!isViewingHistory && critique === null && (
        <Button
          onPress={handleCritique}
          disabled={!jtbdStatement.trim() || critiqueMutation.isPending}
          loading={critiqueMutation.isPending}
          fullWidth
          size="lg"
        >
          Get Critique
        </Button>
      )}

      {critique && (
        <Card style={styles.resultCard}>
          {/* Overall Status */}
          <View style={styles.overallStatusContainer}>
            <Text style={styles.overallStatusLabel}>OVERALL STATUS</Text>
            <View style={getOverallStatusStyle(critique.overallStatus)}>
              <Text style={[styles.statusBadgeText, { color: getOverallStatusTextColor(critique.overallStatus) }]}>
                {getOverallStatusText(critique.overallStatus)}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Component Statuses Stacked */}
          <View style={styles.componentsContainer}>
            <TouchableOpacity
              onPress={() => setExpandedSection(expandedSection === 'what' ? null : 'what')}
              activeOpacity={0.7}
            >
              <View style={styles.componentRow}>
                <View style={styles.componentLabelContainer}>
                  <Text style={styles.componentLabel}>What</Text>
                  <View style={getComponentStatusStyle(critique.whatStatus)}>
                    <Text style={[styles.statusBadgeTextSmall, { color: getStatusTextColor(critique.whatStatus) }]}>
                      {getStatusText(critique.whatStatus)}
                    </Text>
                  </View>
                </View>
                {expandedSection === 'what' ? (
                  <ChevronUp size={20} color={theme.colors.textMuted} />
                ) : (
                  <ChevronDown size={20} color={theme.colors.textMuted} />
                )}
              </View>
            </TouchableOpacity>

            {expandedSection === 'what' && (
              <View style={styles.expandedSection}>
                <Text style={styles.feedbackTitle}>Feedback:</Text>
                <Text style={styles.feedbackText}>{critique.whatFeedback}</Text>
                {critique.whatSuggestions && critique.whatSuggestions.length > 0 && (
                  <>
                    <Text style={styles.suggestionsTitle}>Suggestions:</Text>
                    {critique.whatSuggestions.map((suggestion, index) => (
                      <Text key={index} style={styles.feedbackText}>• {suggestion}</Text>
                    ))}
                  </>
                )}
              </View>
            )}

            <View style={styles.componentDivider} />

            <TouchableOpacity
              onPress={() => setExpandedSection(expandedSection === 'howMuch' ? null : 'howMuch')}
              activeOpacity={0.7}
            >
              <View style={styles.componentRow}>
                <View style={styles.componentLabelContainer}>
                  <Text style={styles.componentLabel}>How Much</Text>
                  <View style={getComponentStatusStyle(critique.howMuchStatus)}>
                    <Text style={[styles.statusBadgeTextSmall, { color: getStatusTextColor(critique.howMuchStatus) }]}>
                      {getStatusText(critique.howMuchStatus)}
                    </Text>
                  </View>
                </View>
                {expandedSection === 'howMuch' ? (
                  <ChevronUp size={20} color={theme.colors.textMuted} />
                ) : (
                  <ChevronDown size={20} color={theme.colors.textMuted} />
                )}
              </View>
            </TouchableOpacity>

            {expandedSection === 'howMuch' && (
              <View style={styles.expandedSection}>
                <Text style={styles.feedbackTitle}>Feedback:</Text>
                <Text style={styles.feedbackText}>{critique.howMuchFeedback}</Text>
                {critique.howMuchSuggestions && critique.howMuchSuggestions.length > 0 && (
                  <>
                    <Text style={styles.suggestionsTitle}>Suggestions:</Text>
                    {critique.howMuchSuggestions.map((suggestion, index) => (
                      <Text key={index} style={styles.feedbackText}>• {suggestion}</Text>
                    ))}
                  </>
                )}
              </View>
            )}

            <View style={styles.componentDivider} />

            <TouchableOpacity
              onPress={() => setExpandedSection(expandedSection === 'when' ? null : 'when')}
              activeOpacity={0.7}
            >
              <View style={styles.componentRow}>
                <View style={styles.componentLabelContainer}>
                  <Text style={styles.componentLabel}>When</Text>
                  <View style={getComponentStatusStyle(critique.whenStatus)}>
                    <Text style={[styles.statusBadgeTextSmall, { color: getStatusTextColor(critique.whenStatus) }]}>
                      {getStatusText(critique.whenStatus)}
                    </Text>
                  </View>
                </View>
                {expandedSection === 'when' ? (
                  <ChevronUp size={20} color={theme.colors.textMuted} />
                ) : (
                  <ChevronDown size={20} color={theme.colors.textMuted} />
                )}
              </View>
            </TouchableOpacity>

            {expandedSection === 'when' && (
              <View style={styles.expandedSection}>
                <Text style={styles.feedbackTitle}>Feedback:</Text>
                <Text style={styles.feedbackText}>{critique.whenFeedback}</Text>
                {critique.whenSuggestions && critique.whenSuggestions.length > 0 && (
                  <>
                    <Text style={styles.suggestionsTitle}>Suggestions:</Text>
                    {critique.whenSuggestions.map((suggestion, index) => (
                      <Text key={index} style={styles.feedbackText}>• {suggestion}</Text>
                    ))}
                  </>
                )}
              </View>
            )}
          </View>

          {/* Improved Version */}
          {critique.improvedVersion && (
            <>
              <View style={styles.divider} />
              <View style={styles.improvedContainer}>
                <Text style={styles.improvedTitle}>Improved Version</Text>
                <Text style={styles.improvedText}>{critique.improvedVersion}</Text>
              </View>
            </>
          )}
        </Card>
      )}

      {critique && (
        <View style={{ gap: 12, marginTop: theme.spacing.lg }}>
          <Button onPress={() => navigation.goBack()} fullWidth>
            Return to Menu
          </Button>
          <Button
            variant="outline"
            onPress={() => {
              setJtbdStatement('');
              setCritique(null);
              setIsViewingHistory(false);
            }}
            fullWidth
          >
            Critique Another
          </Button>
        </View>
      )}
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
    paddingBottom: theme.spacing.xxxl, // Extra padding for tab bar
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  iconContainer: {
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(220, 38, 38, 0.08)',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.largeTitle,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    letterSpacing: -0.5,
    textAlign: 'center' as 'center',
  },
  subtitle: {
    fontSize: theme.fontSize.subhead,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
    textAlign: 'center' as 'center',
  },
  resultCard: {
    padding: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },
  overallStatusContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  overallStatusLabel: {
    fontSize: theme.fontSize.footnote,
    color: theme.colors.textMuted,
    fontWeight: theme.fontWeight.medium,
    textTransform: 'uppercase' as 'uppercase',
    letterSpacing: 1,
  },
  statusBadgeText: {
    fontSize: theme.fontSize.callout,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  statusBadgeTextSmall: {
    fontSize: theme.fontSize.footnote,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.md,
  },
  componentDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.sm,
  },
  componentsContainer: {
    // Container for all stacked components
  },
  componentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  componentLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  componentLabel: {
    fontSize: theme.fontSize.subhead,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.semibold,
    letterSpacing: 0.3,
  },
  expandedSection: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  feedbackTitle: {
    fontSize: theme.fontSize.footnote,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase' as 'uppercase',
    letterSpacing: 0.5,
  },
  feedbackText: {
    fontSize: theme.fontSize.subhead,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    lineHeight: 22,
  },
  suggestionsTitle: {
    fontSize: theme.fontSize.footnote,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase' as 'uppercase',
    letterSpacing: 0.5,
  },
  improvedContainer: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  improvedTitle: {
    fontSize: theme.fontSize.callout,
    fontWeight: theme.fontWeight.semibold,
    color: '#15803D',
    marginBottom: theme.spacing.sm,
  },
  improvedText: {
    fontSize: theme.fontSize.subhead,
    color: '#166534',
    lineHeight: 22,
  },
});
