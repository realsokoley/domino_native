import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { gql, useMutation, useQuery } from '@apollo/client';
import boneImages from '../../assets/BoneAssets';
import turnButtonImage from '../../../assets/turn_button.png';

const GET_GAME_USER_ROUND = gql`
  query GetGameUserRounds($gameRoundId: Int!) {
    game_user_round_by_round_id(game_round_id: $gameRoundId) {
      id
      turn
      bones_start
      bones_left
      winners
      bet
      game_round {
        moves_made
      }
      game_user {
        id
        user {
          id
        }
      }
    }
  }
`;

const GET_MOVE_USER_BY_MOVE_AND_TURN = gql`
  query GetMoveUserByMoveAndTurn($gameRoundId: Int!, $moveNumber: Int!, $turn: Int!) {
    move_user_by_move_and_turn(game_round_id: $gameRoundId, move_number: $moveNumber, turn: $turn) {
      id
      bone
      turn
      game_user_round {
        id
        game_user {
          id
        }
      }
    }
  }
`;

const MAKE_MOVE = gql`
  mutation MakeMove($gameUserRoundId: Int!, $boneId: Int!, $moveNumber: Int!) {
    move(game_user_round_id: $gameUserRoundId, bone_id: $boneId, move_number: $moveNumber) {
      id
    }
  }
`;

