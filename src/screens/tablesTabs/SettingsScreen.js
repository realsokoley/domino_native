import React from 'react';
import { ScrollView, View, Text, StyleSheet, Button, Alert } from 'react-native';

const SettingsScreen = () => {
    const handlePushSettings = () => {
        Alert.alert('Push Settings', 'Push settings clicked.');
    };

    const handleContactDevelopers = () => {
        Alert.alert('Contact Developers', 'Contact developers clicked.');
    };

    const handleRemoveAccount = () => {
        Alert.alert('Remove Account', 'Remove account clicked.');
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.section}>
                <Button title="Push Settings" onPress={handlePushSettings} />
            </View>
            <View style={styles.section}>
                <Button title="Contact the Developers" onPress={handleContactDevelopers} />
            </View>
            <View style={styles.section}>
                <Button title="Remove the Account" onPress={handleRemoveAccount} />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    section: { marginBottom: 20 },
});

export default SettingsScreen;
