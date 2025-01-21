import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';

const SettingsScreen = () => {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.box}>
                <Text style={styles.header}>Account Settings</Text>
                <Text style={styles.content}>[Account settings content]</Text>
            </View>
            <View style={styles.box}>
                <Text style={styles.header}>Notification Settings</Text>
                <Text style={styles.content}>[Notification settings content]</Text>
            </View>
            <View style={styles.box}>
                <Text style={styles.header}>Privacy Settings</Text>
                <Text style={styles.content}>[Privacy settings content]</Text>
            </View>
            <View style={styles.box}>
                <Text style={styles.header}>Other Settings</Text>
                <Text style={styles.content}>[Other settings content]</Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    box: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        backgroundColor: '#f9f9f9',
    },
    header: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    content: { fontSize: 16 },
});

export default SettingsScreen;
