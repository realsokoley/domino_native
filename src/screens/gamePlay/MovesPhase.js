import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {gql, useMutation, useQuery} from '@apollo/client';

const GET_GAME_USER_ROUND = gql`
  query GetGameUserRounds($gameRoundId: Int!) {
    game_user_round_by_round_id(game_round_id: $gameRoundId) {
      id
      turn
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

const GET_MOVE_USER_BY_MOVE_AND_TURN = gql`
  query GetMoveUserByMoveAndTurn($gameRoundId: Int!, $moveNumber: Int!, $turn: Int!) {
    move_user_by_move_and_turn(game_round_id: $gameRoundId, move_number: $moveNumber, turn: $turn) {
      id
      bone
      turn
      game_user_round {
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

const MovesPhase = ({ gameRoundId, currentGameUserId, onMovesComplete, players, getBonesStyle }) => {
    const [currentMoveNumber, setCurrentMoveNumber] = useState(1);
    const [currentTurn, setCurrentTurn] = useState(0);
    const [movesNumber, setMovesNumber] = useState(0);
    const [bonesNumber, setBonesNumber] = useState(0);
    const [bones, setBones] = useState([]);
    const [playerMoves, setPlayerMoves] = useState({});
    const { data, loading, error } = useQuery(GET_GAME_USER_ROUND, {
        variables: { gameRoundId },
        pollInterval: 2000,
    });

    const { data: moveData, refetch: refetchMoveData } = useQuery(GET_MOVE_USER_BY_MOVE_AND_TURN, {
        variables: { gameRoundId, moveNumber: currentMoveNumber, turn: currentTurn },
        skip: !data,
    });

    const [makeMove] = useMutation(MAKE_MOVE);

    useEffect(() => {
        if (data) {
            const gameUserRounds = data.game_user_round_by_round_id;
            const currentUserRound = gameUserRounds.find(r => r.game_user.id == currentGameUserId);
            const bonesArray = JSON.parse(currentUserRound?.bones_start.replace(/'/g, '"'));
            setBonesNumber(bonesArray.length);
            setBones(bonesArray);
        }
    }, [data, currentGameUserId]);

    useEffect(() => {
        if (moveData) {
            const newMoves = moveData.move_user_by_move_and_turn.reduce((acc, move) => {
                acc[move.game_user_round.game_user.id] = move.bone;
                return acc;
            }, {});
            setPlayerMoves(prevMoves => {
                return {...prevMoves, ...newMoves};
            });
            const gameUserRounds = data.game_user_round_by_round_id;
            const player = gameUserRounds.find(p => p.turn === currentTurn);
            console.log(player);

            console.log(moveData);
            console.log(currentTurn);
            console.log(currentMoveNumber);
            console.log(bonesNumber);
            if (player && newMoves[player.game_user.id] != null) {
                setCurrentTurn((currentTurn + 1) % players.length);
                console.log('Current turn:', currentTurn);
                if (currentTurn === 0) {
                    setMovesNumber((movesNumber + 1) % bonesNumber);
                    if (movesNumber === 0) {
                        onMovesComplete();
                    } else {
                        setCurrentMoveNumber(currentMoveNumber + 1);
                    }
                }
            }
        }
    }, [moveData, players, currentGameUserId, currentTurn, onMovesComplete]);

    const handleBoneClick = (boneId) => {
        const gameUserRoundId = parseInt(data.game_user_round_by_round_id.find(r => r.game_user.id == currentGameUserId).id, 10);
        makeMove({ variables: { gameUserRoundId, boneId, moveNumber: currentMoveNumber } })
            .then(response => {
                console.log('Move made:', response.data.move);
                setCurrentTurn((currentTurn + 1) % players.length);
                refetchMoveData().then(() => {
                    if (currentTurn === 0) {
                        setMovesNumber((movesNumber + 1) % bonesNumber);
                        if (movesNumber === 0) {
                            onMovesComplete();
                        } else {
                            setCurrentMoveNumber(currentMoveNumber + 1);
                        }
                    }
                });
            })
            .catch(error => {
                console.error('Error making move:', error);
            });
    };

    if (loading) return <Text>Loading...</Text>;
    if (error) return <Text>Error: {error.message}</Text>;

    const currentUserRound = data?.game_user_round_by_round_id.find(r => r.game_user.id == currentGameUserId);

    return (
        <View style={styles.container}>
            <Text>Your Bones: {currentUserRound?.bones_start}</Text>
            {players.map((player) => {
                const bonesStyle = getBonesStyle(`position${player.position}`);
                return (
                    <View key={player.id} style={[styles.bonesContainer, bonesStyle]}>
                        {playerMoves[player.id] != null && (
                            <Text style={styles.bonesText}>Bone: {playerMoves[player.id]}</Text>
                        )}
                    </View>
                );
            })}
            {currentTurn === currentUserRound.turn && (
                <View style={styles.bonesContainer}>
                    {bones.map((bone, index) => (
                        <TouchableOpacity key={index} onPress={() => handleBoneClick(index)}>
                            <Text style={styles.bonesText}>{bone}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
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

export default MovesPhase;