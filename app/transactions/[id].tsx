import { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { TransactionForm } from '@/components/transaction-form';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, FringePalette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useBudgetStore } from '@/store/budget-store';
import { Transaction } from '@/types';

export default function TransactionDetailScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const { id } = useLocalSearchParams<{ id: string }>();
  const { transactions, categories, updateTransaction, deleteTransaction, isInitialized, initialize } =
    useBudgetStore();
  const [transaction, setTransaction] = useState<Transaction | undefined>();

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  useEffect(() => {
    if (id) {
      const found = transactions.find((t) => t.id === id);
      setTransaction(found);
    }
  }, [id, transactions]);

  const handleUpdate = async (data: Parameters<typeof updateTransaction>[1]) => {
    if (!id) return;
    try {
      await updateTransaction(id, data);
      router.back();
    } catch {
      Alert.alert('Could not save', 'Check your connection and Supabase configuration.');
    }
  };

  const handleDelete = () => {
    if (!id) return;
    Alert.alert('Delete Transaction', 'Are you sure you want to delete this transaction?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTransaction(id);
            router.back();
          } catch {
            Alert.alert('Could not delete', 'Check your connection and Supabase configuration.');
          }
        },
      },
    ]);
  };

  if (!transaction) {
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
        <ThemedText type="subtitle">Edit Transaction</ThemedText>
        <TouchableOpacity onPress={handleDelete}>
          <IconSymbol name="trash.fill" size={24} color={FringePalette.expense} />
        </TouchableOpacity>
      </ThemedView>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <TransactionForm
          categories={categories}
          initialData={transaction}
          onSubmit={handleUpdate}
          onCancel={() => router.back()}
        />
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 32,
  },
});

