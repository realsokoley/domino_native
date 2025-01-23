import React, { useEffect, useState } from 'react';
import { FlatList, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery, gql, useMutation } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { Button as ElementsButton } from 'react-native-elements';

const GET_PUBLIC_ROOMS = gql`
  query GetPublicRooms($first: Int!, $page: Int) {
    public_rooms(first: $first, page: $page) {
      data {
        game {
          id
          rounds_before_max_amount
          rounds_max_amount
          game_started
        }
        game_id
        id
        count
        current_count
        room_created
        game_started
      }
    }
  }
`;

const REGISTER_IN_PUBLIC_ROOM = gql`
  mutation RegisterInPublicRoom($id: Int!) {
    registerInPublicRoom(id: $id) {
      id
      game {
        id
        game_started
      }
    }
  }
`;

const PublicTablesScreen = () => {
    const navigation = useNavigation();
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [activeGameId, setActiveGameId] = useState(null);
    const { data, loading, error } = useQuery(GET_PUBLIC_ROOMS, {
        variables: { first: 25, page: 1 },
        fetchPolicy: 'network-only',
        pollInterval: 2000,
    });

    const [registerInPublicRoom, { loading: registering, error: registerError }] = useMutation(REGISTER_IN_PUBLIC_ROOM);

    useEffect(() => {
        const fetchActiveGameId = async () => {
            const storedGameId = await AsyncStorage.getItem('active_game_id');
            if (storedGameId) setActiveGameId(parseInt(storedGameId, 10));
        };
        fetchActiveGameId();
    }, []);

    const handleRegister = async (roomId) => {
        try {
            const { data } = await registerInPublicRoom({ variables: { id: parseInt(roomId, 10) } });
            await AsyncStorage.setItem('active_game_id', data.registerInPublicRoom.game.id.toString());
            await AsyncStorage.setItem('active_game_uniq_code', 'XXXPUB'); // Store the game code
            navigation.reset({
                index: 0,
                routes: [{ name: 'Game', params: { gameId: data.registerInPublicRoom.game.id } }],
            });
        } catch (err) {
            console.error('Error registering in public room:', err);
            Alert.alert('Error', 'Failed to register in the public room.');
        }
    };

    if (loading) return <Text>Loading...</Text>;
    if (error) return <Text>Error: {error.message}</Text>;

    if (activeGameId) {
        return (
            <View style={styles.container}>
                <Text style={styles.info}>You are already registered in a game.</Text>
            </View>
        );
    }

    const sortedData = data.public_rooms.data
        .filter(room => room.game_started === 0)
        .sort((a, b) => b.current_count - a.current_count);

    return (
        <FlatList
            style={styles.container}
            data={sortedData}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
                <TouchableOpacity
                    style={[styles.item, { backgroundColor: index % 2 === 0 ? '#eee' : 'white' }]}
                    onPress={() => setSelectedRoom(item.id)}
                >
                    <Text>Game ID: {item.game.id}</Text>
                    <Text>Players: {item.current_count}/{item.count}</Text>
                    <Text>Highest Domino Value: {item.game.rounds_before_max_amount}</Text>
                    <Text>Mid Game Rounds Amount: {item.game.rounds_max_amount}</Text>
                    {selectedRoom === item.id && (
                        <ElementsButton
                            title="Register"
                            onPress={() => handleRegister(item.id)}
                            buttonStyle={styles.button}
                            titleStyle={styles.buttonTitle}
                        />
                    )}
                </TouchableOpacity>
            )}
        />
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    item: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
    detailsContainer: { marginTop: 10, padding: 10, borderWidth: 1, borderColor: '#eee' },
    info: { fontSize: 16, color: '#000', textAlign: 'center', marginBottom: 20 },
    button: {
        padding: 5,
        marginTop: 5,
    },
    buttonTitle: {
        fontSize: 14,
    },
});

export default PublicTablesScreen;
