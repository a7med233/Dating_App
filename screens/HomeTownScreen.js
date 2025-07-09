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
    <SafeAreaWrapper backgroundColor="#fff" style={{flex:1,backgroundColor:"#fff"}}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <AntDesign name="hearto" size={22} color={colors.textPrimary} />
          </View>
          <Image
            style={styles.logo}
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/128/10613/10613685.png',
            }}
          />
        </View>
        <Text style={styles.title}>
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
          style={styles.textInput}
          placeholder="HomeTown"
          placeholderTextColor={colors.textSecondary}
        />

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}

        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.8}
          style={styles.nextButton}>
          <MaterialCommunityIcons
            name="arrow-right-circle"
            size={45}
            color={colors.primary}
            style={styles.nextIcon}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaWrapper>
  )
}

export default HomeTownScreen

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xxl,
    marginHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.xlarge,
    borderColor: colors.textPrimary,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 40,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontFamily: typography.fontFamily.bold,
    fontWeight: typography.fontWeight.bold,
    marginTop: spacing.md,
  },
  textInput: {
    width: 340,
    marginVertical: 10,
    fontSize: 22,
    marginTop: spacing.xxl,
    borderBottomColor: colors.textPrimary,
    borderBottomWidth: 1,
    paddingBottom: 10,
    fontFamily: typography.fontFamily.bold,
    fontWeight: typography.fontWeight.bold,
  },
  errorText: {
    color: colors.error,
    marginTop: spacing.sm,
  },
  nextButton: {
    marginTop: spacing.xl,
    marginLeft: 'auto',
  },
  nextIcon: {
    alignSelf: 'center',
    marginTop: spacing.lg,
  },
})