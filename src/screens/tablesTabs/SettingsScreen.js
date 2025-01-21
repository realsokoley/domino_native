import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from 'react-native-elements';

const SettingsScreen = () => {
    const navigation = useNavigation();

    return (
        <ScrollView style={styles.container}>
            <View style={styles.box}>
                <Text style={styles.header}>Account Settings</Text>
                <View style={styles.buttonContainer}>
                    <Button
                        title="Adjust Account"
                        onPress={() => navigation.navigate('AccountSettings')}
                        buttonStyle={styles.button}
                        titleStyle={styles.buttonTitle}
                    />
                </View>
            </View>
            <View style={styles.box}>
                <Text style={styles.header}>Notifications Settings</Text>
                <View style={styles.buttonContainer}>
                    <Button
                        title="Adjust Notifications"
                        onPress={() => navigation.navigate('NotificationsSettings')}
                        buttonStyle={styles.button}
                        titleStyle={styles.buttonTitle}
                    />
                </View>
            </View>
            <View style={styles.box}>
                <Text style={styles.header}>Feedback</Text>
                <View style={styles.buttonContainer}>
                    <Button
                        title="Send Message"
                        onPress={() => navigation.navigate('Feedback')}
                        buttonStyle={styles.button}
                        titleStyle={styles.buttonTitle}
                    />
                </View>
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
    buttonContainer: {
        alignItems: 'flex-start',
        marginTop: 10,
    },
    button: {
        padding: 5,
    },
    buttonTitle: {
        fontSize: 12,
    },
});

export default SettingsScreen;
