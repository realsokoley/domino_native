import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import boneImages from '../assets/BoneAssets';
import BettingPhase from './gamePlay/BettingPhase';
import MovesPhase from './gamePlay/MovesPhase';
import RoundPreparation from './gamePlay/RoundPreparation';
import CountingPhase from './gamePlay/CountingPhase';
import FinalPhase from './gamePlay/FinalPhase';
import { gql, useQuery } from '@apollo/client';

const GET_GAME_ROUNDS = gql`
    query GetGameRounds($gameId: Int!) {
      game_rounds_by_game_id(game_id: $gameId) {
        id
        phase
        round {
          id
        }
      }
    }
  `;

const GamePlay = ({ userId, currentGameUserId, gameStarted, gameDetails, players, dynamicStyles, usersCount, navigation }) => {
    const [currentTurn, setCurrentTurn] = useState(null);
    const [currentPhase, setCurrentPhase] = useState('waiting');
    const [gameRounds, setGameRounds] = useState([]);
    const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
    const [showFirstMoveDraw, setShowFirstMoveDraw] = useState(false);
    const [showTurnLotBones, setShowTurnLotBones] = useState(false);
    const gameIdInt = gameDetails?.id ? parseInt(gameDetails.id, 10) : null;

    const { data, loading, error, refetch } = useQuery(GET_GAME_ROUNDS, {
        variables: { gameId: gameIdInt },
        skip: gameIdInt == null || currentPhase !== 'waiting',
        onCompleted: data => {
            setGameRounds(data.game_rounds_by_game_id);
        },
        pollInterval: 2000,
        fetchPolicy: 'network-only',
    });

    const handlePreparationComplete = (gameUserRound) => {
        console.log("Preparation complete for round:", gameUserRound.id);
        setTimeout(() => {
            setCurrentPhase('betting');
        }, 1000);
    }

    const handleBettingComplete = (gameUserRound) => {
        console.log("Betting complete for round:", gameUserRound.id);
        setCurrentPhase('moves');
    };

    const handleMovesComplete = (gameUserRound) => {
        console.log("Moves complete for round:", gameUserRound.id);
        setTimeout(() => {
            setCurrentPhase('counting');
        }, 2000);
    };

    const handleCountingComplete = (gameUserRound) => {
        setTimeout(() => {
            if (gameDetails.game_finished == 1) {
                setCurrentPhase('final');
            } else {
                setCurrentRoundIndex(currentRoundIndex + 1);
                setCurrentPhase('preparation');
            }
        }, 3000);
    };

    useEffect(() => {
        const initialTurnPlayer = players.find(player => player.turn_value === 0);
        if (initialTurnPlayer) {
            setCurrentTurn(initialTurnPlayer.user.id);
            refetch();
        }
    }, [players, refetch]);

    useEffect(() => {
        if (data) {
            setGameRounds(data.game_rounds_by_game_id);
            if (data.game_rounds_by_game_id.length > 0) {
                const lastValidRound = data.game_rounds_by_game_id.slice().reverse().find(round => round.phase && round.phase !== 'waiting');
                if (lastValidRound) {
                    setCurrentPhase(lastValidRound.phase);
                    setCurrentRoundIndex(data.game_rounds_by_game_id.findIndex(round => round.id === lastValidRound.id));
                } else {
                    setTimeout(() => {
                        setShowFirstMoveDraw(true);
                        setTimeout(() => {
                            setShowTurnLotBones(true);
                            setTimeout(() => {
                                setShowTurnLotBones(false);
                                setShowFirstMoveDraw(false);
                                setCurrentPhase('preparation');
                            }, 2000);
                        }, 2000);
                    }, 2000);
                }
            }
        }
    }, [data]);

    const getBonesStyle = (position) => {
        switch (position) {
            case 'position0':
                return { bottom: 310, alignSelf: 'center' };
            case 'position1':
                return usersCount === 2 ?
                    { top: 90, alignSelf: 'center' } :
                    { alignSelf: 'center', transform: [{ translateY: -80 }, {translateX: -60}] };
            case 'position2':
                return usersCount === 3 ?
                    { alignSelf: 'center', transform: [{ translateY: -80 } , {translateX: 60}] } :
                    { top: 90, alignSelf: 'center' };
            case 'position3':
                return { alignSelf: 'center', transform: [{ translateY: -80 } , {translateX: 60}] };
            default:
                return {};
        }
    };

    const getTurnButtonStyle = (position) => {
        switch (position) {
            case 'position0':
                return { bottom: 310, alignSelf: 'center', transform: [{translateX: 25}]};
            case 'position1':
                return usersCount === 2 ?
                    { top: 80, alignSelf: 'center', transform: [{translateX: 25}] } :
                    { alignSelf: 'center', transform: [{ translateY: -105 }, {translateX: -80}] };
            case 'position2':
                return usersCount === 3 ?
                    { alignSelf: 'center', transform: [{ translateY: -105 } , {translateX: 80}] } :
                    { top: 80, alignSelf: 'center', transform: [{translateX: 25}] };
            case 'position3':
                return { alignSelf: 'center', transform: [{ translateY: -105 } , {translateX: 80}] };
            default:
                return {};
        }
    };

    if (loading) return <Text>Loading game rounds...</Text>;
    if (error) return <Text>Error loading game rounds: {error.message}</Text>;

    return (
        <View style={styles.gameArea}>
            {gameStarted && (<Text style={styles.roundNumber}>Round: {currentRoundIndex + 1}</Text>)}
            <View style={styles.whiteLine} />
            {gameRounds.map((gameRound, index) => (
                <React.Fragment key={gameRound.id}>
                    {currentPhase === 'preparation' && index === currentRoundIndex && (
                        <RoundPreparation
                            roundKey={gameRound.id}
                            currentGameUserId={currentGameUserId}
                            gameRoundId={parseInt(gameRound?.id, 10)}
                            onPreparationComplete={() => handlePreparationComplete(gameRound)}
                            isActiveRound={index === currentRoundIndex}
                        />
                    )}
                    {currentPhase === 'betting' && index === currentRoundIndex && (
                        <BettingPhase
                            gameRoundId={parseInt(gameRound?.id, 10)}
                            currentGameUserId={currentGameUserId}
                            onBettingComplete={() => handleBettingComplete(gameRound)}
                            players={players}
                            getBetStyle={getBonesStyle}
                            getTurnButtonStyle={getTurnButtonStyle}
                        />
                    )}
                    {currentPhase === 'moves' && index === currentRoundIndex && (
                        <MovesPhase
                            gameRoundId={parseInt(gameRound?.id, 10)}
                            currentGameUserId={currentGameUserId}
                            onMovesComplete={() => handleMovesComplete(gameRound)}
                            players={players}
                            getBonesStyle={getBonesStyle}
                            getTurnButtonStyle={getTurnButtonStyle}
                        />
                    )}
                    {currentPhase === 'counting' && index === currentRoundIndex && (
                        <CountingPhase
                            gameRoundId={parseInt(gameRound?.id, 10)}
                            onCountingComplete={() => handleCountingComplete(gameRound)}
                            players={players}
                            getBonesStyle={getBonesStyle}
                        />
                    )}
                    {currentPhase === 'final' && index === currentRoundIndex && <FinalPhase players={players} navigation={navigation} />}
                </React.Fragment>
            ))}
            {showFirstMoveDraw && !showTurnLotBones && <Text>First move draw</Text>}
            {players.map((player) => {
                const bonesStyle = getBonesStyle(`position${player.position}`);
                const boneImageName = player.turn_lot_bone?.replace(',', '_').replace('[', '').replace(']', '');
                if (showTurnLotBones && currentPhase === 'waiting') {
                    return (
                        <View key={`bones-${player.user.id}`} style={[styles.bonesContainer, bonesStyle]}>
                            {currentPhase === 'waiting' && (
                                <Image
                                    style={styles.bonesImage}
                                    source={boneImages[boneImageName]}
                                />
                            )}
                        </View>
                    );
                }
            })}
            {players.map((player) => {
                const positionStyle = dynamicStyles[`position${player.position}`];
                const playerName = player.user.id == userId ? "You" : player.user.username;
                return (
                    <View key={player.user.id} style={[styles.playerCircle, positionStyle]}>
                        <Text style={styles.playerName}>{playerName}</Text>
                    </View>
                );
            })}
            {players.map((player) => {
                const scorePlaceStyle = (() => {
                    switch (player.position) {
                        case 0: return { bottom: 220, alignSelf: 'center', }
                        case 3:
                            return { right: 20, alignSelf: 'center', transform: [{ translateY: -40 }] };
                        case 1:
                            return usersCount === 2 ?
                                { top: 2, alignSelf: 'center' } :
                                { left: 20, alignSelf: 'center', transform: [{ translateY: -40 }] };
                        case 2:
                            return usersCount === 3 ?
                                { right: 20, alignSelf: 'center', transform: [{ translateY: -40 }] }:
                                { top: 2, alignSelf: 'center' };
                        default:
                            return {};
                    }
                })();
                return (
                    <View key={`score-${player.user.id}`} style={[styles.scorePlaceContainer, scorePlaceStyle]}>
                        {player.current_score !== null && <Text>GP: {player.current_score}</Text>}
                    </View>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    gameArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        borderWidth: 2,
        borderColor: '#fff',
    },
    whiteLine: {
        position: 'absolute',
        bottom: 196,
        width: '100%',
        height: 2,
        backgroundColor: 'white',
    },
    playerCircle: {
        width: 60,
        height: 60,
        borderRadius: 40,
        backgroundColor: 'lightgray',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
    },
    bonesContainer: {
        position: 'absolute',
        padding: 5,
    },
    bonesText: {
        fontWeight: 'bold',
    },
    bonesImage: {
        width: 30,
        height: 60,
    },
    playerName: {
        textAlign: 'center',
        fontSize: 12,
        color: 'black',
        zIndex: 1000,
    },
    scorePlaceContainer: {
        position: 'absolute',
        zIndex: 1000,
    },
    roundNumber: {
        position: 'absolute',
        top: 2,
        right: 5,
        fontSize: 16,
        fontWeight: 'normal',
        color: 'black',
    },
});

export default GamePlay;
