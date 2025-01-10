import React from 'react';
import { ApolloProvider } from '@apollo/client';
import client from './src/apollo/client'; // Create this file for Apollo Client setup
import AppNavigator from './src/navigation/AppNavigator'; // Create the navigation stack

const App: React.FC = () => {
  return (
      <ApolloProvider client={client}>
        <AppNavigator />
      </ApolloProvider>
  );
};

export default App;
