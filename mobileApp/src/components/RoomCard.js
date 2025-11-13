import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function RoomCard({ room, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.name}>{room.name}</Text>
      <Text style={styles.info}>Thiết bị: {room.devices?.length || 0}</Text>
      <Text style={styles.info}>Node: {room.nodes?.length || 0}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff34',
    borderRadius: 12,
    padding: 18,
    marginVertical: 8,
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ffffffff',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#007bff',
  },
  info: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
});
