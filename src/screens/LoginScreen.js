import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, gql } from '@apollo/client';

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password)
  }
`;

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState(null);

    const [login, { loading, error }] = useMutation(LOGIN_MUTATION);

    const handleLogin = async () => {
        try {
            const { data } = await login({ variables: { email, password } });
            if (data?.login) {
                const parsedData = JSON.parse(data.login); // Parse the JSON string
                const token = parsedData.token;
                const userId = parsedData.user_id;

                // Save the token and user details to AsyncStorage
                await AsyncStorage.setItem('user', JSON.stringify(parsedData)); // Save entire object if needed
                await AsyncStorage.setItem('token', token);
                await AsyncStorage.setItem('user_id', userId.toString());
                console.log(userId);
                // Navigate to Lobby
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Lobby' }],
                });
            } else {
                setErrorMessage('Invalid login credentials. Please try again.');
            }
        } catch (err) {
            console.error('Login failed:', err);
            setErrorMessage('An error occurred during login. Please try again.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>
            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                secureTextEntry
            />
            <Button
                title={loading ? 'Logging in...' : 'Login'}
                onPress={handleLogin}
                disabled={loading}
            />
            {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
            {error && <Text style={styles.error}>GraphQL Error: {error.message}</Text>}
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.link}>Don't have an account? Register here</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
    input: { borderWidth: 1, padding: 10, marginBottom: 15, borderRadius: 5 },
    error: { color: 'red', marginTop: 10, textAlign: 'center' },
    link: { color: 'blue', textAlign: 'center', marginTop: 15 },
});

export default LoginScreen;
