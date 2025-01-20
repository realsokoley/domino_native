import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';

const GameRulesScreen = () => {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.header}>Dominotor Game Rules</Text>
                <Text style={styles.content}>
                    <Text style={styles.bold}>Objective:</Text> The main goal of Dominotor is to accumulate the highest score by accurately bidding and successfully taking tricks with dominoes.
                    {'\n\n'}
                    <Text style={styles.bold}>Number of Players:</Text> 2 to 4 players can participate in the game.
                    {'\n\n'}
                    <Text style={styles.bold}>Game Components:</Text> Dominos ranging from (0 0) to a maximum value, typically (6 6).
                    {'\n\n'}
                    <Text style={styles.bold}>Game Setup:</Text>
                    {'\n'}
                    <Text style={styles.bold}>Drawing Lots:</Text> At the start of the game, players draw lots to determine the initial order for bidding and playing.
                    {'\n'}
                    <Text style={styles.bold}>Domino Distribution:</Text> Players receive a varying number of dominoes in each round, beginning with one domino and increasing to the maximum number, then decreasing back to one.
                    {'\n\n'}
                    <Text style={styles.bold}>Gameplay:</Text>
                    {'\n'}
                    <Text style={styles.bold}>1. Bidding Phase:</Text>
                    {'\n'}
                    Each player predicts the number of tricks they will capture and places their bids accordingly.
                    {'\n'}
                    Bids cannot total the number of dominoes dealt for that round.
                    {'\n\n'}
                    <Text style={styles.bold}>2. Playing Phase:</Text>
                    {'\n'}
                    Players take turns placing their dominoes in a clockwise order, starting from the player who won the last trick or, in the first round, the player who drew the highest lot.
                    {'\n'}
                    The first player sets the tone for the trick, and subsequent players must follow with trumps if a trump is played.
                    {'\n\n'}
                    <Text style={styles.bold}>3. Winning Tricks:</Text>
                    {'\n'}
                    Tricks are won by the strongest domino based on the hierarchy of trumps and the sum of the numbers on non-trump dominoes.
                    {'\n'}
                    Trump hierarchy: (0 1) &gt; (0 0) &gt; (6 6) &gt; ... &gt; (1 1).
                    {'\n'}
                    Non-trumps: Won by the highest sum of numbers; ties are broken by play order.
                    {'\n\n'}
                    <Text style={styles.bold}>Scoring:</Text>
                    {'\n'}
                    Successful Bid: Points equal to the bid multiplied by 100.
                    {'\n'}
                    Excess Tricks: 10 points for each trick over the bid.
                    {'\n'}
                    Failed Bid: Loss of 100 points for each trick short of the bid.
                    {'\n'}
                    Zero Bid: 50 points if no tricks are taken.
                    {'\n\n'}
                    <Text style={styles.bold}>Game Progression:</Text>
                    {'\n'}
                    The game advances in a pyramid-like sequence of rounds, with the number of dominoes dealt first increasing to a peak, then decreasing.
                    {'\n\n'}
                    <Text style={styles.bold}>Winning the Game:</Text>
                    {'\n'}
                    After all rounds are complete, scores are tallied. The player with the highest total score wins the game.
                    {'\n\n'}
                    <Text style={styles.bold}>Example Scenario:</Text>
                    {'\n'}
                    In a round where three dominos are dealt to each of four players, let’s assume Player A bids 2 tricks, Player B bids 1, Player C bids 0, and Player D bids 2. If Player A captures exactly 2 tricks, they score 200 points. If Player C captures no tricks, they earn 50 points. If Player B captures more than 1 trick, they gain 10 points for each extra trick.
                </Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    section: { marginBottom: 20 },
    header: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    content: { fontSize: 16 },
    bold: { fontWeight: 'bold' },
});

export default GameRulesScreen;
