import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Button, Alert } from 'react-native';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GET_PUBLIC_ROOMS = gql`
  query GetPublicRooms($first: Int!, $page: Int) {
    public_rooms(first: $first, page: $page) {
      data {
        game {
          id
          users_count
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
        return <Text style={styles.info}>You are already registered in a game.</Text>;
    }

    const sortedData = data.public_rooms.data
        .filter(room => room.game_started === 0)
        .sort((a, b) => b.current_count - a.current_count);

    return (
        <FlatList
            style={styles.container}
            data={sortedData}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <TouchableOpacity style={styles.item} onPress={() => setSelectedRoom(item.id)}>
                    <Text>Game ID: {item.game.id}</Text>
                    <Text>Players: {item.current_count}/{item.count}</Text>
                    <Text>Created At: {item.room_created}</Text>
                    <Text>Rounds Before Max Amount: {item.game.rounds_before_max_amount}</Text>
                    <Text>Rounds Max Amount: {item.game.rounds_max_amount}</Text>
                    {selectedRoom === item.id && (
                        <View style={styles.detailsContainer}>
                            <Button title="Register" onPress={() => handleRegister(item.id)} />
                        </View>
                    )}
                </TouchableOpacity>
            )}
        />
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    item: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
    detailsContainer: { marginTop: 10, padding: 10, borderWidth: 1, borderColor: '#ccc' },
    info: { fontSize: 16, color: 'blue', textAlign: 'center', marginBottom: 20, top: 20 },
});

export default PublicTablesScreen;
