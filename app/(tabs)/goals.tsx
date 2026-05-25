import { Card } from '@/components/fringe/card';
import { FringeIcon } from '@/components/fringe/icon';
import { HeaderLogo } from '@/components/fringe/header-logo';
import { ProgressBar } from '@/components/fringe/progress-bar';
import { ScreenScroll } from '@/components/fringe/screen-scroll';
import { SectionHeader } from '@/components/fringe/section-header';
import { DatePicker } from '@/components/date-picker';
import { GoalCard } from '@/components/goal-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/theme/ThemeContext';
import { useBudgetStore } from '@/store/budget-store';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const GOAL_COLORS = ['#9FE1CB', '#5546E0', '#6A61C8', '#197B5A', '#F59E0B', '#B0413F', '#3B82F6'];

export default function GoalsScreen() {
  const router = useRouter();
  const { c } = useTheme();
  const theme = {
    text: c.ink1,
    border: c.line,
    primary: c.accent,
    card: c.bgElev,
    background: c.bgBase,
    mutedText: c.ink3,
    tint: c.accent,
  };
  const { goals, addGoal, isLoading, isInitialized, initialize } = useBudgetStore();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('10000');
  const [alreadySaved, setAlreadySaved] = useState('0');
  const [targetDate, setTargetDate] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState(GOAL_COLORS[0]);

  const textColor = theme.text;
  const borderColor = theme.border;
  const activeBorderColor = theme.primary;

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  const handleIncrement = (field: 'target' | 'saved') => {
    const currentValue = field === 'target' ? parseFloat(targetAmount) || 0 : parseFloat(alreadySaved) || 0;
    const newValue = currentValue + 100;
    if (field === 'target') {
      setTargetAmount(newValue.toString());
    } else {
      setAlreadySaved(newValue.toString());
    }
  };

  const handleDecrement = (field: 'target' | 'saved') => {
    const currentValue = field === 'target' ? parseFloat(targetAmount) || 0 : parseFloat(alreadySaved) || 0;
    const newValue = Math.max(0, currentValue - 100);
    if (field === 'target') {
      setTargetAmount(newValue.toString());
    } else {
      setAlreadySaved(newValue.toString());
    }
  };

  const handleCreateGoal = () => {
    const amount = parseFloat(targetAmount);
    const saved = parseFloat(alreadySaved) || 0;
    
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a goal name');
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid target amount');
      return;
    }
    if (saved > amount) {
      Alert.alert('Error', 'Already saved amount cannot exceed target amount');
      return;
    }

    void (async () => {
      try {
        await addGoal({
          name: name.trim(),
          targetAmount: amount,
          currentAmount: saved,
          deadline: targetDate || undefined,
          color: selectedColor,
        });
        setName('');
        setTargetAmount('10000');
        setAlreadySaved('0');
        setTargetDate('');
        setSelectedColor(GOAL_COLORS[0]);
        setShowModal(false);
      } catch {
        Alert.alert('Could not create goal', 'Check your connection and Supabase configuration.');
      }
    })();
  };

  const handleCancel = () => {
    setName('');
    setTargetAmount('10000');
    setAlreadySaved('0');
    setTargetDate('');
    setSelectedColor(GOAL_COLORS[0]);
    setShowModal(false);
  };

  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);

  return (
    <ScreenScroll>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          paddingBottom: 18,
        }}>
        <View>
          <Text style={{ fontSize: 12, color: c.ink3, fontWeight: '600', letterSpacing: 0.4 }}>FUTURE</Text>
          <Text style={{ fontSize: 26, fontWeight: '700', color: c.ink1, letterSpacing: -0.6 }}>Goals</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <HeaderLogo />
          <Pressable
            onPress={() => setShowModal(true)}
            style={{
              backgroundColor: c.ink1,
              paddingHorizontal: 16,
              paddingVertical: 10,
              paddingLeft: 12,
              borderRadius: 999,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
            }}>
            <FringeIcon name="plus" size={16} color={c.bgElev} strokeWidth={2.4} />
            <Text style={{ fontSize: 13, fontWeight: '600', color: c.bgElev }}>New goal</Text>
          </Pressable>
        </View>
      </View>

      {goals.length > 0 ? (
        <Card pad={20} radius="xl" tone="accent" style={{ marginBottom: 18, borderColor: c.accent }}>
          <Text style={{ fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.7)', letterSpacing: 0.4 }}>
            TOTAL SAVED ACROSS GOALS
          </Text>
          <Text
            style={{
              fontSize: 38,
              fontWeight: '700',
              letterSpacing: -1.2,
              color: '#fff',
              marginTop: 6,
              fontVariant: ['tabular-nums'],
            }}>
            ${Math.round(totalSaved).toLocaleString()}
          </Text>
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>
            of <Text style={{ color: '#fff', fontWeight: '700' }}>${Math.round(totalTarget).toLocaleString()}</Text> target
          </Text>
          <View style={{ marginTop: 14 }}>
            <ProgressBar
              value={totalSaved}
              max={totalTarget || 1}
              color="rgba(255,255,255,0.95)"
              bg="rgba(255,255,255,0.2)"
              height={6}
            />
          </View>
        </Card>
      ) : null}

      {isLoading ? (
        <Text style={{ marginTop: 24, textAlign: 'center', color: c.ink3 }}>Loading...</Text>
      ) : goals.length === 0 ? (
        <Card pad={24} radius="lg" style={{ alignItems: 'center' }}>
          <IconSymbol name="target" size={48} color={c.ink3} />
          <Text style={{ fontSize: 16, fontWeight: '700', color: c.ink1, marginTop: 12 }}>No goals yet</Text>
          <Text style={{ fontSize: 13, color: c.ink2, marginTop: 6, textAlign: 'center' }}>
            Create a goal to start tracking your progress
          </Text>
        </Card>
      ) : (
        <>
          <SectionHeader title="Your goals" />
          <View style={{ gap: 10 }}>
            {goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} onPress={() => router.push(`/goals/${goal.id}`)} />
            ))}
          </View>
        </>
      )}

      {/* Create Goal Modal */}
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={handleCancel}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            style={styles.keyboardAvoidingView}>
            <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
              {/* Modal Header */}
              <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
                <View style={styles.modalHeaderLeft}>
                  <View style={[styles.modalIcon, { backgroundColor: `${selectedColor}20` }]}>
                    <IconSymbol name="target" size={24} color={selectedColor} />
                  </View>
                  <Text style={[styles.modalTitle, { color: c.ink1 }]}>Create New Goal</Text>
                </View>
                <TouchableOpacity onPress={handleCancel}>
                  <IconSymbol name="xmark.circle.fill" size={24} color="#999" />
                </TouchableOpacity>
              </View>

              <ScrollView 
                style={styles.modalScroll} 
                contentContainerStyle={styles.modalScrollContent}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled">
              {/* Goal Name */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: c.ink2 }]}>Goal Name</Text>
                <TextInput
                  style={[
                    styles.input,
                    { borderColor: activeBorderColor, color: textColor, backgroundColor: theme.background },
                  ]}
                  placeholder="e.g., Emergency Fund, Vacation"
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor="#999"
                  autoCapitalize="words"
                  returnKeyType="next"
                  editable={true}
                />
              </View>

              {/* Target Amount */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: c.ink2 }]}>Target Amount</Text>
                <View style={styles.amountContainer}>
                  <TextInput
                    style={[
                      styles.amountInput,
                      { borderColor: activeBorderColor, color: textColor, backgroundColor: theme.background },
                    ]}
                    value={`$ ${parseFloat(targetAmount || '0').toLocaleString()}`}
                    onChangeText={(text) => {
                      const num = text.replace(/[^0-9]/g, '');
                      setTargetAmount(num || '0');
                    }}
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                  />
                  <View style={styles.amountControls}>
                    <TouchableOpacity
                      style={[styles.amountButton, { backgroundColor: theme.border }]}
                      onPress={() => handleIncrement('target')}>
                      <IconSymbol name="chevron.up" size={16} color={textColor} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.amountButton, { backgroundColor: theme.border }]}
                      onPress={() => handleDecrement('target')}>
                      <IconSymbol name="chevron.down" size={16} color={textColor} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Already Saved */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: c.ink2 }]}>Already Saved (optional)</Text>
                <View style={styles.amountContainer}>
                  <TextInput
                    style={[
                      styles.amountInput,
                      { borderColor: activeBorderColor, color: textColor, backgroundColor: theme.background },
                    ]}
                    value={`$ ${parseFloat(alreadySaved || '0').toLocaleString()}`}
                    onChangeText={(text) => {
                      const num = text.replace(/[^0-9]/g, '');
                      setAlreadySaved(num || '0');
                    }}
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                  />
                  <View style={styles.amountControls}>
                    <TouchableOpacity
                      style={[styles.amountButton, { backgroundColor: theme.border }]}
                      onPress={() => handleIncrement('saved')}>
                      <IconSymbol name="chevron.up" size={16} color={textColor} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.amountButton, { backgroundColor: theme.border }]}
                      onPress={() => handleDecrement('saved')}>
                      <IconSymbol name="chevron.down" size={16} color={textColor} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Target Date */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: c.ink2 }]}>Target Date</Text>
                <DatePicker
                  value={targetDate}
                  onChange={setTargetDate}
                  placeholder="mm / dd / yyyy"
                  borderColor={activeBorderColor}
                />
              </View>

              {/* Color Selection */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: c.ink2 }]}>Color</Text>
                <View style={styles.colorGrid}>
                  {GOAL_COLORS.map((color, index) => (
                    <TouchableOpacity
                      key={`${color}-${index}`}
                      style={[
                        styles.colorSwatch,
                        { backgroundColor: color },
                        selectedColor === color && [styles.colorSwatchSelected, { borderColor: theme.primary }],
                      ]}
                      onPress={() => setSelectedColor(color)}>
                      {selectedColor === color && (
                        <IconSymbol name="checkmark" size={16} color="#fff" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              </ScrollView>

              {/* Action Buttons */}
              <View style={[styles.modalButtons, { borderTopColor: theme.border }]}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton, { backgroundColor: theme.border }]}
                  onPress={handleCancel}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.createButton, { backgroundColor: theme.primary }]}
                  onPress={handleCreateGoal}>
                  <Text style={styles.createButtonText}>Create Goal</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </ScreenScroll>
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
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '70%',
    flexDirection: 'column',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 20,
    paddingBottom: 10,
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
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  amountInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  amountControls: {
    flexDirection: 'column',
    gap: 4,
  },
  amountButton: {
    width: 32,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorSwatch: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSwatchSelected: {
    borderWidth: 3,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {},
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  createButton: {},
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
