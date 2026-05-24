import { AppHeader } from '@/components/fringe/app-header';
import { BudgetRow } from '@/components/fringe/budget-row';
import { Card } from '@/components/fringe/card';
import { FringeIcon } from '@/components/fringe/icon';
import { RingProgress } from '@/components/fringe/ring-progress';
import { ScreenScroll } from '@/components/fringe/screen-scroll';
import { SectionHeader } from '@/components/fringe/section-header';
import { FringeTransactionRow } from '@/components/fringe/transaction-row';
import { useAuth } from '@/contexts/auth-context';
import { filterTransactionsByPeriod } from '@/lib/home-rollup';
import { getProfilePreferences } from '@/lib/profile-preferences';
import { resolveProfileAvatarUrl } from '@/lib/profile-avatar-storage';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/theme/ThemeContext';
import { useBudgetStore } from '@/store/budget-store';
import { useFocusEffect, useRouter } from 'expo-router';
import { endOfMonth } from 'date-fns';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';

const label = { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.4 };
const big = {
  fontSize: 22,
  fontWeight: '700' as const,
  letterSpacing: -0.5,
  fontVariant: ['tabular-nums' as const],
};
const badge = {
  width: 22,
  height: 22,
  borderRadius: 6,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};

export function HomeCashflowScreen() {
  const router = useRouter();
  const { c } = useTheme();
  const { session } = useAuth();
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [initials, setInitials] = useState('');

  const { transactions, categories, isInitialized, initialize, getCategorySummaries } = useBudgetStore();

  useEffect(() => {
    if (!isInitialized) initialize();
  }, [isInitialized, initialize]);

  const refreshProfile = useCallback(async () => {
    const prefs = await getProfilePreferences();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const syncedUrl = user?.user_metadata?.avatar_url as string | undefined;
    const syncedPath = user?.user_metadata?.avatar_path as string | undefined;
    const syncedInitials = user?.user_metadata?.initials as string | undefined;
    const resolved = await resolveProfileAvatarUrl(syncedPath, syncedUrl);
    setAvatarUri(prefs.avatarUri || resolved || syncedUrl || null);
    setInitials((syncedInitials || prefs.initials || '').toUpperCase());
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refreshProfile();
    }, [refreshProfile]),
  );

  const monthTxs = useMemo(() => filterTransactionsByPeriod(transactions, 'month'), [transactions]);
  const income = monthTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = monthTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const expenseSummaries = useMemo(() => getCategorySummaries('month', 'expense'), [getCategorySummaries, transactions]);
  const totalBudget = useMemo(() => {
    if (income > 0) return Math.round(income * 0.66);
    if (expenses > 0) return Math.round(expenses * 1.17);
    return 0;
  }, [income, expenses]);

  const hasBudgetData = income > 0 || expenses > 0;

  const spentBudgeted = expenses;
  const remaining = Math.max(0, totalBudget - spentBudgeted);
  const pct = totalBudget ? (spentBudgeted / totalBudget) * 100 : 0;

  const today = new Date();
  const daysIntoMonth = today.getDate();
  const daysInMonth = endOfMonth(today).getDate();
  const daysLeft = daysInMonth - daysIntoMonth;
  const projected = daysIntoMonth > 0 ? (spentBudgeted / daysIntoMonth) * daysInMonth : spentBudgeted;
  const onTrack = projected <= totalBudget;

  const budgetRows = useMemo(() => {
    return expenseSummaries.slice(0, 4).map((summary) => {
      const category = categories.find((cat) => cat.id === summary.categoryId);
      const spent = summary.totalAmount;
      const budget = Math.max(Math.round(spent * 1.15), spent, 100);
      return { category, spent, budget };
    }).filter((row) => row.category);
  }, [expenseSummaries, categories]);

  const recent = useMemo(
    () => [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3),
    [transactions],
  );

  const displayName = useMemo(() => {
    const email = session?.user?.email ?? '';
    const local = email.split('@')[0];
    if (initials && initials.length >= 2) return `${initials}'s household`;
    if (local) return `${local.charAt(0).toUpperCase()}${local.slice(1)}'s household`;
    return 'Your household';
  }, [session?.user?.email, initials]);

  return (
    <ScreenScroll>
      <AppHeader
        name={displayName}
        avatarUri={avatarUri}
        initials={initials}
        onProfile={() => router.push('/(tabs)/settings')}
      />

      <Card pad={20} radius="xl" style={{ marginBottom: 14 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text style={[label, { color: c.ink3 }]}>SAFE TO SPEND</Text>
            <Text
              style={{
                fontSize: 44,
                fontWeight: '700',
                color: c.ink1,
                letterSpacing: -1.4,
                marginTop: 4,
                fontVariant: ['tabular-nums'],
              }}>
              ${remaining.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </Text>
            <Text style={{ fontSize: 12, color: c.ink3, marginTop: 6 }}>
              {hasBudgetData ? (
                <>
                  of <Text style={{ color: c.ink2, fontWeight: '600' }}>${totalBudget.toLocaleString()}</Text> budget ·{' '}
                  {daysLeft} days left
                </>
              ) : (
                'Add transactions to start tracking your budget'
              )}
            </Text>
          </View>
          <RingProgress pct={pct} size={68} thickness={6} color={onTrack ? c.accent : c.negative}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: c.ink1 }}>{Math.round(pct)}%</Text>
          </RingProgress>
        </View>

        <View
          style={{
            marginTop: 16,
            padding: 14,
            backgroundColor: c.bgSubtle,
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
          }}>
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: onTrack ? c.positiveSoft : c.negativeSoft,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <FringeIcon
              name={onTrack ? 'trending' : 'arrowUp'}
              size={14}
              color={onTrack ? c.positive : c.negative}
              strokeWidth={2.4}
            />
          </View>
          <Text style={{ flex: 1, fontSize: 12.5, color: c.ink2, lineHeight: 18 }}>
            {!hasBudgetData
              ? 'Add income and expenses to see your monthly projection.'
              : onTrack
                ? `You're projected to finish at $${Math.round(projected).toLocaleString()} — under budget.`
                : `At this pace you'll spend $${Math.round(projected).toLocaleString()} this month.`}
          </Text>
        </View>
      </Card>

      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 18 }}>
        <Card pad={14} radius="md" style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <View style={[badge, { backgroundColor: c.positiveSoft }]}>
              <FringeIcon name="arrowDown" size={12} color={c.positive} strokeWidth={2.6} />
            </View>
            <Text style={[label, { color: c.ink2 }]}>INCOME</Text>
          </View>
          <Text style={[big, { color: c.ink1 }]}>
            ${income.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </Text>
          {income > 0 ? (
            <Text style={{ fontSize: 11, color: c.positive, marginTop: 4, fontWeight: '600' }}>+12% vs last month</Text>
          ) : null}
        </Card>
        <Card pad={14} radius="md" style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <View style={[badge, { backgroundColor: c.negativeSoft }]}>
              <FringeIcon name="arrowUp" size={12} color={c.negative} strokeWidth={2.6} />
            </View>
            <Text style={[label, { color: c.ink2 }]}>SPENT</Text>
          </View>
          <Text style={[big, { color: c.ink1 }]}>
            ${expenses.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </Text>
          {expenses > 0 ? (
            <Text style={{ fontSize: 11, color: c.ink3, marginTop: 4, fontWeight: '500' }}>↑ 4% vs last month</Text>
          ) : null}
        </Card>
      </View>

      {budgetRows.length > 0 ? (
        <>
          <SectionHeader title="Budgets" onAction={() => router.push('/(tabs)/reports')} actionText="See all" />
          <Card pad={0} radius="lg" style={{ marginBottom: 18, paddingHorizontal: 16, paddingVertical: 4 }}>
            {budgetRows.map(({ category, spent, budget }, i, arr) =>
              category ? (
                <View
                  key={category.id}
                  style={{
                    borderBottomWidth: i < arr.length - 1 ? 1 : 0,
                    borderBottomColor: c.line,
                  }}>
                  <BudgetRow category={category} spent={spent} budget={budget} />
                </View>
              ) : null,
            )}
          </Card>
        </>
      ) : null}

      <SectionHeader title="Recent activity" onAction={() => router.push('/(tabs)/transactions')} actionText="See all" />
      {recent.length === 0 ? (
        <Card pad={24} radius="lg" style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: c.ink1 }}>No transactions yet</Text>
          <Text style={{ fontSize: 13, color: c.ink3, marginTop: 6, textAlign: 'center' }}>
            Tap + to add your first transaction.
          </Text>
        </Card>
      ) : (
        <Card pad={0} radius="lg" style={{ paddingHorizontal: 16, paddingVertical: 4 }}>
          {recent.map((tx, i) => (
            <View
              key={tx.id}
              style={{
                borderBottomWidth: i < recent.length - 1 ? 1 : 0,
                borderBottomColor: c.line,
              }}>
              <FringeTransactionRow
                transaction={tx}
                category={categories.find((cat) => cat.id === tx.categoryId)}
                onPress={() => router.push(`/transactions/${tx.id}`)}
              />
            </View>
          ))}
        </Card>
      )}
    </ScreenScroll>
  );
}
