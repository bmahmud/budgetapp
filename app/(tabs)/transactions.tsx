import { Card } from '@/components/fringe/card';
import { EmptyState } from '@/components/fringe/empty-state';
import { FringeIcon } from '@/components/fringe/icon';
import { IconButton } from '@/components/fringe/icon-button';
import { ScreenScroll } from '@/components/fringe/screen-scroll';
import { Segmented } from '@/components/fringe/segmented';
import { FringeTransactionRow } from '@/components/fringe/transaction-row';
import { relativeDay } from '@/lib/date-helpers';
import { useTheme } from '@/theme/ThemeContext';
import { useBudgetStore } from '@/store/budget-store';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Text, TextInput, View } from 'react-native';

type Filter = 'all' | 'income' | 'expense';

export default function TransactionsScreen() {
  const router = useRouter();
  const { c } = useTheme();
  const { transactions, categories, isLoading, isInitialized, initialize } = useBudgetStore();
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isInitialized) initialize();
  }, [isInitialized, initialize]);

  const filtered = useMemo(() => {
    let rows = [...transactions].sort((a, b) => b.date.localeCompare(a.date));
    if (filter === 'income') rows = rows.filter((t) => t.type === 'income');
    if (filter === 'expense') rows = rows.filter((t) => t.type === 'expense');
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((t) => {
        const cat = categories.find((c) => c.id === t.categoryId);
        const label = (t.notes || cat?.name || '').toLowerCase();
        return label.includes(q) || cat?.name.toLowerCase().includes(q);
      });
    }
    return rows;
  }, [transactions, filter, search, categories]);

  const groups = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    filtered.forEach((t) => {
      const key = relativeDay(t.date);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    });
    return [...map.entries()];
  }, [filtered]);

  const totalIn = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalOut = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const getCategory = (id: string) => categories.find((cat) => cat.id === id);

  return (
    <ScreenScroll>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          paddingBottom: 16,
        }}>
        <View>
          <Text style={{ fontSize: 12, color: c.ink3, fontWeight: '600', letterSpacing: 0.4 }}>ACTIVITY</Text>
          <Text style={{ fontSize: 26, fontWeight: '700', color: c.ink1, letterSpacing: -0.6 }}>All transactions</Text>
        </View>
        <IconButton icon="filter" size={40} tone="elev" />
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          backgroundColor: c.bgElev,
          borderWidth: 1,
          borderColor: c.line,
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 10,
          marginBottom: 12,
        }}>
        <FringeIcon name="search" size={16} color={c.ink3} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search transactions"
          placeholderTextColor={c.ink3}
          style={{ flex: 1, fontSize: 14, color: c.ink1 }}
        />
      </View>

      <View style={{ marginBottom: 14 }}>
        <Segmented
          options={[
            { value: 'all', label: 'All' },
            { value: 'income', label: 'Income' },
            { value: 'expense', label: 'Expense' },
          ]}
          value={filter}
          onChange={setFilter}
          size="sm"
          fullWidth
        />
      </View>

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
        <Card pad={12} radius="md" style={{ flex: 1 }}>
          <Text style={{ fontSize: 11, color: c.ink3, fontWeight: '600', letterSpacing: 0.4 }}>IN</Text>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: c.positive,
              marginTop: 2,
              fontVariant: ['tabular-nums'],
            }}>
            +${Math.round(totalIn).toLocaleString()}
          </Text>
        </Card>
        <Card pad={12} radius="md" style={{ flex: 1 }}>
          <Text style={{ fontSize: 11, color: c.ink3, fontWeight: '600', letterSpacing: 0.4 }}>OUT</Text>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: c.ink1,
              marginTop: 2,
              fontVariant: ['tabular-nums'],
            }}>
            −${Math.round(totalOut).toLocaleString()}
          </Text>
        </Card>
      </View>

      {isLoading ? (
        <Text style={{ marginTop: 24, color: c.ink3, textAlign: 'center' }}>Loading...</Text>
      ) : groups.length === 0 ? (
        <EmptyState icon="search" title="No transactions" body="Try a different search or filter." />
      ) : (
        groups.map(([day, list]) => {
          const dayTotal = list.reduce((s, t) => s + (t.type === 'income' ? t.amount : -t.amount), 0);
          return (
            <View key={day} style={{ marginBottom: 14 }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  paddingHorizontal: 4,
                  paddingBottom: 8,
                }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: c.ink3, letterSpacing: 0.4 }}>
                  {day.toUpperCase()}
                </Text>
                <Text style={{ fontSize: 12, color: c.ink3, fontVariant: ['tabular-nums'] }}>
                  {dayTotal >= 0 ? '+' : '−'}${Math.abs(dayTotal).toFixed(0)}
                </Text>
              </View>
              <Card pad={0} radius="lg" style={{ paddingHorizontal: 16, paddingVertical: 4 }}>
                {list.map((item, i) => (
                  <View
                    key={item.id}
                    style={{
                      borderBottomWidth: i < list.length - 1 ? 1 : 0,
                      borderBottomColor: c.line,
                    }}>
                    <FringeTransactionRow
                      transaction={item}
                      category={getCategory(item.categoryId)}
                      onPress={() => router.push(`/transactions/${item.id}`)}
                      compact
                    />
                  </View>
                ))}
              </Card>
            </View>
          );
        })
      )}
    </ScreenScroll>
  );
}
