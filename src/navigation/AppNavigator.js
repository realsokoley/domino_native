import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useLazyQuery, gql } from '@apollo/client';
import LoginScreen from '../screens/LoginScreen';
import LobbyScreen from '../screens/LobbyScreen';
import RegistrationScreen from '../screens/RegistrationScreen';
import GameScreen from '../screens/GameScreen';
import GameRulesScreen from '../screens/GameRulesScreen';

const ME_QUERY = gql`
  query Me {
    me {
      id
      username
    }
  }
`;

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [getMe, { data, loading, error }] = useLazyQuery(ME_QUERY);

    useEffect(() => {
        const validateUser = async () => {
            const token = await AsyncStorage.getItem('token');

            if (!token) {
                setIsAuthenticated(false);
                return;
            }

            try {
                // Run the `me` query with the token as a Bearer token
                await getMe({
                    context: {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },
                });

                if (data?.me) {
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                }
            } catch (err) {
                console.error('Validation failed:', err);
                setIsAuthenticated(false);
            }
        };

        validateUser();
    }, [data, getMe]);

    if (isAuthenticated === null || loading) {
        // Optional: Add a loading spinner while validating the user
        return null;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="Lobby" component={LobbyScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegistrationScreen} />
                <Stack.Screen name="Game" component={GameScreen} />
                <Stack.Screen name="GameRules" component={GameRulesScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
