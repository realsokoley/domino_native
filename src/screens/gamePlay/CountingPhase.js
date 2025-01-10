import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { gql, useQuery } from '@apollo/client';

const GET_GAME_USER_ROUND = gql`
  query GetGameUserRounds($gameRoundId: Int!) {
    game_user_round_by_round_id(game_round_id: $gameRoundId) {
      id
      bet
      winners
      points
      game_user {
        id
        user {
          id
          username
        }
      }
    }
  }
`;

const CountingPhase = ({ gameRoundId, players, getBonesStyle, onCountingComplete }) => {
    const { data, loading, error } = useQuery(GET_GAME_USER_ROUND, {
        variables: { gameRoundId },
        pollInterval: 2000,
    });

    useEffect(() => {
        if (data) {
            onCountingComplete();
        }
    }, [data, onCountingComplete]);

    if (loading) return <Text>Loading...</Text>;
    if (error) return <Text>Error: {error.message}</Text>;

    return (
        <View style={styles.container}>
            {players.map((player) => {
                const playerRound = data?.game_user_round_by_round_id.find(r => r.game_user.user.id == player.user.id);
                const bonesStyle = getBonesStyle(`position${player.position}`);
                return (
                    <View key={player.user.id} style={[styles.bonesContainer, bonesStyle]}>
                        {playerRound && (
                            <>
                                <Text style={styles.bonesText}>Bet: {playerRound.bet}</Text>
                                <Text style={styles.bonesText}>Winners: {playerRound.winners}</Text>
                                <Text style={styles.bonesText}>Points: {playerRound.points}</Text>
                            </>
                        )}
                    </View>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bonesContainer: {
        position: 'absolute',
        padding: 5,
    },
    bonesText: {
        fontWeight: 'bold',
    }
});

export default CountingPhase;
