import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery, gql } from '@apollo/client';
import RenderHTML from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';
import { Button } from 'react-native-elements';

const INFO_BLOCKS_QUERY = gql`
  query InfoBlocks($first: Int!, $page: Int) {
    infoBlocks(first: $first, page: $page) {
      data {
        id
        title
        content
        block_id
        enabled
      }
    }
  }
`;

const InformationScreen = () => {
    const navigation = useNavigation();
    const { data, loading, error } = useQuery(INFO_BLOCKS_QUERY, {
        variables: { first: 10, page: 1 },
    });
    const [infoBlocks, setInfoBlocks] = useState([]);
    const { width } = useWindowDimensions();

    useEffect(() => {
        if (data) {
            const enabledBlocks = data.infoBlocks.data.filter(block => block.enabled);
            setInfoBlocks(enabledBlocks);
        }
    }, [data]);

    if (loading) return <Text>Loading...</Text>;
    if (error) return <Text>Error: {error.message}</Text>;

    return (
        <ScrollView style={styles.container}>
            {infoBlocks.map(block => (
                <View key={block.id} style={styles.box}>
                    <Text style={styles.header}>{block.title}</Text>
                    <RenderHTML contentWidth={width} source={{ html: block.content.substring(0, 100) + '...' }} />
                    <View style={styles.buttonContainer}>
                        <Button
                            title="Read More"
                            onPress={() => navigation.navigate('InfoBlockDetail', { blockId: block.id })}
                            buttonStyle={styles.button}
                            titleStyle={styles.buttonTitle}
                        />
                    </View>
                </View>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    box: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        backgroundColor: '#f9f9f9',
    },
    header: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    buttonContainer: {
        alignItems: 'flex-start',
        marginTop: 10,
    },
    button: {
        padding: 5,
    },
    buttonTitle: {
        fontSize: 12,
    },
});

export default InformationScreen;
