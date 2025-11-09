import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { X, Check, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { jtbdExamples } from '../data/jtbd-examples';
import { quizQuestions } from '../data/quiz-questions';
import { theme } from '../lib/theme';
import { updateLearnProgress, saveQuizResult } from '../lib/storage';

export default function LearnPage() {
  const [currentStep, setCurrentStep] = useState<'intro' | 'examples' | 'quiz' | 'summary' | 'review'>('intro');
  const [currentExample, setCurrentExample] = useState(0);
  const [showBadWhy, setShowBadWhy] = useState(false);
  const [showGoodWhy, setShowGoodWhy] = useState(false);

  // Quiz state
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string[]>>({});
  const [showQuizFeedback, setShowQuizFeedback] = useState(false);

  // Check if user is resuming from a previous session or viewing a quiz result
  useEffect(() => {
    const checkResume = async () => {
      try {
        // Check for quiz result to view
        const viewQuizData = await AsyncStorage.getItem('view-quiz-result');
        if (viewQuizData) {
          const quizResult = JSON.parse(viewQuizData);
          setQuizAnswers(quizResult.answers);
          setCurrentStep('review');
          // Clear the view flag after using it
          await AsyncStorage.removeItem('view-quiz-result');
          return;
        }

        // Check for resume data
        const resumeData = await AsyncStorage.getItem('resume-learn');
        if (resumeData) {
          const { currentExample: resumeExample, currentStep: resumeStep } = JSON.parse(resumeData);
          setCurrentExample(resumeExample);
          setCurrentStep(resumeStep);
          // Clear the resume flag after using it
          await AsyncStorage.removeItem('resume-learn');
        }
      } catch (error) {
        console.log('Error checking resume state:', error);
      }
    };
    checkResume();
  }, []);

  const example = jtbdExamples[currentExample];

  const nextExample = async () => {
    const newIndex = currentExample + 1;
    if (newIndex < jtbdExamples.length) {
      setCurrentExample(newIndex);
      setShowBadWhy(false);
      setShowGoodWhy(false);
      // Save progress
      await updateLearnProgress(newIndex + 1); // +1 because index is 0-based
    } else {
      setCurrentStep('quiz');
      await updateLearnProgress(jtbdExamples.length, undefined);
    }
  };

  const prevExample = () => {
    if (currentExample > 0) {
      setCurrentExample(currentExample - 1);
      setShowBadWhy(false);
      setShowGoodWhy(false);
    }
  };

  // Quiz functions
  const currentQuiz = quizQuestions[currentQuizIndex];

  const handleQuizAnswer = (optionId: string) => {
    if (currentQuiz.multiSelect) {
      const current = quizAnswers[currentQuiz.id] || [];
      const newAnswers = current.includes(optionId)
        ? current.filter(id => id !== optionId)
        : [...current, optionId];
      setQuizAnswers({ ...quizAnswers, [currentQuiz.id]: newAnswers });
      // Don't auto-show feedback for multi-select, wait for Submit button
    } else {
      setQuizAnswers({ ...quizAnswers, [currentQuiz.id]: [optionId] });
      setShowQuizFeedback(true);
    }
  };

  const handleSubmitMultiSelect = () => {
    setShowQuizFeedback(true);
  };

  const handleQuizNext = async () => {
    if (currentQuizIndex < quizQuestions.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
      setShowQuizFeedback(false);
    } else {
      // Calculate final score and save
      const score = calculateQuizScore();
      await updateLearnProgress(jtbdExamples.length, score);

      // Save quiz result for Recent Work
      await saveQuizResult(score, quizQuestions.length, quizAnswers);

      setCurrentStep('summary');
    }
  };

  const calculateQuizScore = () => {
    return Object.entries(quizAnswers).filter(([qId, answers]) => {
      const question = quizQuestions.find(q => q.id === parseInt(qId));
      if (!question) return false;
      const correctIds = question.options.filter(o => o.correct).map(o => o.id);
      return JSON.stringify(answers.sort()) === JSON.stringify(correctIds.sort());
    }).length;
  };

  const isAnswerCorrect = (optionId: string) => {
    const option = currentQuiz.options.find(o => o.id === optionId);
    return option?.correct || false;
  };

  // Intro Stage
  if (currentStep === 'intro') {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.centerContent}
        >
        <View style={styles.iconContainer}>
          <Lightbulb size={64} color={theme.colors.primary} />
        </View>
        <Text style={styles.title}>Learn JTBD Patterns</Text>
        <Text style={styles.introText}>
          The best way to learn is by example. We'll show you 10 real-world scenarios, each with a bad and good JTBD statement.
          {'\n\n'}
          Tap each card to reveal why it's good or bad. Train your eye to recognize excellent JTBDs.
        </Text>
        <Button size="lg" onPress={() => setCurrentStep('examples')} fullWidth>
          Start Learning →
        </Button>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Quiz Stage
  if (currentStep === 'quiz') {
    const selectedAnswers = quizAnswers[currentQuiz.id] || [];
    const showFeedback = showQuizFeedback;

    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
        >
        <Text style={styles.progress}>Question {currentQuizIndex + 1} of {quizQuestions.length}</Text>

        <Card style={styles.quizCard}>
          <Text style={styles.quizType}>
            {currentQuiz.type === 'spot-flaw' && 'Spot the Flaw'}
            {currentQuiz.type === 'choose-better' && 'Choose the Better JTBD'}
            {currentQuiz.type === 'missing-component' && 'Missing Component'}
            {currentQuiz.type === 'google-test' && 'The Google Test'}
            {currentQuiz.type === 'identify-good' && 'Identify Good Elements'}
          </Text>
          <Text style={styles.quizQuestion}>{currentQuiz.question}</Text>
          {currentQuiz.multiSelect && (
            <Text style={styles.quizHint}>Select all that apply</Text>
          )}

          <View style={styles.quizOptions}>
            {currentQuiz.options.map((option) => {
              const isSelected = selectedAnswers.includes(option.id);
              const optionIsCorrect = isAnswerCorrect(option.id);
              const showOptionFeedback = showFeedback;

              return (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => !showFeedback && handleQuizAnswer(option.id)}
                  disabled={showFeedback && !currentQuiz.multiSelect}
                  activeOpacity={0.7}
                  style={[
                    styles.quizOption,
                    isSelected && styles.quizOptionSelected,
                    showOptionFeedback && isSelected && optionIsCorrect && styles.quizOptionCorrect,
                    showOptionFeedback && isSelected && !optionIsCorrect && styles.quizOptionIncorrect,
                  ]}
                >
                  <View style={[
                    styles.quizCheckbox,
                    isSelected && styles.quizCheckboxSelected,
                    showOptionFeedback && isSelected && optionIsCorrect && styles.quizCheckboxCorrect,
                    showOptionFeedback && isSelected && !optionIsCorrect && styles.quizCheckboxIncorrect,
                  ]}>
                    {isSelected && <Check size={16} color="#ffffff" />}
                  </View>
                  <Text style={styles.quizOptionText}>{option.text}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {!showFeedback && currentQuiz.multiSelect && selectedAnswers.length > 0 && (
          <Button size="lg" onPress={handleSubmitMultiSelect} fullWidth>
            Submit Answer
          </Button>
        )}

        {showFeedback && (
          <Button size="lg" onPress={handleQuizNext} fullWidth>
            {currentQuizIndex === quizQuestions.length - 1 ? 'See Results' : 'Next Question'} →
          </Button>
        )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Summary Stage
  if (currentStep === 'summary') {
    const quizScore = calculateQuizScore();
    const scorePercentage = (quizScore / quizQuestions.length) * 100;
    const getMessage = () => {
      if (scorePercentage === 100) return { title: "⭐ Pattern Master!", subtitle: "You've got the eye." };
      if (scorePercentage >= 60) return { title: "Good work!", subtitle: "You're spotting the patterns." };
      return { title: "Keep learning", subtitle: "Review the examples again." };
    };
    const message = getMessage();

    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.centerContent}
        >
        <View style={styles.iconContainer}>
          <Text style={styles.trophyIcon}>🏆</Text>
        </View>
        <Text style={styles.title}>{message.title}</Text>
        <Text style={styles.subtitle}>{message.subtitle}</Text>
        <Text style={styles.score}>Score: {quizScore}/{quizQuestions.length}</Text>

        <Card style={styles.takeawaysCard}>
          <Text style={styles.takeawaysTitle}>Key Patterns to Remember:</Text>
          <View style={styles.takeawayItem}>
            <Check size={20} color={theme.colors.success} />
            <Text style={styles.takeawayText}>
              <Text style={styles.takeawayBold}>WHAT:</Text> Specific work, not vague goals
            </Text>
          </View>
          <View style={styles.takeawayItem}>
            <Check size={20} color={theme.colors.success} />
            <Text style={styles.takeawayText}>
              <Text style={styles.takeawayBold}>HOW MUCH:</Text> Metrics with before → after
            </Text>
          </View>
          <View style={styles.takeawayItem}>
            <Check size={20} color={theme.colors.success} />
            <Text style={styles.takeawayText}>
              <Text style={styles.takeawayBold}>WHEN:</Text> Clear strategic deadline
            </Text>
          </View>
          <View style={styles.takeawayItem}>
            <Check size={20} color={theme.colors.success} />
            <Text style={styles.takeawayText}>
              <Text style={styles.takeawayBold}>BESPOKE:</Text> If you can Google it, it's not a JTBD
            </Text>
          </View>
        </Card>

        <View style={styles.summaryButtons}>
          <Button size="lg" onPress={() => setCurrentStep('intro')} fullWidth>
            Return to Menu
          </Button>
          <Button size="lg" onPress={() => setCurrentStep('review')} fullWidth variant="outline">
            Review Answers
          </Button>
          <Button
            size="lg"
            onPress={() => {
              // Reset quiz and go back to examples
              setQuizScore(0);
              setQuizAnswers({});
              setCurrentStep('examples');
            }}
            fullWidth
            variant="outline"
          >
            Take Quiz Again
          </Button>
        </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Review Stage
  if (currentStep === 'review') {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
        >
        <Text style={styles.progress}>Review Your Answers</Text>

        {quizQuestions.map((question, index) => {
          const userAnswers = quizAnswers[question.id] || [];
          const correctAnswers = question.options.filter(o => o.correct).map(o => o.id);
          const isCorrect = JSON.stringify(userAnswers.sort()) === JSON.stringify(correctAnswers.sort());

          return (
            <Card key={question.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewQuestionNumber}>Question {index + 1}</Text>
                {isCorrect ? (
                  <View style={styles.correctBadge}>
                    <Check size={16} color="#ffffff" />
                    <Text style={styles.correctBadgeText}>Correct</Text>
                  </View>
                ) : (
                  <View style={styles.incorrectBadge}>
                    <X size={16} color="#ffffff" />
                    <Text style={styles.incorrectBadgeText}>Incorrect</Text>
                  </View>
                )}
              </View>

              <Text style={styles.reviewQuestionText}>{question.question}</Text>

              <View style={styles.reviewOptions}>
                {question.options.map((option) => {
                  const wasSelected = userAnswers.includes(option.id);
                  const isCorrectOption = option.correct;

                  return (
                    <View
                      key={option.id}
                      style={[
                        styles.reviewOption,
                        isCorrectOption && styles.reviewOptionCorrect,
                        wasSelected && !isCorrectOption && styles.reviewOptionIncorrect,
                      ]}
                    >
                      <View style={styles.reviewOptionHeader}>
                        {isCorrectOption ? (
                          <Check size={20} color={theme.colors.success} />
                        ) : wasSelected ? (
                          <X size={20} color={theme.colors.error} />
                        ) : (
                          <View style={styles.reviewOptionEmpty} />
                        )}
                        <Text style={[
                          styles.reviewOptionText,
                          isCorrectOption && styles.reviewOptionTextCorrect,
                        ]}>
                          {option.text}
                        </Text>
                      </View>
                      {wasSelected && !isCorrectOption && (
                        <Text style={styles.reviewYourAnswer}>(Your answer)</Text>
                      )}
                    </View>
                  );
                })}
              </View>

              {question.feedback && (
                <View style={styles.reviewFeedback}>
                  <Text style={styles.reviewFeedbackText}>{question.feedback}</Text>
                </View>
              )}
            </Card>
          );
        })}

        <View style={{ gap: 12 }}>
          <Button size="lg" onPress={() => setCurrentStep('intro')} fullWidth>
            Return to Menu
          </Button>
          <Button
            variant="outline"
            size="lg"
            onPress={() => {
              // Reset quiz and go back to examples
              setQuizScore(0);
              setQuizAnswers({});
              setCurrentStep('examples');
            }}
            fullWidth
          >
            Take Quiz Again
          </Button>
        </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
      <Text style={styles.progress}>Example {currentExample + 1} of {jtbdExamples.length}</Text>

      <Card style={styles.contextCard}>
        <Text style={styles.role}>{example.role}</Text>
        <Text style={styles.contextTitle}>{example.context.title}</Text>
        <Text style={styles.contextText}>Company: {example.context.company}</Text>
        <Text style={styles.contextText}>Challenge: {example.context.challenge}</Text>
        <Text style={styles.contextText}>Priority: {example.context.priority}</Text>
      </Card>

      <View style={styles.examplesContainer}>
        {/* Bad Example */}
        <TouchableOpacity onPress={() => setShowBadWhy(!showBadWhy)} activeOpacity={0.7}>
          <Card style={styles.badCard}>
            <View style={styles.badHeader}>
              <View style={styles.badIconContainer}>
                <X size={20} color="#ef4444" />
              </View>
              <Text style={styles.badTitle}>Bad JTBD</Text>
              {showBadWhy ? (
                <ChevronUp size={20} color="#ef4444" />
              ) : (
                <ChevronDown size={20} color="#ef4444" />
              )}
            </View>
            <Text style={styles.badStatement}>{example.badJtbd.statement}</Text>

            {showBadWhy && (
              <View style={styles.whySection}>
                <Text style={styles.whySectionTitle}>WHY IT'S BAD:</Text>
                {example.badJtbd.whyBad.map((reason, index) => (
                  <View key={index} style={styles.reasonRow}>
                    <X size={16} color="#ef4444" style={styles.reasonIcon} />
                    <Text style={styles.reason}>{reason}</Text>
                  </View>
                ))}
              </View>
            )}
          </Card>
        </TouchableOpacity>

        {/* Good Example */}
        <TouchableOpacity onPress={() => setShowGoodWhy(!showGoodWhy)} activeOpacity={0.7}>
          <Card style={styles.goodCard}>
            <View style={styles.goodHeader}>
              <View style={styles.goodIconContainer}>
                <Check size={20} color="#10b981" />
              </View>
              <Text style={styles.goodTitle}>Good JTBD</Text>
              {showGoodWhy ? (
                <ChevronUp size={20} color="#10b981" />
              ) : (
                <ChevronDown size={20} color="#10b981" />
              )}
            </View>
            <Text style={styles.goodStatement}>{example.goodJtbd.statement}</Text>

            {showGoodWhy && (
              <View style={styles.whySection}>
                <Text style={styles.whySectionTitleGood}>WHY IT'S GOOD:</Text>
                {example.goodJtbd.whyGood.map((reason, index) => (
                  <View key={index} style={styles.reasonRow}>
                    <Check size={16} color="#10b981" style={styles.reasonIcon} />
                    <Text style={styles.reason}>{reason}</Text>
                  </View>
                ))}
              </View>
            )}
          </Card>
        </TouchableOpacity>
      </View>

      <Text style={styles.tapHint}>
        {showBadWhy || showGoodWhy ? 'Tap cards to hide analysis' : 'Tap cards to reveal analysis'}
      </Text>

      <View style={styles.navigation}>
        <Button
          onPress={prevExample}
          disabled={currentExample === 0}
          variant="outline"
          style={styles.navButton}
        >
          Previous
        </Button>
        <Button
          onPress={nextExample}
          style={styles.navButton}
        >
          {currentExample === jtbdExamples.length - 1 ? 'Take Quiz' : 'Next'}
        </Button>
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
  centerContent: {
    padding: theme.spacing.lg,
    paddingBottom: 100, // Extra space for tab bar
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(220, 38, 38, 0.08)',
    marginBottom: theme.spacing.xl,
  },
  introText: {
    fontSize: theme.fontSize.subhead,
    color: theme.colors.textSecondary,
    textAlign: 'center' as 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
    maxWidth: 600,
  },
  progress: {
    fontSize: theme.fontSize.subhead,
    color: theme.colors.textMuted,
    textAlign: 'center' as 'center',
    marginBottom: theme.spacing.lg,
    fontWeight: theme.fontWeight.medium,
  },
  title: {
    fontSize: theme.fontSize.largeTitle,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'center' as 'center',
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    fontSize: theme.fontSize.body,
    color: theme.colors.textSecondary,
    textAlign: 'center' as 'center',
    marginBottom: theme.spacing.lg,
  },
  contextCard: {
    marginBottom: theme.spacing.lg,
  },
  role: {
    fontSize: theme.fontSize.title2,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  contextTitle: {
    fontSize: theme.fontSize.title3,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  contextText: {
    fontSize: theme.fontSize.subhead,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    lineHeight: 20,
  },
  examplesContainer: {
    marginBottom: theme.spacing.md,
  },
  badCard: {
    marginBottom: theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error,
  },
  goodCard: {
    marginBottom: theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.success,
  },
  badHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  goodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  badIconContainer: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    marginRight: theme.spacing.md,
  },
  goodIconContainer: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    marginRight: theme.spacing.md,
  },
  badTitle: {
    flex: 1,
    fontSize: theme.fontSize.callout,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.error,
  },
  tapHint: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.textMuted,
    textAlign: 'center' as 'center',
    marginBottom: theme.spacing.md,
    fontStyle: 'italic' as 'italic',
  },
  goodTitle: {
    flex: 1,
    fontSize: theme.fontSize.callout,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.success,
  },
  badStatement: {
    fontSize: theme.fontSize.subhead,
    color: theme.colors.textSecondary,
    opacity: 0.7,
    fontStyle: 'italic' as 'italic',
    textDecorationLine: 'line-through' as 'line-through',
    lineHeight: 22,
    marginBottom: theme.spacing.sm,
  },
  goodStatement: {
    fontSize: theme.fontSize.subhead,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.medium,
    lineHeight: 22,
    marginBottom: theme.spacing.sm,
  },
  whySection: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  whySectionTitle: {
    fontSize: theme.fontSize.caption,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.error,
    marginBottom: theme.spacing.sm,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as 'uppercase',
  },
  whySectionTitleGood: {
    fontSize: theme.fontSize.caption,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.success,
    marginBottom: theme.spacing.sm,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as 'uppercase',
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  reasonIcon: {
    marginRight: theme.spacing.sm,
    marginTop: 2,
  },
  reason: {
    flex: 1,
    fontSize: theme.fontSize.subhead,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  // Quiz styles
  quizCard: {
    marginBottom: theme.spacing.lg,
  },
  quizType: {
    fontSize: theme.fontSize.subhead,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  quizQuestion: {
    fontSize: theme.fontSize.title3,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    lineHeight: 26,
  },
  quizHint: {
    fontSize: theme.fontSize.footnote,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.md,
  },
  quizOptions: {
    gap: theme.spacing.sm,
  },
  quizOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.divider,
    backgroundColor: theme.colors.card,
    marginBottom: theme.spacing.sm,
  },
  quizOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(220, 38, 38, 0.05)',
  },
  quizOptionCorrect: {
    borderColor: theme.colors.success,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  quizOptionIncorrect: {
    borderColor: theme.colors.error,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  quizCheckbox: {
    width: 24,
    height: 24,
    borderRadius: theme.borderRadius.full,
    borderWidth: 2,
    borderColor: theme.colors.textMuted,
    marginRight: theme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quizCheckboxSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  quizCheckboxCorrect: {
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.success,
  },
  quizCheckboxIncorrect: {
    borderColor: theme.colors.error,
    backgroundColor: theme.colors.error,
  },
  quizOptionText: {
    flex: 1,
    fontSize: theme.fontSize.subhead,
    color: theme.colors.text,
    lineHeight: 20,
  },
  quizFeedback: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.success,
  },
  quizFeedbackText: {
    fontSize: theme.fontSize.subhead,
    color: theme.colors.text,
    lineHeight: 20,
  },
  // Summary styles
  trophyIcon: {
    fontSize: 64,
  },
  score: {
    fontSize: theme.fontSize.largeTitle,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  takeawaysCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    width: '100%',
  },
  takeawaysTitle: {
    fontSize: theme.fontSize.title3,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  takeawayItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  takeawayText: {
    flex: 1,
    fontSize: theme.fontSize.subhead,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
    lineHeight: 20,
  },
  takeawayBold: {
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  summaryButtons: {
    gap: theme.spacing.md,
    width: '100%',
  },
  // Review styles
  reviewCard: {
    marginBottom: theme.spacing.lg,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  reviewQuestionNumber: {
    fontSize: theme.fontSize.callout,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  correctBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.success,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
  },
  correctBadgeText: {
    fontSize: theme.fontSize.caption,
    fontWeight: theme.fontWeight.semibold,
    color: '#ffffff',
  },
  incorrectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.error,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
  },
  incorrectBadgeText: {
    fontSize: theme.fontSize.caption,
    fontWeight: theme.fontWeight.semibold,
    color: '#ffffff',
  },
  reviewQuestionText: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    lineHeight: 22,
  },
  reviewOptions: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  reviewOption: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    backgroundColor: theme.colors.card,
  },
  reviewOptionCorrect: {
    borderColor: theme.colors.success,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  reviewOptionIncorrect: {
    borderColor: theme.colors.error,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  reviewOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  reviewOptionEmpty: {
    width: 20,
    height: 20,
  },
  reviewOptionText: {
    flex: 1,
    fontSize: theme.fontSize.subhead,
    color: theme.colors.text,
    lineHeight: 20,
  },
  reviewOptionTextCorrect: {
    fontWeight: theme.fontWeight.semibold,
  },
  reviewYourAnswer: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.error,
    fontStyle: 'italic' as 'italic',
    marginTop: theme.spacing.xs,
    marginLeft: 28,
  },
  reviewFeedback: {
    padding: theme.spacing.md,
    backgroundColor: 'rgba(220, 38, 38, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
  },
  reviewFeedbackText: {
    fontSize: theme.fontSize.subhead,
    color: theme.colors.text,
    lineHeight: 20,
  },
});
