import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import PrivateTablesScreen from './tablesTabs/PrivateTablesScreen';
import PublicTablesScreen from './tablesTabs/PublicTablesScreen';
import { Button, View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { gql, useQuery } from '@apollo/client';

const Tab = createBottomTabNavigator();

const CHECK_ACTIVE_GAME = gql`
  query CheckActiveGame($userId: Int!) {
    game_users(first: 1000, page: 1, user_id: $userId) {
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

const LobbyScreen = () => {
    const navigation = useNavigation();
    const [userId, setUserId] = useState(null);
    const [isInActiveGame, setIsInActiveGame] = useState(false);
    const [activeGameId, setActiveGameId] = useState(null);

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

    const { data, error, refetch } = useQuery(CHECK_ACTIVE_GAME, {
        variables: { userId },
        skip: !userId,
        fetchPolicy: 'network-only',
    });

    useEffect(() => {
        if (data?.game_users?.data?.length) {
            const activeGame = data.game_users.data.find((gameUser) => gameUser.game.game_finished == 0);
            if (activeGame) {
                setIsInActiveGame(true);
                setActiveGameId(activeGame.game.id);
            } else {
                setIsInActiveGame(false);
                setActiveGameId(null);
            }
        } else {
            setIsInActiveGame(false);
            setActiveGameId(null);
        }
    }, [data]);

    // Refetch data when the screen comes back into focus
    useFocusEffect(
        React.useCallback(() => {
            if (refetch) {
                refetch();
            }
        }, [refetch])
    );

    const handleLogout = async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user_id');
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
    };

    const handleBackToGame = () => {
        if (activeGameId) {
            navigation.reset({
                index: 0,
                routes: [{ name: 'Game', params: { gameId: activeGameId } }],
            });
        }
    };

    if (!userId) {
        return (
            <View style={styles.container}>
                <Text>Loading user information...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Text>Error loading game status: {error.message}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Button title="Logout" onPress={handleLogout} />
            {isInActiveGame && (
                <Button title="Back to Active Game" onPress={handleBackToGame} />
            )}
            <Tab.Navigator>
                <Tab.Screen
                    name="PrivateTables"
                    component={PrivateTablesScreen}
                    options={{ title: 'Private Tables' }}
                />
                <Tab.Screen
                    name="PublicTables"
                    component={PublicTablesScreen}
                    options={{ title: 'Public Tables' }}
                />
            </Tab.Navigator>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
});

export default LobbyScreen;
