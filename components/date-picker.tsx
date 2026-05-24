import { formatDisplayDate, formatLocalIso, fmtMonthYear, parseLocalDate } from '@/lib/date-helpers';
import { useTheme } from '@/theme/ThemeContext';
import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { IconSymbol } from './ui/icon-symbol';

interface DatePickerProps {
  value?: string;
  onChange: (date: string) => void;
  placeholder?: string;
  borderColor?: string;
}

export function DatePicker({ value, onChange, placeholder = 'mm / dd / yyyy', borderColor }: DatePickerProps) {
  const { c } = useTheme();
  const [showPicker, setShowPicker] = useState(false);
  const [viewDate, setViewDate] = useState(() => (value ? parseLocalDate(value) : new Date()));

  useEffect(() => {
    if (value) setViewDate(parseLocalDate(value));
  }, [value]);

  const todayIso = formatLocalIso(new Date());

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(year, month, 1 - firstDay.getDay());

    return Array.from({ length: 42 }, (_, i) => {
      const dayDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
      const iso = formatLocalIso(dayDate);
      return {
        iso,
        day: dayDate.getDate(),
        isCurrentMonth: dayDate.getMonth() === month,
        isSelected: value === iso,
        isToday: todayIso === iso,
      };
    });
  }, [viewDate, value, todayIso]);

  function openPicker() {
    setViewDate(value ? parseLocalDate(value) : new Date());
    setShowPicker(true);
  }

  function handleSelect(iso: string) {
    onChange(iso);
    setShowPicker(false);
  }

  function shiftMonth(delta: number) {
    setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  }

  const displayValue = value ? formatDisplayDate(value) : placeholder;

  return (
    <>
      <Pressable
        style={[styles.input, { borderColor: borderColor ?? c.line, backgroundColor: c.bgElev }]}
        onPress={openPicker}>
        <Text style={[styles.inputText, { color: value ? c.ink1 : c.ink3 }]}>{displayValue}</Text>
        <IconSymbol name="calendar" size={20} color={c.ink3} />
      </Pressable>

      <Modal visible={showPicker} transparent animationType="slide" onRequestClose={() => setShowPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: c.bgElev }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: c.ink1 }]}>Select Date</Text>
              <Pressable onPress={() => setShowPicker(false)} hitSlop={12}>
                <IconSymbol name="xmark.circle.fill" size={24} color={c.ink3} />
              </Pressable>
            </View>

            <View style={styles.monthYearSelector}>
              <Pressable onPress={() => shiftMonth(-1)} hitSlop={12}>
                <IconSymbol name="chevron.left" size={24} color={c.ink1} />
              </Pressable>
              <Text style={[styles.monthYearText, { color: c.ink1 }]}>{fmtMonthYear(viewDate)}</Text>
              <Pressable onPress={() => shiftMonth(1)} hitSlop={12}>
                <IconSymbol name="chevron.right" size={24} color={c.ink1} />
              </Pressable>
            </View>

            <View style={styles.calendarGrid}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <View key={day} style={styles.dayHeader}>
                  <Text style={[styles.dayHeaderText, { color: c.ink2 }]}>{day}</Text>
                </View>
              ))}

              {calendarDays.map(({ iso, day, isCurrentMonth, isSelected, isToday }) => (
                <Pressable
                  key={iso}
                  style={[
                    styles.dayCell,
                    isSelected && { backgroundColor: c.accent },
                    isToday && !isSelected && { borderWidth: 1, borderColor: c.accent },
                  ]}
                  onPress={() => handleSelect(iso)}>
                  <Text
                    style={[
                      styles.dayText,
                      { color: isCurrentMonth ? c.ink1 : c.ink3 },
                      !isCurrentMonth && styles.dayTextOtherMonth,
                      isSelected && styles.dayTextSelected,
                      isToday && !isSelected && { color: c.accent, fontWeight: '600' },
                    ]}>
                    {day}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, { backgroundColor: c.bgSubtle }]}
                onPress={() => setShowPicker(false)}>
                <Text style={[styles.cancelButtonText, { color: c.ink2 }]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, { backgroundColor: c.accent }]}
                onPress={() => handleSelect(value ?? todayIso)}>
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  input: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  inputText: {
    fontSize: 16,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  monthYearSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  dayHeader: {
    width: '14.28%',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginVertical: 2,
  },
  dayText: {
    fontSize: 14,
  },
  dayTextOtherMonth: {
    opacity: 0.45,
  },
  dayTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
