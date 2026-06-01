import { Card } from '@/components/fringe/card';
import { CategoryIcon } from '@/components/fringe/category-icon';
import { FringeIcon } from '@/components/fringe/icon';
import { FringeInput, Label, Toggle } from '@/components/fringe/form';
import { Segmented } from '@/components/fringe/segmented';
import { DatePicker } from '@/components/date-picker';
import { useTheme } from '@/theme/ThemeContext';
import { recurringFrequencyHint } from '@/lib/recurring';
import { Category, RecurringFrequency, Transaction } from '@/types';
import { format } from 'date-fns';
import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';

interface TransactionFormProps {
  categories: Category[];
  initialData?: Partial<Transaction>;
  onSubmit: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void | Promise<void>;
  onCancel: () => void;
  title?: string;
  showHeader?: boolean;
}

export function TransactionForm({
  categories,
  initialData,
  onSubmit,
  onCancel,
  title = 'New transaction',
  showHeader = true,
}: TransactionFormProps) {
  const { c, sh } = useTheme();
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
  const [description, setDescription] = useState(initialData?.notes || '');
  const [date, setDate] = useState(initialData?.date || format(new Date(), 'yyyy-MM-dd'));
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [notes, setNotes] = useState('');
  const [type, setType] = useState<'income' | 'expense'>(initialData?.type || 'expense');
  const [isRecurring, setIsRecurring] = useState(initialData?.isRecurring || false);
  const [recurringFrequency, setRecurringFrequency] = useState<RecurringFrequency>(
    initialData?.recurringFrequency || 'monthly',
  );

  const filteredCategories = categories.filter((cat) => {
    if (type === 'income') return /salary|income|pay/i.test(cat.name);
    return !/salary|income|pay/i.test(cat.name);
  });
  const displayCategories = filteredCategories.length > 0 ? filteredCategories : categories;

  const valid = parseFloat(amount) > 0 && categoryId.length > 0;

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

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      Alert.alert('Error', 'Please enter a valid date in YYYY-MM-DD format');
      return;
    }

    await onSubmit({
      amount: amountNum,
      date,
      categoryId,
      notes: (description.trim() || notes.trim()) || undefined,
      type,
      isRecurring,
      recurringFrequency: isRecurring ? recurringFrequency : undefined,
    });
  };

  return (
    <View style={{ paddingHorizontal: 16, paddingTop: showHeader ? 8 : 0, paddingBottom: 32 }}>
      {showHeader ? (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Text style={{ fontSize: 26, fontWeight: '700', color: c.ink1, letterSpacing: -0.6 }}>{title}</Text>
          <Pressable
            onPress={onCancel}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: c.bgSubtle,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <FringeIcon name="close" size={16} color={c.ink2} strokeWidth={2.4} />
          </Pressable>
        </View>
      ) : null}

      <View style={{ marginBottom: 18, alignItems: 'flex-start' }}>
        <Segmented
          options={[
            { value: 'expense', label: 'Expense' },
            { value: 'income', label: 'Income' },
          ]}
          value={type}
          onChange={(v) => {
            setType(v);
            setCategoryId('');
          }}
        />
      </View>

      <View style={{ alignItems: 'center', paddingVertical: 24 }}>
        <Text style={{ fontSize: 11, color: c.ink3, fontWeight: '600', letterSpacing: 0.4, marginBottom: 6 }}>
          AMOUNT
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
          <Text
            style={{
              fontSize: 36,
              opacity: 0.45,
              marginRight: 4,
              color: type === 'income' ? c.positive : c.ink1,
              fontWeight: '700',
            }}>
            {type === 'income' ? '+' : '−'}
          </Text>
          <Text
            style={{
              fontSize: 36,
              opacity: 0.45,
              marginRight: 2,
              color: type === 'income' ? c.positive : c.ink1,
              fontWeight: '700',
            }}>
            $
          </Text>
          <TextInput
            value={amount}
            onChangeText={(v) => setAmount(v.replace(/[^0-9.]/g, ''))}
            placeholder="0"
            placeholderTextColor={(type === 'income' ? c.positive : c.ink1) + '55'}
            keyboardType="decimal-pad"
            style={{
              minWidth: 60,
              fontSize: 56,
              fontWeight: '700',
              letterSpacing: -1.8,
              color: type === 'income' ? c.positive : c.ink1,
              fontVariant: ['tabular-nums'],
              padding: 0,
            }}
          />
        </View>
      </View>

      <View style={{ marginBottom: 14 }}>
        <Label>Description</Label>
        <FringeInput value={description} onChange={setDescription} placeholder="What was it for?" />
      </View>

      <View style={{ marginBottom: 18 }}>
        <Label>Date</Label>
        <DatePicker value={date} onChange={setDate} placeholder="mm / dd / yyyy" borderColor={c.line} />
      </View>

      <Label>Category</Label>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4, marginBottom: 18 }}>
        {displayCategories.map((category) => {
          const active = categoryId === category.id;
          return (
            <View key={category.id} style={{ width: '25%', padding: 4 }}>
              <Pressable
                onPress={() => setCategoryId(category.id)}
                style={{
                  alignItems: 'center',
                  gap: 6,
                  paddingVertical: 14,
                  paddingHorizontal: 6,
                  backgroundColor: active ? `${category.color}18` : c.bgElev,
                  borderWidth: active ? 1.5 : 1,
                  borderColor: active ? category.color : c.line,
                  borderRadius: 14,
                }}>
                <CategoryIcon category={category} size={32} />
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 10.5,
                    fontWeight: '600',
                    color: active ? category.color : c.ink2,
                    textAlign: 'center',
                  }}>
                  {category.name}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>

      <Card tone="subtle" pad={14} radius="md" style={{ marginBottom: isRecurring ? 12 : 18 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: c.accentSoft,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <FringeIcon name="refresh" size={16} color={c.accent} strokeWidth={2.2} />
            </View>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: c.ink1 }}>Recurring</Text>
              <Text style={{ fontSize: 12, color: c.ink3 }}>
                {isRecurring ? recurringFrequencyHint(recurringFrequency, type) : 'Mark regular income or bills'}
              </Text>
            </View>
          </View>
          <Toggle checked={isRecurring} onChange={setIsRecurring} />
        </View>
      </Card>

      {isRecurring ? (
        <View style={{ marginBottom: 18 }}>
          <Label>Frequency</Label>
          <Segmented
            options={[
              { value: 'monthly', label: 'Monthly' },
              { value: 'biweekly', label: 'Biweekly' },
            ]}
            value={recurringFrequency}
            onChange={(v) => setRecurringFrequency(v as RecurringFrequency)}
          />
        </View>
      ) : null}

      <Pressable
        onPress={() => void handleSubmit()}
        disabled={!valid}
        style={({ pressed }) => [
          {
            paddingVertical: 15,
            paddingHorizontal: 20,
            backgroundColor: valid ? c.accent : c.bgSubtle,
            borderRadius: 14,
            alignItems: 'center',
            ...(valid ? sh.fab : {}),
          },
          pressed && valid && { transform: [{ scale: 0.985 }] },
        ]}>
        <Text style={{ fontSize: 15, fontWeight: '600', color: valid ? c.accentOn : c.ink3 }}>
          {initialData ? 'Save changes' : 'Add transaction'}
        </Text>
      </Pressable>
    </View>
  );
}
