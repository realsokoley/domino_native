import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { gql, useMutation, useQuery } from '@apollo/client';

const GET_GAME_USER_ROUND = gql`
  query GetGameUserRounds($gameRoundId: Int!) {
    game_user_round_by_round_id(game_round_id: $gameRoundId) {
      id
      turn
      bet
      bones_start
      bones_left
      game_user {
        id
        user {
            id
        }
      }
    }
  }
`;

const PLACE_BET = gql`
  mutation PlaceBet($gameUserRoundId: Int!, $bet: Int!) {
    bet(game_user_round_id: $gameUserRoundId, bet: $bet) {
      id
      bet
    }
  }
`;

const BettingPhase = ({ gameRoundId, currentGameUserId, onBettingComplete, players, getBetStyle }) => {
    const [bet, setBet] = useState(0);
    const [isTurnToBet, setIsTurnToBet] = useState(false);
    const { data, loading, error } = useQuery(GET_GAME_USER_ROUND, {
        variables: { gameRoundId },
        pollInterval: 2000,
    });

    const [placeBet, { loading: placingBetLoading }] = useMutation(PLACE_BET);

    useEffect(() => {
        if (data) {
            const gameUserRounds = data.game_user_round_by_round_id;
            const currentUserRound = gameUserRounds.find(r => r.game_user.id == currentGameUserId);
            const canBet = gameUserRounds.some(r =>
                (r.turn == currentUserRound.turn - 1 && r.bet != null)) || currentUserRound.turn === 0;
            console.log('Can bet:', canBet);
            console.log(currentGameUserId);
            console.log('Current user round:', currentUserRound);
            console.log('Game user rounds:', gameUserRounds);
            setIsTurnToBet(canBet);
        }
    }, [data, currentGameUserId]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            checkAllBetsPlaced();
        }, 1000);

        return () => clearInterval(intervalId);
    }, [data]);

    const handleBetChange = (selectedBet) => {
        setBet(selectedBet);
    };

    const submitBet = () => {
        const gameUserRoundId = parseInt(data.game_user_round_by_round_id.find(r => r.game_user.id == currentGameUserId).id, 10);
        placeBet({ variables: { gameUserRoundId, bet } })
            .then(response => {
                console.log('Bet placed:', response.data.bet);
            })
            .catch(error => {
                console.error('Error placing bet:', error);
            });
    };

    const checkAllBetsPlaced = () => {
        const allBetsPlaced = data.game_user_round_by_round_id.every(r => r.bet != null);
        if (allBetsPlaced) {
            onBettingComplete();
        }
    };

    if (loading) return <Text>Loading...</Text>;
    if (error) return <Text>Error: {error.message}</Text>;

    const currentUserRound = data?.game_user_round_by_round_id.find(r => r.game_user.id == currentGameUserId);
    let numberOfOptions = 0;
    try {
        const bonesArray = JSON.parse(currentUserRound?.bones_start.replace(/'/g, '"'));
        numberOfOptions = bonesArray.length;
    } catch (e) {
        console.error('Error parsing bones_start:', e);
    }

    return (
        <View style={styles.container}>
            <Text>Your Bones: {currentUserRound?.bones_start}</Text>
            {isTurnToBet && currentUserRound?.bet == null ? (
                <>
                    <Picker
                        selectedValue={bet}
                        onValueChange={handleBetChange}
                        style={{ height: 50, width: 150 }}>
                        {[...Array(numberOfOptions + 1).keys()].map(value => (
                            <Picker.Item key={value} label={`${value}`} value={value} />
                        ))}
                    </Picker>
                    <Button title="Place Bet" onPress={submitBet} disabled={placingBetLoading} />
                </>
            ) : (
                <Text>Waiting for other players to bet...</Text>
            )}
            {players.map((player) => {
                const playerBet = data?.game_user_round_by_round_id.find(r => r.game_user.user.id == player.user.id)?.bet;
                const betStyle = getBetStyle(`position${player.position}`);
                return (
                    <View key={player.user.id} style={[styles.bonesContainer, betStyle]}>
                        {playerBet != null && (
                            <Text style={styles.bonesText}>Bet: {playerBet}</Text>
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

export default BettingPhase;
