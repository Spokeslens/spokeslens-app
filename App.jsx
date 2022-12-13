import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import axios from 'axios';
import { deleteItemAsync, getItemAsync, setItemAsync } from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { Dashboard, Splash } from './screens';
import { API_URL, GOOGLE_ID } from '@env';
import { useAuthRequest } from 'expo-auth-session/providers/google';
import { maybeCompleteAuthSession } from 'expo-web-browser';

maybeCompleteAuthSession();

// Stack navigator
const Drawer = createDrawerNavigator();

// Background clearing
const theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        background: 'white'
    }
}

export default function App() {
    let [user, setUser] = useState(undefined);

    // Google Auth
    const [request, response, promptAsync] = useAuthRequest({
        expoClientId: GOOGLE_ID,
        iosClientId: GOOGLE_ID,
        androidClientId: GOOGLE_ID,
        responseType: "id_token token",
        usePKCE: false,
        extraParams: { nonce: Math.floor(Math.random() * 16).toString(16) } // TODO - better hex generation
    });

    // Check previous login / start new login
    const loadUser = async () => {
        let saved = await getItemAsync("user"); // token saved in secure store?

        if (saved) getUserFromToken();
        else promptAsync();
    }

    // Refresh token with Google OAuth
    useEffect(() => { if (response) getAzureToken(response) }, [response]);

    const getAzureToken = async (google) => {
        let { accessToken: access_token, idToken: id_token } = google.authentication;
        let { data } = await axios.post(`${API_URL}/.auth/login/google`, { access_token, id_token });

        getUserFromToken(data.authenticationToken);
    }

    // Token verification and retrieve user info if valid
    const getUserFromToken = async (token) => {
        try {
            let { data } = await axios.get(`${API_URL}/supervisor`, { headers: { "X-ZUMO-AUTH": token } });
            await setItemAsync("user", token); // save for persistency
            setUser(data);
        } catch (error) {
            if (error.response.status === 401) {
                deleteItemAsync("user");
                promptAsync();
            }
            else alert("Unknown error occured"); // TODO - prettify
        }
    }

    if (!user) return <Splash cb={loadUser} />

    return (
        <NavigationContainer theme={theme}>
            <Drawer.Navigator screenOptions={{ headerShown: false }}>
                <Drawer.Screen name="Dashboard" component={Dashboard} />
            </Drawer.Navigator>
        </NavigationContainer>
    );
}