import { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Modal, Platform } from 'react-native';
import { ThemedText } from './themed-text';
import { IconSymbol } from './ui/icon-symbol';
import { format } from 'date-fns';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface DatePickerProps {
  value?: string;
  onChange: (date: string) => void;
  placeholder?: string;
  borderColor?: string;
}

export function DatePicker({ value, onChange, placeholder = 'mm / dd / yyyy', borderColor }: DatePickerProps) {
  const colorScheme = useColorScheme();
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(value ? new Date(value) : new Date());

  const textColor = Colors[colorScheme ?? 'light'].text;
  const defaultBorderColor = colorScheme === 'dark' ? '#333' : '#E0E0E0';
  const finalBorderColor = borderColor || defaultBorderColor;

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    onChange(format(date, 'yyyy-MM-dd'));
    setShowPicker(false);
  };

  const displayValue = value ? format(new Date(value), 'MM / dd / yyyy') : placeholder;

  return (
    <>
      <TouchableOpacity
        style={[styles.input, { borderColor: finalBorderColor }]}
        onPress={() => setShowPicker(true)}>
        <ThemedText style={[styles.inputText, { color: value ? textColor : '#999' }]}>
          {displayValue}
        </ThemedText>
        <IconSymbol name="calendar" size={20} color="#999" />
      </TouchableOpacity>

      <Modal visible={showPicker} transparent animationType="slide" onRequestClose={() => setShowPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle">Select Date</ThemedText>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <IconSymbol name="xmark.circle.fill" size={24} color="#999" />
              </TouchableOpacity>
            </View>

            <View style={styles.calendarContainer}>
              {/* Simple month/year selector */}
              <View style={styles.monthYearSelector}>
                <TouchableOpacity
                  onPress={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setMonth(newDate.getMonth() - 1);
                    setSelectedDate(newDate);
                  }}>
                  <IconSymbol name="chevron.left" size={24} color={textColor} />
                </TouchableOpacity>
                <ThemedText style={styles.monthYearText}>
                  {format(selectedDate, 'MMMM yyyy')}
                </ThemedText>
                <TouchableOpacity
                  onPress={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setMonth(newDate.getMonth() + 1);
                    setSelectedDate(newDate);
                  }}>
                  <IconSymbol name="chevron.right" size={24} color={textColor} />
                </TouchableOpacity>
              </View>

              {/* Calendar grid */}
              <View style={styles.calendarGrid}>
                {/* Day headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <View key={day} style={styles.dayHeader}>
                    <ThemedText style={styles.dayHeaderText}>{day}</ThemedText>
                  </View>
                ))}

                {/* Calendar days */}
                {(() => {
                  const year = selectedDate.getFullYear();
                  const month = selectedDate.getMonth();
                  const firstDay = new Date(year, month, 1);
                  const lastDay = new Date(year, month + 1, 0);
                  const startDate = new Date(firstDay);
                  startDate.setDate(startDate.getDate() - startDate.getDay());

                  const days = [];
                  const currentDate = new Date(startDate);

                  for (let i = 0; i < 42; i++) {
                    const isCurrentMonth = currentDate.getMonth() === month;
                    const isSelected =
                      value &&
                      format(currentDate, 'yyyy-MM-dd') === format(new Date(value), 'yyyy-MM-dd');
                    const isToday =
                      format(currentDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

                    days.push(
                      <TouchableOpacity
                        key={i}
                        style={[
                          styles.dayCell,
                          isCurrentMonth && styles.dayCellCurrentMonth,
                          isSelected && styles.dayCellSelected,
                          isToday && styles.dayCellToday,
                        ]}
                        onPress={() => handleDateChange(new Date(currentDate))}>
                        <ThemedText
                          style={[
                            styles.dayText,
                            !isCurrentMonth && styles.dayTextOtherMonth,
                            isSelected && styles.dayTextSelected,
                            isToday && !isSelected && styles.dayTextToday,
                          ]}>
                          {currentDate.getDate()}
                        </ThemedText>
                      </TouchableOpacity>
                    );

                    currentDate.setDate(currentDate.getDate() + 1);
                  }

                  return days;
                })()}
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowPicker(false)}>
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => handleDateChange(selectedDate)}>
                <ThemedText style={styles.confirmButtonText}>Confirm</ThemedText>
              </TouchableOpacity>
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
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
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
    backgroundColor: '#1E1E1E',
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
  calendarContainer: {
    marginBottom: 20,
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
  },
  dayHeader: {
    width: '14.28%',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.7,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginVertical: 2,
  },
  dayCellCurrentMonth: {
    // Default styling
  },
  dayCellSelected: {
    backgroundColor: '#0a7ea4',
  },
  dayCellToday: {
    borderWidth: 1,
    borderColor: '#0a7ea4',
  },
  dayText: {
    fontSize: 14,
  },
  dayTextOtherMonth: {
    opacity: 0.3,
  },
  dayTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  dayTextToday: {
    color: '#0a7ea4',
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#333',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  confirmButton: {
    backgroundColor: '#0a7ea4',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

