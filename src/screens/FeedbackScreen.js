import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { useMutation, gql, useQuery } from '@apollo/client';
import { Button as ElementsButton } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CREATE_FEEDBACK = gql`
  mutation CreateFeedback($email: String!, $feedback: String!) {
    createFeedback(email: $email, feedback: $feedback) {
      id
      email
      feedback
    }
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

const FeedbackScreen = () => {
    const { data, loading, error } = useQuery(ME_QUERY);
    const [email, setEmail] = useState('');
    const [feedback, setFeedback] = useState('');
    const [createFeedback, { loading: submittingFeedback }] = useMutation(CREATE_FEEDBACK);

    useEffect(() => {
        if (data?.me?.username) {
            setEmail(data.me.username);
        }
    }, [data]);

    const handleSubmitFeedback = async () => {
        try {
            await createFeedback({ variables: { email, feedback } });
            Alert.alert('Success', 'Feedback submitted successfully');
            setFeedback('');
        } catch (error) {
            console.error('Error submitting feedback:', error);
            Alert.alert('Error', 'Failed to submit feedback');
        }
    };

    if (loading) return <Text>Loading...</Text>;
    if (error) return <Text>Error: {error.message}</Text>;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Feedback</Text>
            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                editable={false}
            />
            <TextInput
                placeholder="Your Feedback"
                value={feedback}
                onChangeText={setFeedback}
                style={[styles.input, styles.textArea]}
                multiline
            />
            <ElementsButton
                title={submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                onPress={handleSubmitFeedback}
                buttonStyle={styles.button}
                titleStyle={styles.buttonTitle}
                disabled={submittingFeedback}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    input: { borderWidth: 1, padding: 10, marginBottom: 20, borderRadius: 5 },
    textArea: { height: 100 },
    button: { padding: 10 },
    buttonTitle: { fontSize: 16 },
});

export default FeedbackScreen;
