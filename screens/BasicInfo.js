import {
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
} from 'react-native';
import React ,{useEffect} from 'react';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios"
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import { colors, typography, shadows, borderRadius, spacing } from '../theme/colors';


const BasicInfo = () => {
    const navigation = useNavigation();

  return (
    <SafeAreaWrapper backgroundColor="#fff" style={{flex: 1, backgroundColor: "#fff"}}>
      <View style={styles.container}>
        <Text style={styles.title}>
          You're one of a kind.
        </Text>
        <Text style={styles.subtitle}>
          You're profile should be too.
        </Text>
      </View>

      <View style={styles.animationContainer}>
        <LottieView
          source={require('../assets/love.json')}
          style={styles.animation}
          autoPlay
          loop={true}
          speed={0.7}
        />
      </View>

      <Pressable
      onPress={() => navigation.navigate("Name")}
        style={styles.button}>
        <Text style={styles.buttonText}>
          Enter basic Info
        </Text>
      </Pressable>
    </SafeAreaWrapper>
  );
};

export default BasicInfo;

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xxl,
  },
  title: {
    fontSize: typography.fontSize.display,
    fontFamily: typography.fontFamily.bold,
    fontWeight: typography.fontWeight.bold,
    marginLeft: 20,
  },
  subtitle: {
    fontSize: typography.fontSize.display,
    fontFamily: typography.fontFamily.bold,
    fontWeight: typography.fontWeight.bold,
    marginLeft: 20,
    marginTop: spacing.md,
  },
  animationContainer: {
    flex: 1,
  },
  animation: {
    height: 260,
    width: 300,
    alignSelf: 'center',
    marginTop: spacing.xxl,
    justifyContent: 'center',
  },
  button: {
    backgroundColor: colors.primary,
    padding: 15,
    marginTop: 'auto',
  },
  buttonText: {
    textAlign: 'center',
    color: colors.textInverse,
    fontFamily: typography.fontFamily.semiBold,
    fontWeight: typography.fontWeight.semiBold,
    fontSize: typography.fontSize.md,
  },
});
