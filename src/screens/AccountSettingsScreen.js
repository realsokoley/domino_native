import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, Modal, TouchableOpacity } from 'react-native';
import { useMutation, useQuery, gql } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button as ElementsButton } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';

const UPDATE_USERNAME = gql`
  mutation UpdateUsername($id: ID!, $newUsername: String!) {
    updateUsername(id: $id, newUsername: $newUsername) {
      id
      username
    }
  }
`;

const REMOVE_ACCOUNT = gql`
  mutation RemoveAccount($id: ID!) {
    removeAccount(id: $id)
  }
`;

const ME_QUERY = gql`
  query Me {
    me {
      id
      username
    }
  }
`;

const AccountSettingsScreen = () => {
    const navigation = useNavigation();
    const [newUsername, setNewUsername] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const { data, loading, error } = useQuery(ME_QUERY, {fetchPolicy: 'network-only'});
    const [updateUsername, { loading: updatingUsername }] = useMutation(UPDATE_USERNAME);
    const [removeAccount, { loading: removingAccount }] = useMutation(REMOVE_ACCOUNT);

    const userId = data?.me?.id;
    const username = data?.me?.username;

    const handleUpdateUsername = async () => {
        try {
            await updateUsername({ variables: { id: userId, newUsername } });
            Alert.alert('Success', 'Username updated successfully');
        } catch (error) {
            console.error('Error updating username:', error);
            Alert.alert('Error', 'Failed to update username');
        }
    };

    const handleRemoveAccount = async () => {
        try {
            await removeAccount({ variables: { id: userId } });
            await AsyncStorage.removeItem('user_id');
            await AsyncStorage.removeItem('token');
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            });
        } catch (error) {
            console.error('Error removing account:', error);
            Alert.alert('Error', 'Failed to remove account');
        }
    };

    if (loading) return <Text>Loading...</Text>;
    if (error) return <Text>Error: {error.message}</Text>;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Hello, {username}</Text>
            <TextInput
                placeholder="New Username"
                value={newUsername}
                onChangeText={setNewUsername}
                style={styles.input}
            />
            <ElementsButton
                title={updatingUsername ? 'Updating...' : 'Update Username'}
                onPress={handleUpdateUsername}
                buttonStyle={styles.button}
                titleStyle={styles.buttonTitle}
                disabled={updatingUsername}
            />
            <ElementsButton
                title="Remove Account"
                onPress={() => setModalVisible(true)}
                buttonStyle={[styles.button, { backgroundColor: 'red' }]}
                titleStyle={styles.buttonTitle}
                disabled={removingAccount}
            />
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Are you sure you want to remove your account?</Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonCancel]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonConfirm]}
                                onPress={handleRemoveAccount}
                            >
                                <Text style={styles.modalButtonText}>Confirm</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
    input: { borderWidth: 1, padding: 10, marginBottom: 20, borderRadius: 5 },
    button: { padding: 10, marginBottom: 30 },
    buttonTitle: { fontSize: 16 },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        width: 300,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    modalText: { fontSize: 18, marginBottom: 20 },
    modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
    modalButton: { padding: 10, borderRadius: 5, marginHorizontal: 10 },
    modalButtonCancel: { backgroundColor: 'gray' },
    modalButtonConfirm: { backgroundColor: 'red' },
    modalButtonText: { color: 'white', fontSize: 16 },
});

export default AccountSettingsScreen;
