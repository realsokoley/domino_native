import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { useQuery, gql } from '@apollo/client';
import RenderHTML from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';

const INFO_BLOCK_QUERY = gql`
  query InfoBlock($id: ID!) {
    infoBlock(id: $id) {
      id
      title
      content
      block_id
      enabled
    }
  }
`;

const InfoBlockDetailScreen = ({ route }) => {
    const { blockId } = route.params;
    const { data, loading, error } = useQuery(INFO_BLOCK_QUERY, {
        variables: { id: blockId },
    });
    const { width } = useWindowDimensions();

    if (loading) return <Text>Loading...</Text>;
    if (error) return <Text>Error: {error.message}</Text>;

    const { title, content } = data.infoBlock;

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>{title}</Text>
            <RenderHTML contentWidth={width} source={{ html: content }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
});

export default InfoBlockDetailScreen;
