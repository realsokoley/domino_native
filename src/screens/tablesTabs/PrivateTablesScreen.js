import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TextInput } from 'react-native';
import Slider from '@react-native-community/slider';
import { useMutation, gql, useQuery } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Button as ElementsButton } from 'react-native-elements';

const CREATE_PRIVATE_ROOM = gql`
  mutation CreatePrivateRoom($count: Int!, $rounds_max_amount: Int!, $rounds_before_max_amount: Int!) {
    createPrivateRoom(
      count: $count
      rounds_max_amount: $rounds_max_amount
      rounds_before_max_amount: $rounds_before_max_amount
    ) {
      id
      game_id
      uniq_code
      count
    }
  }
`;

const REGISTER_IN_PRIVATE_ROOM = gql`
  mutation RegisterInPrivateRoom($uniq_code: String!) {
    registerInPrivateRoom(uniq_code: $uniq_code) {
      id
      game_id
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
    const [count, setCount] = useState(2);
    const [roundsMaxAmount, setRoundsMaxAmount] = useState(4);
    const [roundsBeforeMaxAmount, setRoundsBeforeMaxAmount] = useState(4);
    const [uniqueCode, setUniqueCode] = useState('');
    const [userId, setUserId] = useState(null);
    const [isRegisteredInGame, setIsRegisteredInGame] = useState(false);

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
                    count,
                    rounds_max_amount: roundsMaxAmount,
                    rounds_before_max_amount: roundsBeforeMaxAmount,
                },
            });

            await AsyncStorage.setItem('active_game_uniq_code', data.createPrivateRoom.uniq_code);
            await AsyncStorage.setItem('active_game_id', data.createPrivateRoom.game_id.toString());

            setCount(2);
            setRoundsMaxAmount(4);
            setRoundsBeforeMaxAmount(4);
            navigation.reset({
                index: 0,
                routes: [
                    { name: 'Game', params: { gameId: data.createPrivateRoom.game_id.toString() } },
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

            await AsyncStorage.setItem('active_game_uniq_code', data.registerInPrivateRoom.uniq_code);
            await AsyncStorage.setItem('active_game_id', data.registerInPrivateRoom.game_id.toString());

            setUniqueCode('');
            navigation.reset({
                index: 0,
                routes: [
                    { name: 'Game', params: { gameId: data.registerInPrivateRoom.game_id.toString() } },
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
                    <Text>Players Count: {count}</Text>
                    <Slider
                        minimumValue={2}
                        maximumValue={4}
                        step={1}
                        value={count}
                        onValueChange={setCount}
                        style={styles.slider}
                    />
                    <Text>Highest Domino Value: {roundsBeforeMaxAmount}</Text>
                    <Slider
                        minimumValue={4}
                        maximumValue={12}
                        step={1}
                        value={roundsBeforeMaxAmount}
                        onValueChange={setRoundsBeforeMaxAmount}
                        style={styles.slider}
                    />
                    <Text>Middle Game Rounds Amount: {roundsMaxAmount}</Text>
                    <Slider
                        minimumValue={2}
                        maximumValue={6}
                        step={1}
                        value={roundsMaxAmount}
                        onValueChange={setRoundsMaxAmount}
                        style={[styles.slider, {marginBottom: 10}]}
                    />
                    <ElementsButton
                        title={creatingRoom ? 'Creating...' : 'Create Room'}
                        onPress={handleCreateRoom}
                        disabled={creatingRoom || isRegisteredInGame}
                        buttonStyle={styles.button}
                        titleStyle={styles.buttonTitle}
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
                    <ElementsButton
                        title={registeringRoom ? 'Joining...' : 'Join Room'}
                        onPress={handleJoinRoom}
                        disabled={registeringRoom || isRegisteredInGame}
                        buttonStyle={styles.button}
                        titleStyle={styles.buttonTitle}
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
    slider: { width: '100%', height: 40, marginBottom: 20 },
    input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
    error: { color: 'red', marginBottom: 10 },
    info: { fontSize: 16, color: '#000', textAlign: 'center', marginBottom: 20 },
    button: {
        padding: 10,
        marginBottom: 30,
    },
    buttonTitle: {
        fontSize: 18,
    },
});

export default PrivateTablesScreen;
