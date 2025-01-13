import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BettingPhase from './gamePlay/BettingPhase';
import MovesPhase from './gamePlay/MovesPhase';
import RoundPreparation from './gamePlay/RoundPreparation';
import CountingPhase from './gamePlay/CountingPhase';
import { gql, useQuery } from '@apollo/client';

const GET_GAME_ROUNDS = gql`
    query GetGameRounds($gameId: Int!) {
      game_rounds_by_game_id(game_id: $gameId) {
        id
        round {
          id
        }
      }
    }
  `;

const GamePlay = ({ userId, currentGameUserId, gameStarted, gameDetails, players, dynamicStyles, usersCount }) => {
    const [currentTurn, setCurrentTurn] = useState(null);
    const [currentPhase, setCurrentPhase] = useState('waiting');
    const [gameRounds, setGameRounds] = useState([]);
    const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
    const gameIdInt = parseInt(gameDetails?.id, 10);
    const { data, loading, error } = useQuery(GET_GAME_ROUNDS, {
        variables: { gameId: gameIdInt },
        skip: currentPhase !== 'preparation',
        onCompleted: data => {
            setGameRounds(data.game_rounds_by_game_id);
        },
        pollInterval: 2000,
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
            setCurrentRoundIndex(currentRoundIndex + 1);
            setCurrentPhase('preparation');
        }, 2000);
    };

    useEffect(() => {
        const initialTurnPlayer = players.find(player => player.turn_value === 0);
        if (initialTurnPlayer) {
            setCurrentTurn(initialTurnPlayer.user.id);
            setTimeout(() => {
                setCurrentPhase('preparation');
            }, 3000);
        }
    }, [players]);

    const getBonesStyle = (position) => {
        switch (position) {
            case 'position0':
                return { bottom: 90, alignSelf: 'center' };
            case 'position1':
                return usersCount === 2 ?
                    { top: 90, alignSelf: 'center' } :
                    { alignSelf: 'center', transform: [{ translateY: -40 }, {translateX: -60}] };
            case 'position2':
                return usersCount === 3 ?
                    { alignSelf: 'center', transform: [{ translateY: -40 } , {translateX: 60}] } :
                    { top: 90, alignSelf: 'center' };
            case 'position3':
                return { alignSelf: 'center', transform: [{ translateY: -40 } , {translateX: 60}] };
            default:
                return {};
        }
    };

    if (loading) return <Text>Loading game rounds...</Text>;
    if (error) return <Text>Error loading game rounds: {error.message}</Text>;

    return (
        <View style={styles.gameArea}>
            {gameRounds.map((gameRound, index) => (
                <>
                    {currentPhase === 'preparation' && index === currentRoundIndex && (
                        <RoundPreparation
                            key={gameRound.id}
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
                        />
                    )}
                    {currentPhase === 'moves' && index === currentRoundIndex && (
                        <MovesPhase
                            gameRoundId={parseInt(gameRound?.id, 10)}
                            currentGameUserId={currentGameUserId}
                            onMovesComplete={() => handleMovesComplete(gameRound)}
                            players={players}
                            getBonesStyle={getBonesStyle}
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
                </>
            ))}
            {players.map((player) => {
                const positionStyle = dynamicStyles[`position${player.position}`];
                const playerName = player.user.id == userId ? "You" : player.user.username;
                return (
                    <View key={player.user.id} style={[styles.playerCircle, positionStyle]}>
                        <Text>{playerName}</Text>
                    </View>
                );
            })}
            {players.map((player) => {
                const bonesStyle = getBonesStyle(`position${player.position}`);
                return (
                    <View key={`bones-${player.user.id}`} style={[styles.bonesContainer, bonesStyle]}>
                        {currentPhase === 'waiting' && (
                            <Text style={styles.bonesText}>{player.turn_lot_bone}</Text>
                        )}
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
        borderColor: 'red',
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
    }
});

export default GamePlay;
