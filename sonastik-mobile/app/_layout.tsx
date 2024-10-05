import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Stack } from "expo-router";

// Initialize Apollo Client
const client = new ApolloClient({
  uri: "https://sonastik-ee-api.onrender.com/graphql",
  cache: new InMemoryCache()
})

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ApolloProvider client={client}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </ApolloProvider>
  );
}
