import { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Alert, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useBudgetStore } from '@/store/budget-store';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SettingsScreen() {
  const { isInitialized, initialize, resetAllData } = useBudgetStore();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  const handleReset = () => {
    Alert.alert(
      'Reset All Data',
      'Are you sure you want to delete all transactions, goals, and custom categories? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetAllData();
            Alert.alert('Success', 'All data has been reset.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Settings</ThemedText>
      </ThemedView>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <ThemedView style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            App Information
          </ThemedText>
          <ThemedView style={[styles.infoRow, { borderBottomColor: theme.border }]}>
            <ThemedText style={styles.infoLabel}>Version</ThemedText>
            <ThemedText style={styles.infoValue}>1.0.1</ThemedText>
          </ThemedView>
          <ThemedView style={[styles.infoRow, { borderBottomColor: theme.border }]}>
            <ThemedText style={styles.infoLabel}>Theme</ThemedText>
            <ThemedText style={styles.infoValue}>
              {colorScheme === 'dark' ? 'Vibrant · Dark' : 'Vibrant'}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Data Management
          </ThemedText>
          <TouchableOpacity
            style={[styles.resetBox, { backgroundColor: colorScheme === 'dark' ? '#3F1D2B' : '#FEE2E2', borderColor: colorScheme === 'dark' ? '#9F1239' : '#FECACA' }]}
            onPress={handleReset}
            activeOpacity={0.85}>
            <View style={styles.settingLeft}>
              <IconSymbol name="trash.fill" size={24} color="#DC2626" />
              <ThemedText style={styles.settingLabel}>Reset All Data</ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={20} color={theme.mutedText} />
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            About
          </ThemedText>
          <ThemedText style={[styles.aboutText, { color: theme.mutedText }]}>
            Fringe helps you track your income and expenses, set financial goals, and gain insights into
            your spending habits.
          </ThemedText>
          <ThemedText style={[styles.aboutText, { color: theme.mutedText }]}>
            All your data is stored locally on your device and is never shared externally.
          </ThemedText>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  infoLabel: {
    fontSize: 16,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  resetBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
});

