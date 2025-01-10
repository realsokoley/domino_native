import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const data = [
    { id: '1', count: 5, room_created: '2024-12-01T16:00:00Z' },
    { id: '2', count: 3, room_created: '2024-12-03T10:00:00Z' },
];

const PublicTablesScreen = () => {
    return (
        <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <View style={styles.item}>
                    <Text>Room ID: {item.id}</Text>
                    <Text>Players: {item.count}</Text>
                    <Text>Created At: {item.room_created}</Text>
                </View>
            )}
        />
    );
};

const styles = StyleSheet.create({
    item: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
});

export default PublicTablesScreen;
