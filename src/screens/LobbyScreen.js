import React, { useState, useEffect } from 'react';
import { Button, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import PrivateTablesScreen from './tablesTabs/PrivateTablesScreen';
import PublicTablesScreen from './tablesTabs/PublicTablesScreen';
import InformationScreen from './tablesTabs/InformationScreen';
import SettingsScreen from './tablesTabs/SettingsScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { gql, useQuery } from '@apollo/client';
import Icon from 'react-native-vector-icons/Ionicons';
import { Button as ElementsButton } from 'react-native-elements';

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

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const storedUserId = await AsyncStorage.getItem('user_id');
                if (storedUserId) {
                    setUserId(parseInt(storedUserId, 10));
                } else {
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'Login' }],
                    });
                }
            } catch (error) {
                console.error('Error fetching user_id from AsyncStorage:', error);
            }
        };
        fetchUserId();
    }, [navigation]);

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
                AsyncStorage.setItem('active_game_id', activeGame.game.id);
            } else {
                setIsInActiveGame(false);
                setActiveGameId(null);
            }
        } else {
            setIsInActiveGame(false);
            setActiveGameId(null);
        }
    }, [data]);

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
            <View style={styles.buttonRow}>
                <View style={styles.centerButton}>
                    {isInActiveGame && (
                        <ElementsButton
                            title="Back to Active Game"
                            onPress={handleBackToGame}
                            buttonStyle={styles.button}
                            titleStyle={styles.buttonTitle}
                        />
                    )}
                </View>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <Icon name="log-out-outline" size={25} color="black" />
                </TouchableOpacity>
            </View>
            <Tab.Navigator>
                <Tab.Screen
                    name="PrivateTables"
                    component={PrivateTablesScreen}
                    options={{
                        title: 'Private Tables',
                        tabBarIcon: ({ color, size }) => (
                            <Icon name="lock-closed-outline" color={color} size={size} />
                        ),
                    }}
                />
                <Tab.Screen
                    name="PublicTables"
                    component={PublicTablesScreen}
                    options={{
                        title: 'Public Tables',
                        tabBarIcon: ({ color, size }) => (
                            <Icon name="people-outline" color={color} size={size} />
                        ),
                    }}
                />
                <Tab.Screen
                    name="Information"
                    component={InformationScreen}
                    options={{
                        title: 'Information',
                        tabBarIcon: ({ color, size }) => (
                            <Icon name="information-circle-outline" color={color} size={size} />
                        ),
                    }}
                />
                <Tab.Screen
                    name="Settings"
                    component={SettingsScreen}
                    options={{
                        title: 'Game Settings',
                        tabBarIcon: ({ color, size }) => (
                            <Icon name="settings-outline" color={color} size={size} />
                        ),
                    }}
                />
            </Tab.Navigator>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between', // Distribute space between buttons
        alignItems: 'center',
        padding: 10,
    },
    centerButton: {
        flex: 1,
        alignItems: 'flex-start', // Align items to the start (left)
    },
    logoutButton: {
        marginLeft: 10,
    },
    button: {
        padding: 5,
    },
    buttonTitle: {
        fontSize: 12,
    },
});

export default LobbyScreen;