const MovesPhase = ({ gameRoundId, currentGameUserId, onMovesComplete, players, getBonesStyle, getTurnButtonStyle }) => {
    const [currentMoveNumber, setCurrentMoveNumber] = useState(0);
    const [currentTurn, setCurrentTurn] = useState(0);
    const [movesNumber, setMovesNumber] = useState(-1);
    const [bonesNumber, setBonesNumber] = useState(0);
    const [bones, setBones] = useState([]);
    const [playerMoves, setPlayerMoves] = useState({});
    const [playedBones, setPlayedBones] = useState([]);
    const [isMakingMove, setIsMakingMove] = useState(false);
    const [finalizingMove, setFinalizingMove] = useState(false);
    const { data, loading, error, refetch } = useQuery(GET_GAME_USER_ROUND, {
        variables: { gameRoundId },
        fetchPolicy: 'network-only',
        pollInterval: 2000,
    });

    const { data: moveData, refetch: refetchMoveData } = useQuery(GET_MOVE_USER_BY_MOVE_AND_TURN, {
        variables: { gameRoundId, moveNumber: currentMoveNumber, turn: currentTurn },
        fetchPolicy: 'network-only',
        pollInterval: 2000,
        skip: movesNumber < 0 || finalizingMove,
    });

    const [makeMove] = useMutation(MAKE_MOVE);

    useEffect(() => {
        if (data && currentMoveNumber == 0 && !finalizingMove) {
            const gameUserRounds = data.game_user_round_by_round_id;
            const currentUserRound = gameUserRounds.find(r => r.game_user.id == currentGameUserId);
            const bonesStartArray = JSON.parse(currentUserRound?.bones_start.replace(/'/g, '"'));
            const bonesLeftArray = JSON.parse(currentUserRound?.bones_left.replace(/'/g, '"'));

            const playedBones = bonesStartArray.reduce((acc, bone, index) => {
                if (bonesLeftArray[index] === 'XXX') {
                    acc.push(index);
                }
                return acc;
            }, []);

            setBonesNumber(bonesStartArray.length);
            setBones(bonesStartArray);
            setPlayedBones(playedBones);

            const movesMade = currentUserRound.game_round.moves_made;
            setCurrentMoveNumber(movesMade + 1);
            setMovesNumber(movesMade);
            refetchMoveData();
        }
    }, [data, currentGameUserId, currentMoveNumber, refetchMoveData, movesNumber]);

    useEffect(() => {
        if (moveData) {
            if (currentTurn === 0) {
                setPlayerMoves({});
            }
            const newMoves = moveData.move_user_by_move_and_turn.reduce((acc, move) => {
                acc[move.game_user_round.game_user.id] = move.bone;
                return acc;
            }, {});

            setPlayerMoves(prevMoves => {
                return { ...prevMoves, ...newMoves };
            });
        }
    }, [currentTurn, moveData, players.length]);

    useEffect(() => {
        if (moveData && moveData.move_user_by_move_and_turn.every(move => move.bone !== null)) {
            if (currentTurn === players.length - 1) {
                setFinalizingMove(true);
                setTimeout(() => {
                    if (movesNumber === bonesNumber - 1) {
                        onMovesComplete();
                    }
                    setMovesNumber((movesNumber + 1));
                    setCurrentMoveNumber(currentMoveNumber + 1);
                    setFinalizingMove(false);
                    setCurrentTurn(0);
                }, 1000);
            } else {
                setTimeout(() => {
                    setCurrentTurn((currentTurn + 1) % players.length);
                }, 100);
            }
        }
    }, [moveData, players.length, currentTurn, movesNumber, bonesNumber, currentMoveNumber, onMovesComplete, refetchMoveData, finalizingMove]);

    const handleBoneClick = (boneId) => {
        if (finalizingMove) return; // Block functionality if finalizing move
        setIsMakingMove(true);
        const gameUserRoundId = parseInt(data.game_user_round_by_round_id.find(r => r.game_user.id == currentGameUserId).id, 10);
        makeMove({ variables: { gameUserRoundId, boneId, moveNumber: currentMoveNumber } })
            .then(response => {
                setPlayedBones([...playedBones, boneId]);
                refetchMoveData();
            })
            .catch(error => {
                console.error('Error making move:', error);
            })
            .finally(() => {
                setIsMakingMove(false);
            });
    };

    if (loading) return <Text style={{marginTop: -100}}>Loading...</Text>;
    if (error) return <Text>Error: {error.message}</Text>;

    const currentUserRound = data?.game_user_round_by_round_id.find(r => r.game_user.id == currentGameUserId);
    const winners_count = currentUserRound?.winners ?? 0;
    const bet = currentUserRound?.bet;

    return (
        <View style={styles.container}>
            {players.map((player) => {
                const bonesStyle = getBonesStyle(`position${player.position}`);
                return (
                    <View key={player.id} style={[styles.bonesContainer, bonesStyle]}>
                        {playerMoves[player.id] != null && currentTurn != 0 && (
                            <Image
                                style={styles.boneImagePlaced}
                                source={boneImages[JSON.parse(playerMoves[player.id]).join('_')]}
                            />
                        )}
                    </View>
                );
            })}
            {players.map((player) => {
                const turnButtonStyle = getTurnButtonStyle(`position${player.position}`);
                return (
                    <View key={player.user.id} style={[styles.bonesContainer, turnButtonStyle]}>
                        {moveData?.move_user_by_move_and_turn.some(move => move.game_user_round.game_user.id == player.id && move.bone === null) && (
                            <Image
                                style={styles.turnButton}
                                source={turnButtonImage}
                            />
                        )}
                    </View>
                );
            })}
            <View style={[styles.roundScorePlaceContainer]}>
                <Text>Round Winners: {winners_count}/{bet}</Text>
            </View>
            <View style={[styles.bonesRow]}>
                {bones.slice(0, 7).map((bone, originalIndex) => {
                    if (playedBones.includes(originalIndex)) return null;
                    const isCurrentUserTurn = moveData?.move_user_by_move_and_turn.some(
                        move => move.game_user_round.game_user.id == currentGameUserId && move.bone === null
                    );
                    const boneImageName = bone.join('_');
                    return (
                        <TouchableOpacity
                            key={`bone-${originalIndex}`}
                            onPress={() => isCurrentUserTurn && !isMakingMove && handleBoneClick(originalIndex)}
                            disabled={!isCurrentUserTurn || isMakingMove}
                        >
                            <Image
                                style={[styles.boneImage, (!isCurrentUserTurn || isMakingMove) && styles.disabledBoneImage]}
                                source={boneImages[boneImageName]}
                            />
                        </TouchableOpacity>
                    );
                })}
            </View>
            <View style={[styles.bonesRow, { bottom: 0 }]}>
                {bones.slice(7).map((bone, originalIndex) => {
                    if (playedBones.includes(originalIndex + 7)) return null;
                    const isCurrentUserTurn = moveData?.move_user_by_move_and_turn.some(
                        move => move.game_user_round.game_user.id == currentGameUserId && move.bone === null
                    );
                    const boneImageName = bone.join('_');
                    return (
                        <TouchableOpacity
                            key={`bone-${originalIndex + 7}`}
                            onPress={() => isCurrentUserTurn && !isMakingMove && handleBoneClick(originalIndex + 7)}
                            disabled={!isCurrentUserTurn || isMakingMove}
                        >
                            <Image
                                style={[styles.boneImage, (!isCurrentUserTurn || isMakingMove) && styles.disabledBoneImage]}
                                source={boneImages[boneImageName]}
                            />
                        </TouchableOpacity>
                    );
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
    boneImagePlaced: {
        width: 30,
        height: 60,
        marginHorizontal: 2,
    },
    disabledBoneImage: {
        opacity: 0.5,
    },
    disabledBoneText: {
        color: 'gray',
    },
    turnButton: {
        width: 15,
        height: 15,
        position: 'absolute',
    },
    roundScorePlaceContainer: {
        position: 'absolute',
        zIndex: 1000,
        bottom: 200,
    },
});

export default MovesPhase;
