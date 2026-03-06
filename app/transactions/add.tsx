import { useEffect } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { TransactionForm } from '@/components/transaction-form';
import { useBudgetStore } from '@/store/budget-store';

export default function AddTransactionScreen() {
  const router = useRouter();
  const { categories, addTransaction, isInitialized, initialize } = useBudgetStore();

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  const handleSubmit = (data: Parameters<typeof addTransaction>[0]) => {
    addTransaction(data);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <TransactionForm
          categories={categories}
          onSubmit={handleSubmit}
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 32,
  },
});

