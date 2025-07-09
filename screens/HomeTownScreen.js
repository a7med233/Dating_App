import { StyleSheet, Text, View,Pressable,TouchableOpacity,Image, TextInput } from 'react-native'
import { colors, typography, shadows, borderRadius, spacing } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import GradientButton from '../components/GradientButton';
import ThemedCard from '../components/ThemedCard';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import React ,{useState,useEffect} from 'react';
import { MaterialCommunityIcons, FontAwesome, AntDesign } from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import { getRegistrationProgress, saveRegistrationProgress } from '../registrationUtils';

const HomeTownScreen = () => {
    const [hometown,setHometown] = useState("");
    const [error, setError] = useState('');
    const navigation = useNavigation();
    useEffect(() => {
        getRegistrationProgress('Hometown').then(progressData => {
          if (progressData) {
            setHometown(progressData.hometown || '');
          }
        });
      }, []);
    
      const handleNext = () => {
        if (hometown.trim() === '') {
          setError('Please enter your hometown.');
          return;
        }
        setError('');
        saveRegistrationProgress('Hometown', {hometown});
        navigation.navigate('Photos');
      };
  return (
    <SafeAreaWrapper backgroundColor={colors.background} style={{flex:1,backgroundColor:"white"}}>
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
          Where's your home Town?
        </Text>

        <TextInput
          value={hometown}
          onChangeText={text => {
            setHometown(text);
            if (text.trim() === '') {
              setError('Please enter your hometown.');
            } else {
              setError('');
            }
          }}
          autoFocus={true}
          style={{
            width: 340,
            marginVertical: 10,
            fontSize: hometown ? 22 : 22,
            marginTop: spacing.xxl,
            borderBottomColor: colors.textPrimary,
            borderBottomWidth: 1,
            paddingBottom: 10,
            fontFamily: 'GeezaPro-Bold',
          }}
          placeholder="HomeTown"
          placeholderTextColor={'#BEBEBE'}
        />

        {error ? (
          <Text style={{ color: 'red', marginTop: spacing.sm }}>{error}</Text>
        ) : null}

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
      </View>
    </SafeAreaWrapper>
  )
}

export default HomeTownScreen

const styles = StyleSheet.create({})