import {StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  TouchableOpacity,} from 'react-native';
import React, {useState, useEffect} from 'react';
import { MaterialCommunityIcons, FontAwesome, AntDesign } from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import {
  getRegistrationProgress,
  saveRegistrationProgress,
} from '../registrationUtils';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import { colors, typography, shadows, borderRadius, spacing } from '../theme/colors';

const DatingType = () => {
  const [datingPreferences, setDatingPreferences] = useState([]);
  const [error, setError] = useState('');
  const chooseOption = option => {
    if (datingPreferences.includes(option)) {
      setDatingPreferences(
        datingPreferences.filter(selectedOption => selectedOption !== option),
      );
    } else {
      setDatingPreferences([...datingPreferences, option]);
    }
  };
  const navigation = useNavigation();
  useEffect(() => {
    // Fetch the registration progress data for the "Dating" screen
    getRegistrationProgress('Dating').then(progressData => {
      if (progressData) {
        setDatingPreferences(progressData.datingPreferences || []);
      }
    });
  }, []);

  const handleNext = () => {
    if (datingPreferences.length === 0) {
      setError('Please select at least one option.');
      return;
    }
    setError('');
    saveRegistrationProgress('Dating', {datingPreferences});
    navigation.navigate('LookingFor');
  };
  return (
    <SafeAreaWrapper backgroundColor="#fff" style={{flex: 1, backgroundColor: "#fff"}}>
      <View style={{marginTop: spacing.xxl, marginHorizontal: 20}}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: borderRadius.xlarge,
              borderColor: colors.textPrimary,
              borderWidth: 2,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <AntDesign name="hearto" size={22} color="black" />
          </View>
          <Image
            style={{width: 100, height: 40}}
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/128/10613/10613685.png',
            }}
          />
        </View>
        <Text
          style={{
            fontSize: typography.fontSize.xxxl,
            fontFamily: typography.fontFamily.bold,
            fontFamily: 'GeezaPro-Bold',
            marginTop: spacing.md,
          }}>
          Who do you want to date?
        </Text>

        <Text style={{marginTop: spacing.xl, fontSize: typography.fontSize.md, color: 'gray'}}>
          Select all the people you're open to meeting
        </Text>

        <View style={{marginTop: spacing.xl, flexDirection: 'column', gap: 12}}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Text style={{fontFamily: typography.fontFamily.medium, fontSize: typography.fontSize.md}}>Men</Text>
            <Pressable onPress={() => chooseOption('Men')}>
              <FontAwesome
                name="circle"
                size={26}
                color={
                  datingPreferences.includes('Men') ? colors.primary : colors.backgroundSecondary
                }
              />
            </Pressable>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Text style={{fontFamily: typography.fontFamily.medium, fontSize: typography.fontSize.md}}>Women</Text>
            <Pressable onPress={() => chooseOption('Women')}>
              <FontAwesome
                name="circle"
                size={26}
                color={
                  datingPreferences.includes('Women') ? colors.primary : colors.backgroundSecondary
                }
              />
            </Pressable>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Text style={{fontFamily: typography.fontFamily.medium, fontSize: typography.fontSize.md}}>Everyone</Text>
            <Pressable onPress={() => chooseOption('Everyone')}>
              <FontAwesome
                name="circle"
                size={26}
                color={
                  datingPreferences.includes('Everyone') ? colors.primary : colors.backgroundSecondary
                }
              />
            </Pressable>
          </View>
        </View>

        <View
          style={{
            marginTop: spacing.xl,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}>
          <AntDesign name="checksquare" size={26} color="colors.primary" />
          <Text style={{fontSize: typography.fontSize.md}}>Visible on profile</Text>
        </View>
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.8}
          style={{marginTop: spacing.xl, marginLeft: 'auto'}}>
          <MaterialCommunityIcons
            name="arrow-right-circle"
            size={45}
            color="colors.primary"
            style={{alignSelf: 'center', marginTop: spacing.lg}}
          />
        </TouchableOpacity>
        {error ? (
          <Text style={{ color: 'red', marginTop: spacing.sm }}>{error}</Text>
        ) : null}
      </View>
    </SafeAreaWrapper>
  );
};

export default DatingType;

const styles = StyleSheet.create({});
