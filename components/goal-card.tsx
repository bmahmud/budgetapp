import { StyleSheet, TouchableOpacity, View, Dimensions } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { IconSymbol } from './ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Goal } from '@/types';
import { isPast, parseISO, differenceInDays } from 'date-fns';

const GOAL_COLORS = ['#00BCD4', '#9C27B0', '#FFC107', '#2196F3', '#E91E63', '#4CAF50', '#FF9800'];
const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 32 - 12) / 2; // Screen width minus padding (16*2) and gap (12), divided by 2

interface GoalCardProps {
  goal: Goal;
  onPress?: () => void;
}

export function GoalCard({ goal, onPress }: GoalCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
  const isCompleted = goal.currentAmount >= goal.targetAmount;
  const goalColor = goal.color || GOAL_COLORS[0];
  
  // Calculate days left or if deadline passed
  let statusText = '';
  let statusColor = goalColor;
  if (goal.deadline) {
    const deadlineDate = parseISO(goal.deadline);
    if (isPast(deadlineDate) && !isCompleted) {
      statusText = 'Deadline passed';
      statusColor = '#E91E63'; // Red for overdue
    } else {
      const daysLeft = differenceInDays(deadlineDate, new Date());
      statusText = `${daysLeft} days left`;
    }
  }

  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.cardContainer}>
      <ThemedView style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        {/* Colored accent bar on the left */}
        <View style={[styles.accentBar, { backgroundColor: goalColor }]} />
        
        <View style={styles.cardContent}>
          {/* Header with icon and title */}
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: `${goalColor}20` }]}>
              <IconSymbol name="target" size={20} color={goalColor} />
            </View>
            <View style={styles.headerText}>
              <ThemedText type="defaultSemiBold" style={styles.title}>
                {goal.name}
              </ThemedText>
              {statusText && (
                <ThemedText style={[styles.status, { color: statusColor }]}>
                  {statusText}
                </ThemedText>
              )}
            </View>
          </View>

          {/* Amount and percentage */}
          <View style={styles.amountRow}>
            <ThemedText style={styles.amount}>
              ${Math.round(goal.currentAmount).toLocaleString()} / ${Math.round(goal.targetAmount).toLocaleString()}
            </ThemedText>
            <ThemedText style={[styles.percentage, { color: goalColor }]}>
              {Math.round(progress)}%
            </ThemedText>
          </View>

          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
              <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%`, backgroundColor: goalColor }]} />
            </View>
          </View>

          {/* Remaining amount */}
          <ThemedText style={styles.remaining}>
            ${Math.round(remaining).toLocaleString()} remaining to reach your goal
          </ThemedText>
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_WIDTH,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  cardContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  status: {
    fontSize: 12,
    fontWeight: '500',
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  amount: {
    fontSize: 14,
    fontWeight: '600',
  },
  percentage: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  remaining: {
    fontSize: 12,
    opacity: 0.7,
  },
});
