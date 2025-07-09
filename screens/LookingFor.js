import {StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Pressable} from 'react-native';
import React ,{useState,useEffect} from 'react';
import { MaterialCommunityIcons, FontAwesome, AntDesign } from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import { getRegistrationProgress, saveRegistrationProgress } from '../registrationUtils';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import { colors, typography, shadows, borderRadius, spacing } from '../theme/colors';

const LookingFor = () => {
    const [lookingFor,setLookingFor] = useState([]);
    const navigation = useNavigation();
    const [error, setError] = useState('');
    useEffect(() => {
        getRegistrationProgress('LookingFor').then(progressData => {
          if (progressData) {
            setLookingFor(progressData.lookingFor || '');
          }
        });
      }, []);
    
      const handleNext = () => {
        if (!lookingFor || lookingFor.trim() === '') {
          setError('Please select your dating intention.');
          return;
        }
        setError('');
        saveRegistrationProgress('LookingFor', {lookingFor});
        navigation.navigate('Hometown');
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
          What's your dating intention?
        </Text>



        <View style={{marginTop: spacing.xl, flexDirection: 'column', gap: 12}}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Text style={{fontFamily: typography.fontFamily.medium, fontSize: typography.fontSize.md}}>Life Partner</Text>
            <Pressable onPress={() => setLookingFor('Life Partner')}>
              <FontAwesome
                name="circle"
                size={26}
                color={lookingFor == "Life Partner"  ? colors.primary : colors.backgroundSecondary}
              />
            </Pressable>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Text style={{fontFamily: typography.fontFamily.medium, fontSize: typography.fontSize.md}}>Long-term relationship</Text>
            <Pressable onPress={() => setLookingFor('Long-term relationship')}>
              <FontAwesome
                name="circle"
                size={26}
                color={lookingFor == "Long-term relationship"  ? colors.primary : colors.backgroundSecondary}
              />
            </Pressable>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Text style={{fontFamily: typography.fontFamily.medium, fontSize: typography.fontSize.md}}>Long-term relationship open to short</Text>
            <Pressable onPress={() => setLookingFor('Long-term relationship open to short')}>
              <FontAwesome
                name="circle"
                size={26}
                color={lookingFor == "Long-term relationship open to short"  ? colors.primary : colors.backgroundSecondary}
              />
            </Pressable>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Text style={{fontFamily: typography.fontFamily.medium, fontSize: typography.fontSize.md}}>Short-term relationship open to long</Text>
            <Pressable onPress={() => setLookingFor('Short-term relationship open to long')}>
              <FontAwesome
                name="circle"
                size={26}
                color={lookingFor == "Short-term relationship open to long"  ? colors.primary : colors.backgroundSecondary}
              />
            </Pressable>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Text style={{fontFamily: typography.fontFamily.medium, fontSize: typography.fontSize.md}}>Short-term relationship</Text>
            <Pressable onPress={() => setLookingFor('Short-term relationship')}>
              <FontAwesome
                name="circle"
                size={26}
                color={lookingFor == "Short-term relationship"  ? colors.primary : colors.backgroundSecondary}
              />
            </Pressable>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Text style={{fontFamily: typography.fontFamily.medium, fontSize: typography.fontSize.md}}>Figuring out my dating goals</Text>
            <Pressable onPress={() => setLookingFor('Figuring out my dating goals')}>
              <FontAwesome
                name="circle"
                size={26}
                color={lookingFor == "Figuring out my dating goals"  ? colors.primary : colors.backgroundSecondary}
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

export default LookingFor;

const styles = StyleSheet.create({});
