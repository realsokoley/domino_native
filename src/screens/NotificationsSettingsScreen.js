import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NotificationsSettingsScreen = () => {
    const [isEnabled, setIsEnabled] = useState(false);

    useEffect(() => {
        const fetchNotificationPreference = async () => {
            const storedPreference = await AsyncStorage.getItem('push_notifications_enabled');
            if (storedPreference !== null) {
                setIsEnabled(storedPreference === 'true');
            }
        };
        fetchNotificationPreference();
    }, []);

    const toggleSwitch = async () => {
        try {
            await AsyncStorage.setItem('push_notifications_enabled', (!isEnabled).toString());
            setIsEnabled(previousState => !previousState);
            Alert.alert('Success', `Push notifications ${!isEnabled ? 'enabled' : 'disabled'}`);
        } catch (error) {
            console.error('Error updating notification preference:', error);
            Alert.alert('Error', 'Failed to update notification preference');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Push Notifications</Text>
            <View style={styles.switchContainer}>
                <Text style={styles.label}>{isEnabled ? 'Enabled' : 'Disabled'}</Text>
                <Switch
                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                    thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
                    onValueChange={toggleSwitch}
                    value={isEnabled}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    switchContainer: { flexDirection: 'row', alignItems: 'center' },
    label: { fontSize: 18, marginRight: 10 },
});

export default NotificationsSettingsScreen;
