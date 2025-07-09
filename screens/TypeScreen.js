import {StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  TouchableOpacity,
  Platform,
  StatusBar,} from 'react-native';
import React, {useState, useEffect} from 'react';
import { MaterialCommunityIcons, FontAwesome, AntDesign } from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import {
  getRegistrationProgress,
  saveRegistrationProgress,
} from '../registrationUtils';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import { colors, typography, shadows, borderRadius, spacing } from '../theme/colors';


const TypeScreen = () => {
  const [type, setType] = useState('');
  const [typeVisible, setTypeVisible] = useState(true);
  const [error, setError] = useState('');
  const navigation = useNavigation();
  useEffect(() => {
    getRegistrationProgress('Type').then(progressData => {
      if (progressData) {
        setType(progressData.type || '');
        setTypeVisible(progressData.typeVisible !== false); // Default to true if not set
      }
    });
  }, []);

  const handleNext = () => {
    if (type.trim() === '') {
      setError('Please select your sexuality.');
      return;
    }
    setError('');
    saveRegistrationProgress('Type', {type, typeVisible});
    navigation.navigate('Dating');
  };
  return (
    <SafeAreaWrapper backgroundColor="#fff" style={{flex: 1, backgroundColor: "#fff"}}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={styles.content}>
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
              color={colors.textPrimary}
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
          What's your sexuality?
        </Text>

        <Text style={{marginTop: spacing.xl, fontSize: typography.fontSize.md, color: colors.textSecondary}}>
          lashwa users are matched based on these three gender groups. You can
          add more about gender after
        </Text>

        <View style={{marginTop: spacing.xl, flexDirection: 'column', gap: 12}}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Text style={{fontFamily: typography.fontFamily.medium, fontSize: typography.fontSize.md}}>Straight</Text>
            <Pressable onPress={() => setType('Straight')}>
              <FontAwesome
                name="circle"
                size={26}
                color={type == 'Straight'  ? colors.primary : colors.backgroundSecondary}
              />
            </Pressable>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Text style={{fontFamily: typography.fontFamily.medium, fontSize: typography.fontSize.md}}>Gay</Text>
            <Pressable onPress={() => setType('Gay')}>
              <FontAwesome
                name="circle"
                size={26}
                color={type == 'Gay'  ? colors.primary : colors.backgroundSecondary}
              />
            </Pressable>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Text style={{fontFamily: typography.fontFamily.medium, fontSize: typography.fontSize.md}}>Lesbian</Text>
            <Pressable onPress={() => setType('Lesbian')}>
              <FontAwesome
                name="circle"
                size={26}
                color={type == 'Lesbian'  ? colors.primary : colors.backgroundSecondary}
              />
            </Pressable>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Text style={{fontFamily: typography.fontFamily.medium, fontSize: typography.fontSize.md}}>Bisexual</Text>
            <Pressable onPress={() => setType('Bisexual')}>
              <FontAwesome
                name="circle"
                size={26}
                color={type == 'Bisexual'  ? colors.primary : colors.backgroundSecondary}
              />
            </Pressable>
          </View>
        </View>

        <Pressable
          onPress={() => setTypeVisible(!typeVisible)}
          style={{
            marginTop: spacing.xl,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}>
          <AntDesign 
            name={typeVisible ? "checksquare" : "checksquareo"} 
            size={26} 
            color={typeVisible ? colors.primary : colors.textSecondary} 
          />
          <Text style={{
            fontSize: typography.fontSize.md,
            color: typeVisible ? colors.textPrimary : colors.textSecondary,
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
          <Text style={{ color: colors.error, marginTop: spacing.sm }}>{error}</Text>
        ) : null}
      </View>
    </SafeAreaWrapper>
  );
};

export default TypeScreen;

const styles = StyleSheet.create({
  content: {
    marginHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 20 : 20,
    flex: 1,
  },
});
