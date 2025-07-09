import {StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  Pressable,} from 'react-native';
import React, {useState} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import PreFinalScreen from './PreFinalScreen';
import { likeProfile } from '../services/api';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import { colors, typography, shadows, borderRadius, spacing } from '../theme/colors';

const SendLikeScreen = () => {
  const route = useRoute();
  const [comment, setComment] = useState('');
  const navigation = useNavigation();
  const userId = route?.params?.userId;
  console.log(route.params?.userId);
  const likeProfileHandler = async () => {
    try {
      const response = await likeProfile({
        userId: route.params.userId,
        likedUserId: route.params.likedUserId,
        image: route?.params?.image,
        comment: comment,
      });
      if (response.status == 200) {
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error liking profile:', error);
    }
  };

  return (
    <SafeAreaWrapper backgroundColor={colors.background} style={{flex: 1, backgroundColor: '#FAF9F6'}}>
      <View
        style={{marginTop: 'auto', marginBottom: 'auto', marginHorizontal: 40}}>
        <Text style={{fontSize: typography.fontSize.xxl, fontFamily: typography.fontFamily.bold}}>
          {route?.params?.name}
        </Text>
        <Image
          style={{
            width: '100%',
            height: 350,
            resizeMode: 'cover',
            borderRadius: borderRadius.medium,
            marginTop: spacing.lg,
          }}
          source={{
            uri: route?.params?.image,
          }}
        />
        <TextInput
          value={comment}
          onChangeText={text => setComment(text)}
          placeholder="Add a comment"
          style={{
            padding: 15,
            backgroundColor: colors.textInverse,
            borderRadius: borderRadius.small,
            marginTop: spacing.md,
            fontSize: comment ? 17 : 17,
          }}
        />

        <View
          style={{
            marginVertical: 12,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#FFC0CB',
              paddingHorizontal: spacing.md,
              paddingVertical: 10,
              gap: 4,
              borderRadius: borderRadius.xlarge,
            }}>
            <Text>1</Text>
            <Ionicons name="rose-outline" size={22} color="black" />
          </View>
          <Pressable
            onPress={likeProfileHandler}
            style={{
              backgroundColor: '#FFFDD0',
              borderRadius: borderRadius.xlarge,
              padding: 10,
              flex: 1,
            }}>
            <Text style={{fontFamily: typography.fontFamily.bold, textAlign: 'center'}}>
              Send Like
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaWrapper>
  );
};

export default SendLikeScreen;

const styles = StyleSheet.create({});
