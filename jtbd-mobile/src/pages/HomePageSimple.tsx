import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Lightbulb, Hammer, Search } from 'lucide-react-native';
import { ModeCard } from '../components/ModeCard';
import { UserProgress, BuiltJTBD } from '../shared/schema';
import { getProgress, getBuiltJTBDs, getCritiques } from '../lib/storage';
import { theme } from '../lib/theme';

export default function HomePageSimple() {
  const [progress, setProgress] = useState<UserProgress>({
    learnMode: { completed: false, examplesViewed: 0 },
    buildMode: { completed: false, jtbdsCreated: 0 },
    critiqueMode: { completed: false, jtbdsCritiqued: 0 },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const prog = await getProgress();
    setProgress(prog);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>JTBD Mastery Studio</Text>
        <Text style={styles.subtitle}>
          Master the art of writing excellent Jobs-to-be-Done statements
        </Text>
      </View>

      <View style={styles.modesContainer}>
        <ModeCard
          icon={<Lightbulb size={32} color={theme.colors.primary} />}
          title="LEARN"
          description="Train your eye to recognize excellent vs terrible JTBDs"
          completed={progress.learnMode.completed}
          progress={progress.learnMode.examplesViewed > 0
            ? `${progress.learnMode.examplesViewed}/10 examples viewed`
            : undefined
          }
          onPress={() => console.log('Learn mode')}
        />

        <ModeCard
          icon={<Hammer size={32} color={theme.colors.primary} />}
          title="BUILD"
          description="Create your first JTBD with step-by-step guidance"
          completed={progress.buildMode.completed}
          progress={progress.buildMode.jtbdsCreated > 0
            ? `${progress.buildMode.jtbdsCreated} JTBD${progress.buildMode.jtbdsCreated > 1 ? 's' : ''} created`
            : undefined
          }
          onPress={() => console.log('Build mode')}
        />

        <ModeCard
          icon={<Search size={32} color={theme.colors.primary} />}
          title="CRITIQUE"
          description="Get instant AI analysis and detailed feedback"
          completed={progress.critiqueMode.completed}
          progress={progress.critiqueMode.jtbdsCritiqued > 0
            ? `${progress.critiqueMode.jtbdsCritiqued} JTBD${progress.critiqueMode.jtbdsCritiqued > 1 ? 's' : ''} critiqued`
            : undefined
          }
          onPress={() => console.log('Critique mode')}
        />
      </View>

      <View style={styles.tipContainer}>
        <Text style={styles.tipText}>
          💡 Tip: Start with LEARN to build pattern recognition, then BUILD your own
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    paddingTop: theme.spacing.xxl,
  },
  title: {
    fontSize: theme.fontSize.huge,
    fontWeight: 'bold' as 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center' as 'center',
  },
  subtitle: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textSecondary,
    textAlign: 'center' as 'center',
    maxWidth: 600,
  },
  modesContainer: {
    marginBottom: theme.spacing.lg,
  },
  tipContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: `${theme.colors.primary}15`,
    borderWidth: 1,
    borderColor: `${theme.colors.primary}30`,
    alignSelf: 'center',
  },
  tipText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600' as '600',
    color: theme.colors.primary,
    textAlign: 'center' as 'center',
  },
});
