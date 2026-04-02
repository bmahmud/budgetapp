import { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Switch, Alert } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { IconSymbol } from './ui/icon-symbol';
import { DatePicker } from './date-picker';
import { Transaction, Category } from '@/types';
import { format } from 'date-fns';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface TransactionFormProps {
  categories: Category[];
  initialData?: Partial<Transaction>;
  onSubmit: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void | Promise<void>;
  onCancel: () => void;
}

export function TransactionForm({ categories, initialData, onSubmit, onCancel }: TransactionFormProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
  const [date, setDate] = useState(
    initialData?.date || format(new Date(), 'yyyy-MM-dd')
  );
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [type, setType] = useState<'income' | 'expense'>(initialData?.type || 'expense');
  const [isRecurring, setIsRecurring] = useState(initialData?.isRecurring || false);

  const textColor = theme.text;
  const borderColor = theme.border;

  const filteredCategories = categories.filter((c) => {
    // For income, show income categories; for expense, show expense categories
    // This is a simple heuristic - you might want to add a category type field
    return true; // Show all for now
  });

  const handleSubmit = async () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    if (!categoryId) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      Alert.alert('Error', 'Please enter a valid date in YYYY-MM-DD format');
      return;
    }

    await onSubmit({
      amount: amountNum,
      date,
      categoryId,
      notes: notes.trim() || undefined,
      type,
      isRecurring,
      recurringFrequency: isRecurring ? 'monthly' : undefined,
    });
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Add Transaction</ThemedText>
        <TouchableOpacity onPress={onCancel}>
          <IconSymbol name="xmark.circle.fill" size={24} color="#999" />
        </TouchableOpacity>
      </ThemedView>

      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            { borderColor },
            type === 'income' && { borderColor: theme.primary, backgroundColor: `${theme.primary}22` },
          ]}
          onPress={() => setType('income')}>
          <ThemedText style={[styles.typeButtonText, type === 'income' && { color: theme.primary, fontWeight: '700' }]}>
            Income
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.typeButton,
            { borderColor },
            type === 'expense' && { borderColor: theme.primary, backgroundColor: `${theme.primary}22` },
          ]}
          onPress={() => setType('expense')}>
          <ThemedText style={[styles.typeButtonText, type === 'expense' && { color: theme.primary, fontWeight: '700' }]}>
            Expense
          </ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <ThemedText style={styles.label}>Amount</ThemedText>
        <TextInput
          style={[styles.input, { borderColor, color: textColor }]}
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          keyboardType="decimal-pad"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputGroup}>
        <ThemedText style={styles.label}>Date</ThemedText>
        <DatePicker
          value={date}
          onChange={setDate}
          placeholder="mm / dd / yyyy"
          borderColor={borderColor}
        />
      </View>

      <View style={styles.inputGroup}>
        <ThemedText style={styles.label}>Category</ThemedText>
        <View style={styles.categoryGrid}>
          {filteredCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                { borderColor },
                categoryId === category.id && {
                  borderColor: theme.primary,
                  backgroundColor: `${theme.primary}18`,
                },
              ]}
              onPress={() => setCategoryId(category.id)}>
              <View style={[styles.categoryIcon, { backgroundColor: `${category.color}20` }]}>
                <IconSymbol name={category.icon} size={20} color={category.color} />
              </View>
              <ThemedText
                style={[
                  styles.categoryName,
                  categoryId === category.id && styles.categoryNameActive,
                ]}>
                {category.name}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <ThemedText style={styles.label}>Notes (optional)</ThemedText>
        <TextInput
          style={[styles.input, styles.textArea, { borderColor, color: textColor }]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Add a note..."
          multiline
          numberOfLines={3}
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.switchGroup}>
        <ThemedText style={styles.label}>Recurring Transaction</ThemedText>
        <Switch value={isRecurring} onValueChange={setIsRecurring} />
      </View>

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.border }]}
          onPress={onCancel}>
          <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={handleSubmit}>
          <ThemedText style={styles.submitButtonText}>Save</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
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
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    width: '30%',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 12,
    textAlign: 'center',
  },
  categoryNameActive: {
    fontWeight: '600',
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

