import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Image,
} from 'react-native';
import React, {useEffect, useState, useCallback} from 'react';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {jwtDecode} from 'jwt-decode';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import { atob, btoa } from 'base-64';
import { fetchReceivedLikes } from '../services/api';
import { colors, typography, shadows, borderRadius, spacing } from '../theme/colors';

if (typeof global.atob === 'undefined') {
  global.atob = atob;
}
if (typeof global.btoa === 'undefined') {
  global.btoa = btoa;
}

const LikesScreen = () => {
  const navigation = useNavigation();
  const [option, setOption] = useState('Recent');
  const [userId, setUserId] = useState('');
  const [likes, setLikes] = useState([]);
  useEffect(() => {
    console.log('hi');
    const fetchUser = async () => {
      const token = await AsyncStorage.getItem('token');
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.userId;
      setUserId(userId);
    };

    fetchUser();
  }, []);
  const fetchReceivedLikesHandler = async () => {
    try {
      const response = await fetchReceivedLikes(userId);
      const receivedLikes = response.data.receivedLikes;
      console.log(receivedLikes); // Handle received likes in your frontend
      setLikes(receivedLikes);
    } catch (error) {
      console.error('Error fetching received likes:', error);
      // Handle error in the frontend
    }
  };

  useEffect(() => {
    if (userId) {
      fetchReceivedLikesHandler();
    }
  }, [userId]);
  useFocusEffect(
    useCallback(() => {
      if (userId) {
        fetchReceivedLikesHandler();
      }
    }, [userId]),
  );
  console.log('likes', likes.length);
  return (
    <ScrollView
      style={{marginTop: spacing.xxl, padding: 15, flex: 1, backgroundColor: '#FAF9F6'}}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <Text
          style={{
            fontSize: typography.fontSize.xxl,
            fontFamily: typography.fontFamily.bold,
            marginTop: spacing.md,
          }}>
          Likes You
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            backgroundColor: '#008B8B',
            padding: 10,
            borderRadius: borderRadius.round,
          }}>
          <Ionicons name="flame" size={24} color="white" />
          <Text
            style={{textAlign: 'center', fontFamily: typography.fontFamily.bold, color: colors.textInverse}}>
            Boost
          </Text>
        </View>
      </View>

      <View
        style={{
          marginVertical: 20,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}>
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: borderRadius.xlarge,
            backgroundColor: '#D0D0D0',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Ionicons name="filter" size={22} color="black" />
        </View>
        <Pressable
          onPress={() => setOption('Recent')}
          style={{
            borderColor: option == 'Recent' ? 'transparent' : '#808080',
            borderWidth: 0.7,
            padding: 10,
            borderRadius: borderRadius.xlarge,
            backgroundColor: option == 'Recent' ? colors.textPrimary : 'transparent',
          }}>
          <Text
            style={{
              textAlign: 'center',
              fontSize: typography.fontSize.sm,
              fontFamily: typography.fontFamily.regular,
              color: option == 'Recent' ? colors.textInverse : '#808080',
            }}>
            Recent
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setOption('your type')}
          style={{
            borderColor: option == 'your type' ? 'transparent' : '#808080',
            borderWidth: 0.7,
            padding: 10,
            borderRadius: borderRadius.xlarge,
            backgroundColor: option == 'your type' ? colors.textPrimary : 'transparent',
          }}>
          <Text
            style={{
              textAlign: 'center',
              fontSize: typography.fontSize.sm,
              fontFamily: typography.fontFamily.regular,
              color: option == 'your type' ? colors.textInverse : '#808080',
            }}>
            your type
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setOption('Last Active')}
          style={{
            borderColor: option == 'Last Active' ? 'transparent' : '#808080',
            borderWidth: 0.7,
            padding: 10,
            borderRadius: borderRadius.xlarge,
            backgroundColor: option == 'Last Active' ? colors.textPrimary : 'transparent',
            likes:likes?.length
          }}>
          <Text
            style={{
              textAlign: 'center',
              fontSize: typography.fontSize.sm,
              fontFamily: typography.fontFamily.regular,
              color: option == 'Last Active' ? colors.textInverse : '#808080',
            }}>
            Last Active
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setOption('Nearby')}
          style={{
            borderColor: option == 'Nearby' ? 'transparent' : '#808080',
            borderWidth: 0.7,
            padding: 10,
            borderRadius: borderRadius.xlarge,
            backgroundColor: option == 'Nearby' ? colors.textPrimary : 'transparent',
          }}>
          <Text
            style={{
              textAlign: 'center',
              fontSize: typography.fontSize.sm,
              fontFamily: typography.fontFamily.regular,
              color: option == 'Nearby' ? colors.textInverse : '#808080',
            }}>
            Nearby
          </Text>
        </Pressable>
      </View>

      <View>
        {likes.length > 0 && (
          <Pressable
            onPress={() =>
              navigation.navigate('HandleLike', {
                name: likes[0].userId?.firstName,
                image: likes[0].image,
                imageUrls: likes[0].userId?.imageUrls,
                prompts: likes[0].userId?.prompts,
                userId: userId,
                selectedUserId: likes[0].userId?._id,
                likes:likes?.length
              })
            }
            style={{
              padding: 20,
              borderColor: '#E0E0E0',
              borderWidth: 1,
              borderRadius: borderRadius.small,
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                paddingHorizontal: spacing.md,
                paddingVertical: 12,
                backgroundColor: '#f0f0f0',
                borderRadius: borderRadius.small,
                marginBottom: spacing.sm,
                width: 145,
              }}>
              <View />
              <View>
                <Text>Liked your photo</Text>
              </View>
            </View>
            <Text style={{fontSize: typography.fontSize.xxl, fontFamily: typography.fontFamily.bold}}>
              {likes[0].userId?.firstName}
            </Text>
            <Image
              source={{uri: likes[0].userId?.imageUrls[0]}}
              style={{
                width: '100%',
                height: 350,
                resizeMode: 'cover',
                borderRadius: borderRadius.medium,
                marginTop: spacing.lg,
              }}
            />
          </Pressable>
        )}
      </View>

      <Text
        style={{
          fontSize: typography.fontSize.xl,
          fontFamily: typography.fontFamily.bold,
          fontFamily: 'GeezaPro-Bold',
          marginTop: spacing.lg,
        }}>
        Up Next
      </Text>
      <View
        style={{
          width: '100%',
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 20,
        }}>
        {likes.slice(1).map((like, index) => (
          <View style={{marginVertical: 10, backgroundColor: colors.textInverse}}>
            <View style={{padding: 12}}>
              {like.comment ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    paddingHorizontal: spacing.md,
                    paddingVertical: 12,
                    backgroundColor: '#F5F3C6',
                    borderRadius: borderRadius.small,
                    marginBottom: spacing.sm,
                    width: 145,
                  }}>
                  <View />
                  <View>
                    <Text>{like?.comment}</Text>
                  </View>
                </View>
              ) : (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    paddingHorizontal: spacing.md,
                    paddingVertical: 12,
                    backgroundColor: '#f0f0f0',
                    borderRadius: borderRadius.small,
                    marginBottom: spacing.sm,
                    width: 145,
                  }}>
                  <View />
                  <View>
                    <Text>Liked your photo</Text>
                  </View>
                </View>
              )}

              <Text style={{fontSize: typography.fontSize.lg, fontFamily: typography.fontFamily.medium}}>
                {like?.userId?.firstName}
              </Text>
            </View>

            <View style={{width: '100%'}}>
              <Image
                key={index}
                source={{uri: like.userId?.imageUrls[0]}}
                style={{height: 220, width: 180, borderRadius: borderRadius.small}}
              />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default LikesScreen;

const styles = StyleSheet.create({});
