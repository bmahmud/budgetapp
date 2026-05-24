import { ScreenScroll } from '@/components/fringe/screen-scroll';
import { TransactionForm } from '@/components/transaction-form';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/theme/ThemeContext';
import { useBudgetStore } from '@/store/budget-store';
import { Transaction } from '@/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

export default function TransactionDetailScreen() {
  const router = useRouter();
  const { c } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { transactions, categories, updateTransaction, deleteTransaction, isInitialized, initialize } =
    useBudgetStore();
  const [transaction, setTransaction] = useState<Transaction | undefined>();

  useEffect(() => {
    if (!isInitialized) initialize();
  }, [isInitialized, initialize]);

  useEffect(() => {
    if (id) {
      setTransaction(transactions.find((t) => t.id === id));
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
      <ScreenScroll>
        <Text style={{ marginTop: 48, textAlign: 'center', color: c.ink3 }}>Loading...</Text>
      </ScreenScroll>
    );
  }

  return (
    <ScreenScroll>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingBottom: 8,
        }}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button">
          <IconSymbol name="chevron.left" size={24} color={c.accent} />
        </Pressable>
        <Pressable onPress={handleDelete} hitSlop={12} accessibilityRole="button">
          <IconSymbol name="trash.fill" size={22} color={c.negative} />
        </Pressable>
      </View>

      <TransactionForm
        categories={categories}
        initialData={transaction}
        onSubmit={handleUpdate}
        onCancel={() => router.back()}
        title="Edit Transaction"
      />
    </ScreenScroll>
  );
}
