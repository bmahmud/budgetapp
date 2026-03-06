import { View, StyleSheet } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
import { ThemedText } from './themed-text';

interface DonutChartData {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutChartData[];
  total: number;
  size?: number;
  innerRadius?: number;
}

export function DonutChart({ data, total, size = 300, innerRadius = 80 }: DonutChartProps) {
  const outerRadius = size / 2;
  const centerX = size / 2;
  const centerY = size / 2;
  
  // Calculate angles for each segment
  let currentAngle = -90; // Start at top
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  
  if (totalValue === 0) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <View style={styles.centerText}>
          <ThemedText 
            style={styles.totalText}
            adjustsFontSizeToFit
            numberOfLines={1}
            minimumFontScale={0.5}>
            ${Math.round(total).toLocaleString()}
          </ThemedText>
        </View>
      </View>
    );
  }

  const paths = data.map((item, index) => {
    const percentage = item.value / totalValue;
    const angle = percentage * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    
    // Calculate path for the segment
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    
    const x1 = centerX + outerRadius * Math.cos(startAngleRad);
    const y1 = centerY + outerRadius * Math.sin(startAngleRad);
    const x2 = centerX + outerRadius * Math.cos(endAngleRad);
    const y2 = centerY + outerRadius * Math.sin(endAngleRad);
    
    const x1Inner = centerX + innerRadius * Math.cos(startAngleRad);
    const y1Inner = centerY + innerRadius * Math.sin(startAngleRad);
    const x2Inner = centerX + innerRadius * Math.cos(endAngleRad);
    const y2Inner = centerY + innerRadius * Math.sin(endAngleRad);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    const pathData = [
      `M ${x1} ${y1}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `L ${x2Inner} ${y2Inner}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1Inner} ${y1Inner}`,
      'Z',
    ].join(' ');
    
    currentAngle += angle;
    
    return (
      <Path
        key={index}
        d={pathData}
        fill={item.color}
        stroke="none"
      />
    );
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <G>
          {paths}
        </G>
      </Svg>
      <View style={styles.centerText}>
        <ThemedText 
          style={styles.totalText}
          adjustsFontSizeToFit
          numberOfLines={1}
          minimumFontScale={0.5}>
          ${Math.round(total).toLocaleString()}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

