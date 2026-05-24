import { Card } from '@/components/fringe/card';
import { DatePicker } from '@/components/date-picker';
import { FringeInput, Label } from '@/components/fringe/form';
import { GoalCard } from '@/components/goal-card';
import { ScreenScroll } from '@/components/fringe/screen-scroll';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/theme/ThemeContext';
import { useBudgetStore } from '@/store/budget-store';
import { Goal } from '@/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

export default function GoalDetailScreen() {
  const router = useRouter();
  const { c } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { goals, updateGoal, deleteGoal, isInitialized, initialize } = useBudgetStore();
  const [goal, setGoal] = useState<Goal | undefined>();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    if (!isInitialized) initialize();
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
        <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
          {isEditing ? (
            <Pressable onPress={handleSave} hitSlop={12} accessibilityRole="button">
              <IconSymbol name="checkmark.circle.fill" size={24} color={c.positive} />
            </Pressable>
          ) : (
            <>
              <Pressable onPress={() => setIsEditing(true)} hitSlop={12} accessibilityRole="button">
                <IconSymbol name="pencil" size={20} color={c.accent} />
              </Pressable>
              <Pressable onPress={handleDelete} hitSlop={12} accessibilityRole="button">
                <IconSymbol name="trash.fill" size={22} color={c.negative} />
              </Pressable>
            </>
          )}
        </View>
      </View>

      <View style={{ paddingHorizontal: 16, paddingBottom: 32 }}>
        <Text style={{ fontSize: 26, fontWeight: '700', color: c.ink1, letterSpacing: -0.6, marginBottom: 16 }}>
          {isEditing ? 'Edit Goal' : 'Goal Details'}
        </Text>

        {!isEditing ? (
          <GoalCard goal={goal} />
        ) : (
          <Card pad={16} radius="lg">
            <View style={{ marginBottom: 16 }}>
              <Label>Goal Name</Label>
              <FringeInput value={name} onChange={setName} />
            </View>

            <View style={{ marginBottom: 16 }}>
              <Label>Target Amount</Label>
              <FringeInput value={targetAmount} onChange={setTargetAmount} keyboardType="decimal-pad" />
            </View>

            <View style={{ marginBottom: 16 }}>
              <Label>Current Amount</Label>
              <FringeInput value={currentAmount} onChange={setCurrentAmount} keyboardType="decimal-pad" />
            </View>

            <View style={{ marginBottom: 16 }}>
              <Label>Deadline (optional)</Label>
              <DatePicker value={deadline} onChange={setDeadline} placeholder="mm / dd / yyyy" borderColor={c.line} />
            </View>

            <Pressable
              onPress={() => setIsEditing(false)}
              style={{
                marginTop: 8,
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: 'center',
                backgroundColor: c.bgSubtle,
                borderWidth: 1,
                borderColor: c.line,
              }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: c.ink2 }}>Cancel</Text>
            </Pressable>
          </Card>
        )}
      </View>
    </ScreenScroll>
  );
}
