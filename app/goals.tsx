import { useEffect, useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { GoalCard } from '@/components/goal-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useBudgetStore } from '@/store/budget-store';
import { Goal } from '@/types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function GoalsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const { goals, addGoal, isLoading, isInitialized, initialize } = useBudgetStore();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');

  const textColor = theme.text;
  const borderColor = theme.border;

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  const handleAddGoal = () => {
    const amount = parseFloat(targetAmount);
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a goal name');
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid target amount');
      return;
    }

    addGoal({
      name: name.trim(),
      targetAmount: amount,
      currentAmount: 0,
      deadline: deadline || undefined,
    });
    setName('');
    setTargetAmount('');
    setDeadline('');
    setShowForm(false);
  };

  const renderGoal = ({ item }: { item: Goal }) => (
    <GoalCard goal={item} onPress={() => router.push(`/goals/${item.id}`)} />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Financial Goals</ThemedText>
        <TouchableOpacity onPress={() => setShowForm(!showForm)}>
          <IconSymbol name={showForm ? 'xmark.circle.fill' : 'plus.circle.fill'} size={28} color={theme.primary} />
        </TouchableOpacity>
      </ThemedView>

      {showForm && (
        <ThemedView style={styles.form}>
          <ThemedText type="subtitle" style={styles.formTitle}>
            New Goal
          </ThemedText>
          <TextInput
            style={[styles.input, { borderColor, color: textColor }]}
            placeholder="Goal name"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#999"
          />
          <TextInput
            style={[styles.input, { borderColor, color: textColor }]}
            placeholder="Target amount"
            value={targetAmount}
            onChangeText={setTargetAmount}
            keyboardType="decimal-pad"
            placeholderTextColor="#999"
          />
          <TextInput
            style={[styles.input, { borderColor, color: textColor }]}
            placeholder="Deadline (YYYY-MM-DD) - Optional"
            value={deadline}
            onChangeText={setDeadline}
            placeholderTextColor="#999"
          />
          <View style={styles.formButtons}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.border }]}
              onPress={() => setShowForm(false)}>
              <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.primary }]}
              onPress={handleAddGoal}>
              <ThemedText style={styles.submitButtonText}>Create</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      )}

      {isLoading ? (
        <ThemedView style={styles.loadingContainer}>
          <ThemedText>Loading...</ThemedText>
        </ThemedView>
      ) : goals.length === 0 ? (
        <ThemedView style={styles.emptyState}>
          <IconSymbol name="target" size={64} color="#999" />
          <ThemedText style={styles.emptyText}>No goals yet</ThemedText>
          <ThemedText style={styles.emptySubtext}>Create a goal to start tracking your progress</ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={goals}
          renderItem={renderGoal}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  form: {
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  formTitle: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {},
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {},
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
});

