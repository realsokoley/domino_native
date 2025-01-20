import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const InformationScreen = () => {
    const navigation = useNavigation(); // Define the navigation variable

    return (
        <ScrollView style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.header}>Game Rules</Text>
                <Text style={styles.link} onPress={() => navigation.navigate('GameRules')}>View Game Rules</Text>
            </View>
            <View style={styles.section}>
                <Text style={styles.header}>About Application</Text>
                <Text style={styles.content}>[About application content]</Text>
            </View>
            <View style={styles.section}>
                <Text style={styles.header}>User Agreement</Text>
                <Text style={styles.content}>[User agreement content]</Text>
            </View>
            <View style={styles.section}>
                <Text style={styles.header}>Privacy Policy</Text>
                <Text style={styles.content}>[Privacy policy content]</Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    section: { marginBottom: 20 },
    header: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    content: { fontSize: 16 },
    link: { fontSize: 16, color: 'blue', textDecorationLine: 'underline' },
});

export default InformationScreen;
