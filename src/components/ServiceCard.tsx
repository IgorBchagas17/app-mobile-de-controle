import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  data: {
    description: string;
    value: number;
    date: string;
    location: string;
  };
}

export function ServiceCard({ data }: Props) {
  // Formatar dinheiro para R$
  const formattedValue = data.value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

  // Formatar data (converter 2023-10-25 para 25/10/2023)
  const formattedDate = data.date.split('-').reverse().join('/');

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.description}>{data.description}</Text>
        <Text style={styles.value}>{formattedValue}</Text>
      </View>
      
      <View style={styles.footer}>
        <View style={styles.row}>
          <Ionicons name="calendar-outline" size={14} color="#666" />
          <Text style={styles.info}>{formattedDate}</Text>
        </View>
        
        {data.location ? (
          <View style={styles.row}>
            <Ionicons name="location-outline" size={14} color="#666" />
            <Text style={styles.info}>{data.location}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    // Sombra suave
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1, // Ocupa o espaço disponível para não empurrar o preço
    marginRight: 10,
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27AE60', // Verde dinheiro
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    color: '#666',
    fontSize: 12,
    marginLeft: 4,
  }
});