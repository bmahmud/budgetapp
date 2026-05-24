import { ScreenScroll } from '@/components/fringe/screen-scroll';
import { TransactionForm } from '@/components/transaction-form';
import { useBudgetStore } from '@/store/budget-store';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Alert } from 'react-native';

export default function AddTransactionScreen() {
  const router = useRouter();
  const { categories, addTransaction, isInitialized, initialize } = useBudgetStore();

  useEffect(() => {
    if (!isInitialized) initialize();
  }, [isInitialized, initialize]);

  const handleSubmit = async (data: Parameters<typeof addTransaction>[0]) => {
    try {
      await addTransaction(data);
      router.back();
    } catch {
      Alert.alert('Could not save', 'Check your connection and Supabase configuration.');
    }
  };

  return (
    <ScreenScroll>
      <TransactionForm
        categories={categories}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
      />
    </ScreenScroll>
  );
}
