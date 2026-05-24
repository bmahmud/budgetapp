import { AppHeader } from '@/components/fringe/app-header';
import { Card } from '@/components/fringe/card';
import { Donut } from '@/components/fringe/donut';
import { FringeIcon } from '@/components/fringe/icon';
import { ScreenScroll } from '@/components/fringe/screen-scroll';
import { SectionHeader } from '@/components/fringe/section-header';
import { Segmented } from '@/components/fringe/segmented';
import { Sparkline } from '@/components/fringe/sparkline';
import { FringeTransactionRow } from '@/components/fringe/transaction-row';
import { useAuth } from '@/contexts/auth-context';
import { computeLast30DaySpend, filterTransactionsByPeriod, type HomePeriod } from '@/lib/home-rollup';
import { getProfilePreferences } from '@/lib/profile-preferences';
import { resolveProfileAvatarUrl } from '@/lib/profile-avatar-storage';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/theme/ThemeContext';
import { useBudgetStore } from '@/store/budget-store';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Text, useWindowDimensions, View } from 'react-native';

export function HomePulseScreen() {
  const router = useRouter();
  const { c } = useTheme();
  const { session } = useAuth();
  const { width } = useWindowDimensions();
  const [period, setPeriod] = useState<HomePeriod>('month');
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

  const periodTx = useMemo(
    () => filterTransactionsByPeriod(transactions, period),
    [transactions, period],
  );

  const income = periodTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = periodTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = income - expenses;
  const savingsPct = income > 0 ? ((income - expenses) / income) * 100 : 0;
  const last30Days = useMemo(() => computeLast30DaySpend(transactions), [transactions]);

  const segments = useMemo(() => {
    const summaries = getCategorySummaries(period, 'expense');
    return summaries.slice(0, 6).map((s) => {
      const cat = categories.find((c) => c.id === s.categoryId);
      return {
        color: cat?.color ?? c.accent,
        value: s.totalAmount,
        label: s.categoryName,
        cat: s.categoryId,
      };
    });
  }, [getCategorySummaries, period, categories, c.accent]);

  const recent = useMemo(
    () => [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4),
    [transactions],
  );

  const userName =
    (session?.user?.user_metadata?.full_name as string | undefined) ??
    session?.user?.email?.split('@')[0] ??
    'there';

  const getCategory = (id: string) => categories.find((cat) => cat.id === id);

  return (
    <ScreenScroll>
      <AppHeader
        name={userName}
        avatarUri={avatarUri}
        initials={initials}
        onProfile={() => router.push('/(tabs)/settings')}
      />

      <Card pad={22} radius="xl" tone={c.ink1} style={{ marginBottom: 14, borderColor: c.ink1 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
          }}>
          <Text
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: 'rgba(255,255,255,0.55)',
              letterSpacing: 0.4,
            }}>
            CASH FLOW · {period === 'month' ? 'THIS MONTH' : 'THIS YEAR'}
          </Text>
          <Segmented
            options={[
              { value: 'month', label: 'Mo' },
              { value: 'year', label: 'Yr' },
            ]}
            value={period}
            onChange={setPeriod}
            size="sm"
          />
        </View>
        <Text
          style={{
            fontSize: 46,
            fontWeight: '700',
            letterSpacing: -1.5,
            color: '#fff',
            fontVariant: ['tabular-nums'],
          }}>
          {balance >= 0 ? '+' : ''}$
          {Math.abs(balance).toLocaleString('en-US', { maximumFractionDigits: 0 })}
        </Text>
        <View style={{ flexDirection: 'row', gap: 14, marginTop: 4 }}>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
            <Text style={{ color: c.positive, fontWeight: '700' }}>↑</Text> $
            {income.toLocaleString('en-US', { maximumFractionDigits: 0 })} in
          </Text>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
            <Text style={{ color: c.negative, fontWeight: '700' }}>↓</Text> $
            {expenses.toLocaleString('en-US', { maximumFractionDigits: 0 })} out
          </Text>
        </View>
        <View style={{ marginTop: 14, height: 56 }}>
          <Sparkline
            data={last30Days}
            width={Math.min(width - 84, 340)}
            height={56}
            color="#7CDDB5"
            fill
            strokeW={2}
          />
        </View>
      </Card>

      <Card pad={20} radius="lg" style={{ marginBottom: 18 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 14,
          }}>
          <View>
            <Text style={{ fontSize: 16, fontWeight: '700', color: c.ink1 }}>Where it went</Text>
            <Text style={{ fontSize: 12, color: c.ink3, marginTop: 2 }}>
              Spending breakdown · {period === 'month' ? 'Month' : 'Year'}
            </Text>
          </View>
          <Text
            onPress={() => router.push('/(tabs)/reports')}
            style={{ fontSize: 12, fontWeight: '600', color: c.accent }}>
            Details ›
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
          <Donut
            segments={segments}
            size={140}
            thickness={22}
            center={
              <>
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: '700',
                    color: c.ink1,
                    letterSpacing: -0.5,
                    fontVariant: ['tabular-nums'],
                  }}>
                  ${expenses >= 1000 ? (expenses / 1000).toFixed(1) + 'k' : expenses.toFixed(0)}
                </Text>
                <Text style={{ fontSize: 10, color: c.ink3, fontWeight: '600' }}>TOTAL SPENT</Text>
              </>
            }
          />
          <View style={{ flex: 1, gap: 6 }}>
            {segments.slice(0, 4).map((s) => (
              <View key={s.cat} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: s.color }} />
                <Text numberOfLines={1} style={{ flex: 1, fontSize: 12, color: c.ink2 }}>
                  {s.label}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: c.ink1,
                    fontWeight: '600',
                    fontVariant: ['tabular-nums'],
                  }}>
                  ${s.value.toFixed(0)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </Card>

      <Card pad={16} radius="lg" tone={c.accent} style={{ marginBottom: 18, borderColor: c.accent }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: 'rgba(255,255,255,0.18)',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <FringeIcon name="sparkle" size={18} color="#fff" strokeWidth={2.2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 11,
                fontWeight: '600',
                color: 'rgba(255,255,255,0.7)',
                letterSpacing: 0.4,
              }}>
              INSIGHT
            </Text>
            <Text style={{ fontSize: 14, color: '#fff', marginTop: 4, lineHeight: 20 }}>
              You're saving <Text style={{ fontWeight: '700' }}>{savingsPct.toFixed(0)}%</Text> of income
              this {period === 'month' ? 'month' : 'year'}.
            </Text>
          </View>
        </View>
      </Card>

      <SectionHeader
        title="Recent activity"
        onAction={() => router.push('/(tabs)/transactions')}
      />
      <Card pad={0} radius="lg" style={{ paddingHorizontal: 16, paddingVertical: 4 }}>
        {recent.length === 0 ? (
          <Text style={{ padding: 16, color: c.ink3, textAlign: 'center' }}>No transactions yet</Text>
        ) : (
          recent.map((tx, i) => (
            <View
              key={tx.id}
              style={{
                borderBottomWidth: i < recent.length - 1 ? 1 : 0,
                borderBottomColor: c.line,
              }}>
              <FringeTransactionRow
                transaction={tx}
                category={getCategory(tx.categoryId)}
                onPress={() => router.push(`/transactions/${tx.id}`)}
              />
            </View>
          ))
        )}
      </Card>
    </ScreenScroll>
  );
}
