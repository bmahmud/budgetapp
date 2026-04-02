import { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { GoalCard } from '@/components/goal-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useBudgetStore } from '@/store/budget-store';
import { Goal } from '@/types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, FringePalette } from '@/constants/theme';

export default function GoalDetailScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const { id } = useLocalSearchParams<{ id: string }>();
  const { goals, updateGoal, deleteGoal, isInitialized, initialize } = useBudgetStore();
  const [goal, setGoal] = useState<Goal | undefined>();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');

  const textColor = theme.text;
  const borderColor = theme.border;

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  useEffect(() => {
    if (id) {
      const found = goals.find((g) => g.id === id);
      if (found) {
        setGoal(found);
        setName(found.name);
        setTargetAmount(found.targetAmount.toString());
        setCurrentAmount(found.currentAmount.toString());
        setDeadline(found.deadline || '');
      }
    }
  }, [id, goals]);

  const handleSave = async () => {
    if (!id) return;
    const target = parseFloat(targetAmount);
    const current = parseFloat(currentAmount);

    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a goal name');
      return;
    }
    if (isNaN(target) || target <= 0) {
      Alert.alert('Error', 'Please enter a valid target amount');
      return;
    }
    if (isNaN(current) || current < 0) {
      Alert.alert('Error', 'Please enter a valid current amount');
      return;
    }

    try {
      await updateGoal(id, {
        name: name.trim(),
        targetAmount: target,
        currentAmount: current,
        deadline: deadline || undefined,
      });
      setIsEditing(false);
    } catch {
      Alert.alert('Could not save', 'Check your connection and Supabase configuration.');
    }
  };

  const handleDelete = () => {
    if (!id) return;
    Alert.alert('Delete Goal', 'Are you sure you want to delete this goal?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteGoal(id);
            router.back();
          } catch {
            Alert.alert('Could not delete', 'Check your connection and Supabase configuration.');
          }
        },
      },
    ]);
  };

  if (!goal) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ThemedView style={styles.loadingContainer}>
          <ThemedText>Loading...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={theme.primary} />
        </TouchableOpacity>
        <ThemedText type="subtitle">{isEditing ? 'Edit Goal' : 'Goal Details'}</ThemedText>
        <View style={styles.headerRight}>
          {isEditing ? (
            <TouchableOpacity onPress={handleSave}>
              <IconSymbol name="checkmark.circle.fill" size={24} color={FringePalette.income} />
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editButton}>
                <IconSymbol name="pencil" size={20} color={theme.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete}>
                <IconSymbol name="trash.fill" size={24} color={FringePalette.expense} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </ThemedView>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {!isEditing ? (
          <GoalCard goal={goal} />
        ) : (
          <ThemedView style={styles.form}>
            <ThemedView style={styles.inputGroup}>
              <ThemedText style={styles.label}>Goal Name</ThemedText>
              <TextInput
                style={[styles.input, { borderColor, color: textColor }]}
                value={name}
                onChangeText={setName}
                placeholderTextColor="#999"
              />
            </ThemedView>

            <ThemedView style={styles.inputGroup}>
              <ThemedText style={styles.label}>Target Amount</ThemedText>
              <TextInput
                style={[styles.input, { borderColor, color: textColor }]}
                value={targetAmount}
                onChangeText={setTargetAmount}
                keyboardType="decimal-pad"
                placeholderTextColor="#999"
              />
            </ThemedView>

            <ThemedView style={styles.inputGroup}>
              <ThemedText style={styles.label}>Current Amount</ThemedText>
              <TextInput
                style={[styles.input, { borderColor, color: textColor }]}
                value={currentAmount}
                onChangeText={setCurrentAmount}
                keyboardType="decimal-pad"
                placeholderTextColor="#999"
              />
            </ThemedView>

            <ThemedView style={styles.inputGroup}>
              <ThemedText style={styles.label}>Deadline (YYYY-MM-DD) - Optional</ThemedText>
              <TextInput
                style={[styles.input, { borderColor, color: textColor }]}
                value={deadline}
                onChangeText={setDeadline}
                placeholderTextColor="#999"
              />
            </ThemedView>

            <TouchableOpacity style={styles.cancelButton} onPress={() => setIsEditing(false)}>
              <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  editButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  form: {
    padding: 16,
    borderRadius: 12,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

