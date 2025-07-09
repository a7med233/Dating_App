import {StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  TouchableOpacity,} from 'react-native';
import React, {useState,useEffect} from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {useNavigation} from '@react-navigation/native';
import { getRegistrationProgress, saveRegistrationProgress } from '../registrationUtils';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import { colors, typography, shadows, borderRadius, spacing } from '../theme/colors';

const GenderScreen = () => {
  const [gender, setGender] = useState('');
  const [genderVisible, setGenderVisible] = useState(true);
  const [error, setError] = useState('');
  const navigation = useNavigation();
  useEffect(() => {
    getRegistrationProgress('Gender').then((progressData) => {
      if (progressData) {
        setGender(progressData.gender || '');
        setGenderVisible(progressData.genderVisible !== false); // Default to true if not set
      }
    });
  }, []);

  const handleNext = () => {
    if (gender.trim() === '') {
      setError('Please select your gender.');
      return;
    }
    setError('');
    saveRegistrationProgress('Gender', { gender, genderVisible });
    navigation.navigate('Type');
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
            <MaterialCommunityIcons
              name="cake-variant-outline"
              size={26}
              color="black"
            />
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
          Which gender descibes you the best?
        </Text>

        <Text style={{marginTop: spacing.xl, fontSize: typography.fontSize.md, color: 'gray'}}>
          lashwa users are matched based on these three gender groups. You can
          add more about gender after
        </Text>

        <View style={{marginTop: spacing.xl}}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Text style={{fontFamily: typography.fontFamily.medium, fontSize: typography.fontSize.md}}>Men</Text>
            <Pressable onPress={() => setGender('Men')}>
              <FontAwesome
                name="circle"
                size={26}
                color={gender == 'Men' ? colors.primary : colors.backgroundSecondary}
              />
            </Pressable>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginVertical: 12,
            }}>
            <Text style={{fontFamily: typography.fontFamily.medium, fontSize: typography.fontSize.md}}>Women</Text>
            <Pressable onPress={() => setGender('Women')}>
              <FontAwesome
                name="circle"
                size={26}
                color={gender == 'Women' ? colors.primary : colors.backgroundSecondary}
              />
            </Pressable>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Text style={{fontFamily: typography.fontFamily.medium, fontSize: typography.fontSize.md}}>Non-binary</Text>
            <Pressable onPress={() => setGender('Non-binary')}>
              <FontAwesome
                name="circle"
                size={26}
                color={gender == 'Non-binary' ? colors.primary : colors.backgroundSecondary}
              />
            </Pressable>
          </View>
        </View>

        <Pressable
          onPress={() => setGenderVisible(!genderVisible)}
          style={{
            marginTop: spacing.xl,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}>
          <AntDesign 
            name={genderVisible ? "checksquare" : "checksquareo"} 
            size={26} 
            color={genderVisible ? colors.primary : colors.textSecondary} 
          />
          <Text style={{
            fontSize: typography.fontSize.md,
            color: genderVisible ? colors.textPrimary : colors.textSecondary,
          }}>
            Visible on profile
          </Text>
        </Pressable>
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.8}
          style={{marginTop: spacing.xl, marginLeft: 'auto'}}>
          <MaterialCommunityIcons
            name="arrow-right-circle"
            size={45}
            color={colors.primary}
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

export default GenderScreen;

const styles = StyleSheet.create({});
