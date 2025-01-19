import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

const FinalPhase = ({ players, navigation }) => {
    // Sort players by their current_place and take the top 3
    const sortedPlayers = [...players].sort((a, b) => a.current_place - b.current_place).slice(0, 3);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Game Results</Text>
            {sortedPlayers.map((player, index) => (
                <View key={player.user.id} style={styles.podium}>
                    <Text style={styles.position}>{index + 1}</Text>
                    <Text style={styles.username}>{player.user.username}</Text>
                    <Text style={styles.score}>Score: {player.current_score}</Text>
                </View>
            ))}
            <View style={styles.buttonContainer}>
                <Button title="Back to Lobby" onPress={() => navigation.navigate('Lobby')} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        top: -130,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    podium: {
        alignItems: 'center',
        marginBottom: 10,
    },
    position: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    username: {
        fontSize: 14,
    },
    score: {
        fontSize: 14,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 20,
        width: '100%',
        paddingHorizontal: 20,
    },
});

export default FinalPhase;
