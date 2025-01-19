import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { gql, useMutation, useQuery } from '@apollo/client';

const ROUND_GENERATOR = gql`
  mutation RoundGenerator($gameRoundId: Int!) {
    roundGenerator(game_round_id: $gameRoundId) {
      id
      round {
        id
      }
    }
  }
`;

const GET_GAME_USER_ROUND = gql`
  query GetGameUserRound($gameUserId: Int!, $gameRoundId: Int!) {
    game_user_round(game_user_id: $gameUserId, game_round_id: $gameRoundId) {
      id
      bones_start
      bones_left
      turn
      game_user {
        id
      }
    }
  }
`;

const RoundPreparation = ({ key, currentGameUserId, gameRoundId, onPreparationComplete, isActiveRound }) => {
    const [roundData, setRoundData] = useState(null);

    const { data: gameUserRoundData, loading: gameUserRoundLoading, error: gameUserRoundError } = useQuery(GET_GAME_USER_ROUND, {
        variables: { gameRoundId: gameRoundId, gameUserId: currentGameUserId },
        skip: !gameRoundId || !isActiveRound,
        pollInterval: 2000,
        fetchPolicy: 'network-only',
    });

    const [generateRound, { loading: roundGeneratingLoading, error: roundGeneratingError }] = useMutation(ROUND_GENERATOR);

    useEffect(() => {
        const firstGameUserRound = gameUserRoundData?.game_user_round[0];
        console.log(firstGameUserRound);
        if (gameRoundId && isActiveRound && firstGameUserRound && firstGameUserRound.bones_start === null) {
            generateRound({ variables: { gameRoundId } });
        }
    }, [gameRoundId, generateRound, isActiveRound, gameUserRoundData]);

    // Update local state when data is fetched
    useEffect(() => {
        const firstGameUserRound = gameUserRoundData?.game_user_round[0];
        if (firstGameUserRound) {
            setRoundData(firstGameUserRound);
            onPreparationComplete(firstGameUserRound);
        }
    }, [gameUserRoundData, onPreparationComplete]);

    // Handle loading and error states
    if (roundGeneratingLoading || gameUserRoundLoading) return <Text style={{marginTop: -100}}>Loading...</Text>;
    if (roundGeneratingError || gameUserRoundError) return <Text>Error preparing round: {roundGeneratingError?.message || gameUserRoundError?.message}</Text>;

    return (
        <View style={styles.container}>
            <Text>Round prepared</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        top: -100,
    }
});

export default RoundPreparation;
