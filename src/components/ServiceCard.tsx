import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ServiceModel } from '../database/types';
import { Colors, Spacing, Typography, Styles } from '../utils/theme';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  data: ServiceModel;
}

export const ServiceCard = ({ data }: Props) => {
  const isPending = data.isCompleted === 0;
  
  return (
    <View style={[styles.card, Styles.cardShadow, { 
      borderLeftColor: isPending ? Colors.secondary : Colors.success 
    }]}>
      <Ionicons 
        name={isPending ? "alert-circle-outline" : "checkmark-circle-outline"} 
        size={24} 
        color={isPending ? Colors.secondary : Colors.success} 
        style={styles.icon}
      />
      <View style={styles.content}>
        <Text style={styles.description}>{data.description}</Text>
        <Text style={styles.location}>{data.location}</Text>
      </View>
      <Text style={styles.value}>
        {data.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBackground,
    padding: Spacing.md,
    borderRadius: 10,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 5,
  },
  icon: {
    marginRight: Spacing.sm,
  },
  content: {
    flex: 1,
  },
  description: {
    fontSize: Typography.fontSize.medium,
    fontWeight: '600',
    color: Colors.text,
  },
  location: {
    fontSize: Typography.fontSize.small,
    color: Colors.lightText,
  },
  value: {
    fontSize: Typography.fontSize.medium,
    fontWeight: 'bold',
    color: Colors.text,
  },
});