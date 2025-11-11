/**
 * SimpleNavigator - Custom lightweight bottom tab navigation
 *
 * WHY NOT REACT NAVIGATION?
 * This custom navigator is intentionally simple (108 lines) and handles our current needs:
 * - 4 bottom tab screens
 * - Simple navigation without deep linking
 * - No complex navigation state
 *
 * WHEN TO MIGRATE TO REACT NAVIGATION:
 * Consider migrating if you need:
 * - Deep linking / universal links
 * - Stack navigation beyond tabs
 * - Complex navigation state management
 * - Navigation lifecycle hooks (focus listeners, etc.)
 * - Native navigation gestures
 *
 * TRADE-OFFS OF MIGRATION:
 * - Time: 6-12 hours of work
 * - Bundle size: +185KB
 * - Complexity: More boilerplate code
 * - Risk: Core functionality refactor
 *
 * See docs/CHANGELOG.md [2025-11-11] for detailed rationale.
 */

import React, { useState, createContext, useContext } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { Home, BookOpen, Hammer, Search } from 'lucide-react-native';
import HomePage from '../pages/HomePage';
import LearnPage from '../pages/LearnPage';
import BuildPage from '../pages/BuildPage';
import CritiquePage from '../pages/CritiquePage';
import { theme } from '../lib/theme';

type Screen = 'Home' | 'Learn' | 'Build' | 'Critique';

interface NavigationContextType {
  navigate: (screen: Screen) => void;
  goBack: () => void;
}

const NavigationContext = createContext<NavigationContextType>({
  navigate: () => {},
  goBack: () => {},
});

export const useNavigation = () => useContext(NavigationContext);

export default function SimpleNavigator() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('Home');

  const navigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const goBack = () => {
    setCurrentScreen('Home');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Home':
        return <HomePage />;
      case 'Learn':
        return <LearnPage />;
      case 'Build':
        return <BuildPage />;
      case 'Critique':
        return <CritiquePage />;
      default:
        return <HomePage />;
    }
  };

  const TabButton = ({ screen, icon: Icon, label }: { screen: Screen; icon: any; label: string }) => {
    const isActive = currentScreen === screen;
    return (
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => navigate(screen)}
        activeOpacity={0.7}
      >
        <Icon
          size={24}
          color={isActive ? theme.colors.primary : theme.colors.textMuted}
          strokeWidth={isActive ? 2.5 : 2}
        />
        <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <NavigationContext.Provider value={{ navigate, goBack }}>
      <View style={styles.container}>
        <View style={styles.content}>
          {renderScreen()}
        </View>
        <View style={styles.tabBar}>
          <TabButton screen="Home" icon={Home} label="Home" />
          <TabButton screen="Learn" icon={BookOpen} label="Learn" />
          <TabButton screen="Build" icon={Hammer} label="Build" />
          <TabButton screen="Critique" icon={Search} label="Critique" />
        </View>
      </View>
    </NavigationContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0, // Account for iOS safe area
    paddingTop: theme.spacing.sm,
    ...theme.shadows.md,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    minHeight: theme.touchTarget.min, // Ensure minimum touch target
  },
  tabLabel: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.textMuted,
    marginTop: 4,
    fontWeight: theme.fontWeight.medium,
  },
  tabLabelActive: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },
});
