import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, SafeAreaView, Text, TouchableOpacity, View, Alert } from "react-native";
import http from "../lib/http";
import styles from '../styles/patients.scss';
import { animated, config, useSpring } from '@react-spring/native';

export default function Patients() {
    // TODO - session persistency
    let [patients, setPatients] = useState(undefined);

    useEffect(() => { loadPatients() }, []);

    const loadPatients = async () => {
        let p = await http.axios({
            method: "get",
            url: "/supervisor/patient"
        });

        setPatients(p.data);
    }

    const addPatient = () => {
        Alert.prompt("New patient", 'Please enter their name', async (name) => {
            try {
                setPatients(undefined);

                await http.axios({ // TODO - set requirement on backend for name
                    method: "post",
                    url: "/supervisor/patient",
                    data: { name }
                });

                loadPatients();
            } catch (error) {
                alert("Unknown error occured"); // TODO - prettify
            }
        });
    }

    let blinkAnim = useSpring({
        from: { opacity: 0 },
        to: { opacity: 1 },
        loop: { reverse: true },
        config: {
            duration: 300,
        }
    });

    return (
        <SafeAreaView >
            <StatusBar style="auto" />

            {patients ? (
                <View>
                    {patients.map((v, i) => (
                        <View key={i} style={styles.box}>
                            <Image style={styles.pre} source={require("../assets/icon.png")} />

                            <View style={styles.border} />

                            <View style={styles.info}>
                                <Text style={styles.t}>{v.name} | {v.device ?? "(Vacant)"}</Text>
                                {v.device ? (
                                    <View style={styles.alert}>
                                        <animated.Image style={{ ...styles.icon, ...blinkAnim, display: v.state === "help" ? "flex" : "none" }} source={require("../assets/notify.png")} />

                                        <animated.Image style={{ ...styles.icon, ...blinkAnim, display: v.state === "emergency" ? "flex" : "none" }} source={require("../assets/emergency.png")} />
                                    </View>
                                ) : <Text style={styles.tt}>{v.code}</Text>}
                            </View>

                            <View style={styles.opts}>
                                <TouchableOpacity><Image style={styles.icon} source={require("../assets/trash.png")} /></TouchableOpacity>
                            </View>
                        </View>
                    ))}

                    <TouchableOpacity style={patients.length === 0 ? styles.new : styles.old} onPress={addPatient}>
                        <Image style={styles.plus} source={require("../assets/plus.png")} />
                        {patients.length === 0 ? <Text style={styles.txt}>Add New...</Text> : undefined}
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.center}>
                    <ActivityIndicator />
                </View>
            )}
        </SafeAreaView>
    );
}