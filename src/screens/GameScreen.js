import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { gql, useQuery, useMutation } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GamePlay from './GamePlay';

const UNREGISTER_FROM_ROOM = gql`
  mutation UnregisterFromRoom($type: String!, $game_id: Int!) {
    unregisterFromRoom(type: $type, game_id: $game_id)
  }
`;

const GET_GAME_DETAILS = gql`
  query GetGame($id: ID!) {
    game(id: $id) {
      id
      game_started
      users_count
      rounds_before_max_amount
      rounds_max_amount
      game_started
      game_finished
    }
  }
`;

const GET_GAME_USERS = gql`
  query GetGameUsers($gameId: Int!) {
    game_users_by_game_id(game_id: $gameId) {
      id
      turn_lot_bone
      turn_value
      user {
        id
        username
      }
    }
  }
`;

const GameScreen = ({ route, navigation }) => {
    const [gameId, setGameId] = useState(null); // State to hold gameId
    const [uniqCode, setUniqCode] = useState('');
    const [gameStarted, setGameStarted] = useState(false);
    const [roundsMaxAmount, setRoundsMaxAmount] = useState(false);
    const [roundsBeforeMaxAmount, setRoundsBeforeMaxAmount] = useState(false);
    const [players, setPlayers] = useState([]);
    const [userId, setUserId] = useState(null);
    const [currentGameUserId, setCurrentGameUserId] = useState(null);
    const [usersCount, setUsersCount] = useState(0);

    const usersRegistered = players.length;

    const { data: gameDetailsData } = useQuery(GET_GAME_DETAILS, {
        variables: { id: gameId },
        onCompleted: data => {
            if (data.game) {
                setGameStarted(data.game.game_started == 1);
                setUsersCount(data.game.users_count);
                setRoundsMaxAmount(data.game.rounds_max_amount);
                setRoundsBeforeMaxAmount(data.game.rounds_before_max_amount);
            }
        },
        pollInterval: 2000,
    });

    const { data: gameUsersData } = useQuery(GET_GAME_USERS, {
        variables: { gameId: parseInt(gameId, 10) },
        pollInterval: 2000,
    });

    const [unregisterFromRoom, { loading: unregistering }] = useMutation(UNREGISTER_FROM_ROOM, {
        onCompleted: async () => {
            await AsyncStorage.removeItem('active_game_uniq_code');
            await AsyncStorage.removeItem('active_game_id');
            Alert.alert('Success', 'You have successfully unregistered from the game.');
            navigation.reset({ index: 0, routes: [{ name: 'Lobby' }] });
        },
        onError: (err) => {
            Alert.alert('Error', `Failed to unregister: ${err.message}`);
        },
    });

    useEffect(() => {
        const fetchGameId = async () => {
            const storedGameId = await AsyncStorage.getItem('active_game_id');
            if (storedGameId) setGameId(parseInt(storedGameId, 10)); // Ensure gameId is set as a number
        };
        fetchGameId();
    }, []);


    useEffect(() => {
        const fetchInitialData = async () => {
            const code = await AsyncStorage.getItem('active_game_uniq_code');
            const storedUserId = await AsyncStorage.getItem('user_id');
            if (code) setUniqCode(code);
            if (storedUserId) setUserId(parseInt(storedUserId, 10));
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (gameUsersData?.game_users_by_game_id && usersCount) {

            const sortedPlayers = gameUsersData.game_users_by_game_id.filter(p => p != null);
            const userIndex = sortedPlayers.findIndex((player) => player.user.id == userId);
            const positions = sortedPlayers.map((player, index) => ({
                ...player,
                name: player.user.id == userId ? "You" : player.user.username,

                position: (index - userIndex + usersCount) % usersCount
            }));
            const currentUserGameInfo = sortedPlayers.find((player) => player.user.id == userId);
            if (currentUserGameInfo) {
                setCurrentGameUserId(parseInt(currentUserGameInfo.id, 10));
            }
            setPlayers(positions.filter(player => player.position < usersCount));
        }
    }, [gameUsersData, userId, usersCount]);

    const handleUnregister = () => {
        if (gameStarted) {
            Alert.alert('Error', 'You cannot unregister from a game that has already started.');
            return;
        }
        unregisterFromRoom({ variables: { type: 'private', game_id: parseInt(gameId, 10) } });
    };

    const handleBackToLobby = () => {
        navigation.reset({ index: 0, routes: [{ name: 'Lobby' }] });
    };

    const getDynamicStyles = (usersCount) => ({
        position0: { bottom: 20, alignSelf: 'center' },
        position1: usersCount === 2
            ? { top: 20, alignSelf: 'center' }
            : { left: 20, alignSelf: 'center', transform: [{ translateY: -40 }] },
        position2: usersCount === 3
            ? { right: 20, alignSelf: 'center', transform: [{ translateY: -40 }] }
            : { top: 20, alignSelf: 'center' },
        position3: { right: 20, alignSelf: 'center', transform: [{ translateY: -40 }] },
    });

    return (
        <View style={styles.container}>
            <Text>Game Code: {uniqCode}</Text>
            <Text>Players: {usersRegistered}/{usersCount}</Text>
            <Text>Max Rounds: {roundsMaxAmount}</Text>
            <Text>Rounds Before Max: {roundsBeforeMaxAmount}</Text>
            <GamePlay userId = {userId} currentGameUserId = {currentGameUserId} gameStarted = {gameStarted} gameDetails={gameDetailsData?.game} players={players} dynamicStyles={getDynamicStyles(usersCount)} usersCount={usersCount} />
            <Button
                title={unregistering ? 'Unregistering...' : 'Unregister'}
                onPress={handleUnregister}
                disabled={unregistering}
            />
            <Button title="Back to Lobby" onPress={handleBackToLobby} />
        </View>
    );

};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
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
    }
});

const PlayerCircle = ({ name, style }) => (
    <View style={[styles.playerCircle, style]}>
        <Text>{name}</Text>
    </View>
);

export default GameScreen;
