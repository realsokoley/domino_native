import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useMutation, gql } from '@apollo/client';

const REGISTER_MUTATION = gql`
  mutation Register($name: String!, $username: String!, $email: String!, $password: String!) {
    createUser(name: $name, username: $username, email: $email, password: $password) {
      id
      username
    }
  }
`;

const RegistrationScreen = ({ navigation }) => {
    const [form, setForm] = useState({ name: '', username: '', email: '', password: '' });
    const [register, { loading, error }] = useMutation(REGISTER_MUTATION);

    const handleRegister = async () => {
        try {
            await register({ variables: form });
            navigation.navigate('Login');
        } catch (err) {
            console.error('Registration failed', err);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Register</Text>
            <TextInput
                placeholder="Name"
                value={form.name}
                onChangeText={(value) => setForm({ ...form, name: value })}
                style={styles.input}
            />
            <TextInput
                placeholder="Username"
                value={form.username}
                onChangeText={(value) => setForm({ ...form, username: value })}
                style={styles.input}
            />
            <TextInput
                placeholder="Email"
                value={form.email}
                onChangeText={(value) => setForm({ ...form, email: value })}
                style={styles.input}
            />
            <TextInput
                placeholder="Password"
                value={form.password}
                onChangeText={(value) => setForm({ ...form, password: value })}
                style={styles.input}
                secureTextEntry
            />
            <Button title={loading ? 'Registering...' : 'Register'} onPress={handleRegister} />
            {error && <Text style={styles.error}>Registration failed</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
    input: { borderWidth: 1, padding: 10, marginBottom: 15, borderRadius: 5 },
    error: { color: 'red', textAlign: 'center', marginTop: 10 },
});

export default RegistrationScreen;
