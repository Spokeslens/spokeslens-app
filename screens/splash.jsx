import { StatusBar } from "expo-status-bar";
import { Image, View } from "react-native";
import styles from '../styles/splash.scss';
import { Dimensions, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useSpring, animated, config } from "@react-spring/native";

const { width, height } = Dimensions.get('window');
const logoDim = Math.min(width, height);
const logoMax = 250;

export default function Splash({ cb }) {
    let [loading, setLoading] = useState(false);

    let fadeAnim = useSpring({
        from: { opacity: 0 },
        to: { opacity: 1 },
        delay: 100,
        config: config.molasses
    });

    let jumpAnim = useSpring({
        from: { marginTop: 100 },
        to: { marginTop: 0 },
        delay: 100,
        config: { friction: 10 },
        onRest: () => {
            setTimeout(() => {
                cb();
                setLoading(true);
            }, 1000);
        }
    })

    return (
        <View>
            <StatusBar hidden />

            <animated.View style={{ ...styles.container, ...fadeAnim, ...jumpAnim }}>
                <Image style={{ width: logoDim * 0.8, height: logoDim * 0.8, maxWidth: logoMax, maxHeight: logoMax }} source={require('../assets/splash.jpg')} />
                <ActivityIndicator animating={loading} />
            </animated.View>
        </View>
    );
}