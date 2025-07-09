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
      <View style={{marginTop: spacing.xxl}}>
        <Text
          style={{
            fontSize: typography.fontSize.display,
            fontFamily: typography.fontFamily.bold,
            fontFamily: 'GeezaPro-Bold',
            marginLeft: 20,
          }}>
          You're one of a kind.
        </Text>
        <Text
          style={{
            fontSize: typography.fontSize.display,
            fontFamily: typography.fontFamily.bold,
            fontFamily: 'GeezaPro-Bold',
            marginLeft: 20,
            marginTop: spacing.md,
          }}>
          You're profile should be too.
        </Text>
      </View>

      <View>
        <LottieView
          source={require('../assets/love.json')}
          style={{
            height: 260,
            width: 300,
            alignSelf: 'center',
            marginTop: spacing.xxl,
            justifyContent: 'center',
          }}
          autoPlay
          loop={true}
          speed={0.7}
        />
      </View>

      <Pressable
      onPress={() => navigation.navigate("Name")}
        style={{backgroundColor: colors.primary, padding: 15, marginTop: 'auto'}}>
        <Text
          style={{
            textAlign: 'center',
            color: colors.textInverse,
            fontFamily: typography.fontFamily.semiBold,
            fontSize: typography.fontSize.md,
          }}>
          Enter basic Info
        </Text>
      </Pressable>
    </SafeAreaWrapper>
  );
};

export default BasicInfo;

const styles = StyleSheet.create({});
