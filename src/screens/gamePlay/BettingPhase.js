import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { gql, useMutation, useQuery } from '@apollo/client';
import turnButtonImage from '../../../assets/turn_button.png';
import boneImages from '../../assets/BoneAssets';
import { TouchableOpacity } from 'react-native';

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

const BettingPhase = ({ gameRoundId, currentGameUserId, onBettingComplete, players, getBetStyle, getTurnButtonStyle }) => {
    const [bet, setBet] = useState(0);
    const { data, loading, error } = useQuery(GET_GAME_USER_ROUND, {
        variables: { gameRoundId },
        pollInterval: 1000,
    });

    const [placeBet, { loading: placingBetLoading }] = useMutation(PLACE_BET);

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

    if (loading) return <Text style={{marginTop: -100}}>Loading...</Text>;
    if (error) return <Text>Error: {error.message}</Text>;

    const currentUserRound = data?.game_user_round_by_round_id.find(r => r.game_user.id == currentGameUserId);
    let bonesArray = [];
    try {
        bonesArray = JSON.parse(currentUserRound?.bones_start.replace(/'/g, '"'));
    } catch (e) {
        console.error('Error parsing bones_start:', e);
    }

    const gameUserRounds = data.game_user_round_by_round_id;
    const allBetsNull = gameUserRounds.every(r => r.bet == null);

    let firstUserToBet;
    if (allBetsNull) {
        firstUserToBet = gameUserRounds.find(r => r.turn === 0);
    } else {
        const maxTurnWithBet = Math.max(...gameUserRounds.filter(r => r.bet != null).map(r => r.turn));
        firstUserToBet = gameUserRounds.find(r => r.turn === maxTurnWithBet + 1);
    }

    return (
        <View style={styles.container}>
            {firstUserToBet?.game_user.id == currentGameUserId ? (
                <>
                    <Picker
                        selectedValue={bet}
                        onValueChange={handleBetChange}
                        style={{ height: 40, width: 150, top: -160 }}>
                        {[...Array(bonesArray.length + 1).keys()].map(value => (
                            <Picker.Item key={value} label={`${value}`} value={value} />
                        ))}
                    </Picker>
                    <TouchableOpacity style={{ top: -55, }} onPress={submitBet} disabled={placingBetLoading}>
                        <Text style={{fontSize: 22, fontWeight: 'bold', opacity: 0.7}}>Place Bet</Text>
                    </TouchableOpacity>
                </>
            ) : (
                <Text style={{top: -100 }}>Waiting for other players to bet...</Text>)
            }
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
            {players.map((player) => {
                const turnButtonStyle = getTurnButtonStyle(`position${player.position}`);
                return (
                    <View key={player.user.id} style={[styles.bonesContainer, turnButtonStyle]}>
                        {firstUserToBet?.game_user.user.id === player.user.id && (
                            <Image
                                style={styles.turnButton}
                                source={turnButtonImage}
                            />
                        )}
                    </View>
                );
            })}
            <View style={styles.bonesRow}>
                {bonesArray.slice(0, 7).map((bone, index) => {
                    if (bone) {
                        const boneImageName = bone.join('_');
                        return (
                            <Image
                                key={`bone-${index}`}
                                style={styles.boneImage}
                                source={boneImages[boneImageName]}
                            />
                        );
                    }
                    return null;
                })}
            </View>
            <View style={[styles.bonesRow, { bottom: 0 }]}>
                {bonesArray.slice(7).map((bone, index) => {
                    if (bone) {
                        const boneImageName = bone.join('_');
                        return (
                            <Image
                                key={`bone-${index + 7}`}
                                style={styles.boneImage}
                                source={boneImages[boneImageName]}
                            />
                        );
                    }
                    return null;
                })}
            </View>
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
    },
    bonesRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 5,
        position: 'absolute',
        bottom: 96,
    },
    boneImage: {
        width: 45,
        height: 90,
        marginHorizontal: 2,
    },
    turnButton: {
        width: 15,
        height: 15,
        position: 'absolute',
    },
});

export default BettingPhase;
