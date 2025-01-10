import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList, Alert } from 'react-native';
import { useMutation, gql, useQuery } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const CREATE_PRIVATE_ROOM = gql`
  mutation CreatePrivateRoom($count: Int!, $rounds_max_amount: Int!, $rounds_before_max_amount: Int!) {
    createPrivateRoom(
      count: $count
      rounds_max_amount: $rounds_max_amount
      rounds_before_max_amount: $rounds_before_max_amount
    ) {
      id
      uniq_code
      count
    }
  }
`;

const REGISTER_IN_PRIVATE_ROOM = gql`
  mutation RegisterInPrivateRoom($uniq_code: String!) {
    registerInPrivateRoom(uniq_code: $uniq_code) {
      id
      uniq_code
      count
      room_created
    }
  }
`;

const CHECK_ACTIVE_GAME = gql`
  query CheckActiveGame($userId: Int!) {
    game_users(first: 10000, page: 1, user_id: $userId) {
      data {
        id
        game {
          id
          game_finished
        }
      }
    }
  }
`;

const PrivateTablesScreen = () => {
    const navigation = useNavigation();
    const [count, setCount] = useState('');
    const [roundsMaxAmount, setRoundsMaxAmount] = useState('');
    const [roundsBeforeMaxAmount, setRoundsBeforeMaxAmount] = useState('');
    const [uniqueCode, setUniqueCode] = useState('');
    const [rooms, setRooms] = useState([]);
    const [userId, setUserId] = useState(null);
    const [isRegisteredInGame, setIsRegisteredInGame] = useState(false);

    // Fetch user_id from AsyncStorage
    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const storedUserId = await AsyncStorage.getItem('user_id');
                if (storedUserId) {
                    setUserId(parseInt(storedUserId, 10));
                }
            } catch (error) {
                console.error('Error fetching user_id from AsyncStorage:', error);
            }
        };
        fetchUserId();
    }, []);

    const { data } = useQuery(CHECK_ACTIVE_GAME, {
        variables: { userId },
        skip: !userId,
        fetchPolicy: 'network-only',
    });

    useEffect(() => {
        if (data?.game_users?.data?.length) {
            const activeGame = data.game_users.data.find((gameUser) => gameUser.game.game_finished === 0);
            setIsRegisteredInGame(!!activeGame);
        } else {
            setIsRegisteredInGame(false);
        }
    }, [data]);

    const [createPrivateRoom, { loading: creatingRoom, error: createRoomError }] = useMutation(CREATE_PRIVATE_ROOM);
    const [registerInPrivateRoom, { loading: registeringRoom, error: registerRoomError }] = useMutation(REGISTER_IN_PRIVATE_ROOM);

    const handleCreateRoom = async () => {
        try {
            const { data } = await createPrivateRoom({
                variables: {
                    count: parseInt(count, 10),
                    rounds_max_amount: parseInt(roundsMaxAmount, 10),
                    rounds_before_max_amount: parseInt(roundsBeforeMaxAmount, 10),
                },
            });

            // Save uniq_code to AsyncStorage
            await AsyncStorage.setItem('active_game_uniq_code', data.createPrivateRoom.uniq_code);
            await AsyncStorage.setItem('active_game_id', data.createPrivateRoom.id);
            console.log(data.createPrivateRoom.id);


            // Reset the form
            setCount('');
            setRoundsMaxAmount('');
            setRoundsBeforeMaxAmount('');
            navigation.reset({
                index: 0,
                routes: [
                    { name: 'Game', params: { gameId: data.createPrivateRoom.id } },
                ],
            });
        } catch (err) {
            console.error('Error creating private room:', err);
            Alert.alert('Error', 'Failed to create a private room.');
        }
    };

    const handleJoinRoom = async () => {
        try {
            const { data } = await registerInPrivateRoom({
                variables: { uniq_code: uniqueCode },
            });

            // Save uniq_code to AsyncStorage
            await AsyncStorage.setItem('active_game_uniq_code', data.registerInPrivateRoom.uniq_code);
            await AsyncStorage.setItem('active_game_id', data.registerInPrivateRoom.id);

            // Reset the unique code input
            setUniqueCode('');
            navigation.reset({
                index: 0,
                routes: [
                    { name: 'Game', params: { gameId: data.registerInPrivateRoom.id } },
                ],
            });
        } catch (err) {
            console.error('Error joining private room:', err);
            Alert.alert('Error', 'Failed to join the private room. Check the code and try again.');
        }
    };

    return (
        <View style={styles.container}>
            {isRegisteredInGame ? (
                <Text style={styles.info}>You are already registered in a game.</Text>
            ) : (
                <>
                    <Text style={styles.title}>Create a Private Room</Text>
                    <TextInput
                        placeholder="Player Count"
                        value={count}
                        onChangeText={setCount}
                        keyboardType="numeric"
                        style={styles.input}
                        editable={!isRegisteredInGame}
                    />
                    <TextInput
                        placeholder="Max Rounds"
                        value={roundsMaxAmount}
                        onChangeText={setRoundsMaxAmount}
                        keyboardType="numeric"
                        style={styles.input}
                        editable={!isRegisteredInGame}
                    />
                    <TextInput
                        placeholder="Rounds Before Max Amount"
                        value={roundsBeforeMaxAmount}
                        onChangeText={setRoundsBeforeMaxAmount}
                        keyboardType="numeric"
                        style={styles.input}
                        editable={!isRegisteredInGame}
                    />
                    <Button
                        title={creatingRoom ? 'Creating...' : 'Create Room'}
                        onPress={handleCreateRoom}
                        disabled={creatingRoom || isRegisteredInGame}
                    />
                    {createRoomError && <Text style={styles.error}>Error: {createRoomError.message}</Text>}

                    <Text style={styles.title}>Join a Private Room</Text>
                    <TextInput
                        placeholder="Enter Unique Code"
                        value={uniqueCode}
                        onChangeText={setUniqueCode}
                        style={styles.input}
                        editable={!isRegisteredInGame}
                    />
                    <Button
                        title={registeringRoom ? 'Joining...' : 'Join Room'}
                        onPress={handleJoinRoom}
                        disabled={registeringRoom || isRegisteredInGame}
                    />
                    {registerRoomError && <Text style={styles.error}>Error: {registerRoomError.message}</Text>}
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
    input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
    error: { color: 'red', marginBottom: 10 },
    info: { fontSize: 16, color: 'blue', textAlign: 'center', marginBottom: 20 },
    subtitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20 },
    room: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
});

export default PrivateTablesScreen;
