import { DatePicker } from '@/components/date-picker';
import { GoalCard } from '@/components/goal-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, FringePalette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useBudgetStore } from '@/store/budget-store';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Dimensions, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const GOAL_COLORS = [
  FringePalette.teal,
  FringePalette.purple,
  FringePalette.purpleLight,
  FringePalette.income,
  '#F59E0B',
  FringePalette.expense,
  '#3B82F6',
];

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 32 - 12) / 2; // Screen width minus padding and gap, divided by 2

export default function GoalsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
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

    addGoal({
      name: name.trim(),
      targetAmount: amount,
      currentAmount: saved,
      deadline: targetDate || undefined,
      color: selectedColor,
    });
    
    // Reset form
    setName('');
    setTargetAmount('10000');
    setAlreadySaved('0');
    setTargetDate('');
    setSelectedColor(GOAL_COLORS[0]);
    setShowModal(false);
  };

  const handleCancel = () => {
    setName('');
    setTargetAmount('10000');
    setAlreadySaved('0');
    setTargetDate('');
    setSelectedColor(GOAL_COLORS[0]);
    setShowModal(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <ThemedText type="title">Financial Goals</ThemedText>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={() => setShowModal(true)}>
          <ThemedText style={styles.addButtonText}>Add Goal</ThemedText>
        </TouchableOpacity>
      </ThemedView>

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
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.listContent}>
          <View style={styles.goalsGrid}>
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onPress={() => router.push(`/goals/${goal.id}`)}
              />
            ))}
          </View>
        </ScrollView>
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
                  <ThemedText type="title" style={styles.modalTitle}>Create New Goal</ThemedText>
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
                <ThemedText style={styles.label}>Goal Name</ThemedText>
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
                <ThemedText style={styles.label}>Target Amount</ThemedText>
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
                <ThemedText style={styles.label}>Already Saved (optional)</ThemedText>
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
                <ThemedText style={styles.label}>Target Date</ThemedText>
                <DatePicker
                  value={targetDate}
                  onChange={setTargetDate}
                  placeholder="mm / dd / yyyy"
                  borderColor={activeBorderColor}
                />
              </View>

              {/* Color Selection */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Color</ThemedText>
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
                  <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.createButton, { backgroundColor: theme.primary }]}
                  onPress={handleCreateGoal}>
                  <ThemedText style={styles.createButtonText}>Create Goal</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
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
