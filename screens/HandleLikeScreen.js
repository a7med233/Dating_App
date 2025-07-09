import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  Pressable,
  Alert,
} from 'react-native';
import React from 'react';
import {useRoute} from '@react-navigation/native';
import { Entypo, AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import { createMatch } from '../services/api';
import { colors, typography, shadows, borderRadius, spacing } from '../theme/colors';

const HandleLikeScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  console.log(route?.params);
  const createMatchHandler = async () => {
    try {
      const currentUserId = route?.params?.userId;
      const selectedUserId = route?.params?.selectedUserId;
      const response = await createMatch({ currentUserId, selectedUserId });
      if (response.status === 200) {
        navigation.goBack();
      } else {
        console.error('Failed to create match');
      }
    } catch (error) {
      console.error('Error creating match:', error);
    }
  };
  const match = () => {
    Alert.alert('Accept Request?', `Match with ${route?.params?.name}`, [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: createMatchHandler},
    ]);
    // navigation.goBack()
  };
  return (
    <>
      <ScrollView
        style={{flex: 1, backgroundColor: colors.textInverse, marginTop: spacing.xxl, padding: 12}}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Text style={{textAlign: 'center', fontSize: typography.fontSize.md, fontFamily: typography.fontFamily.medium}}>
            All {route?.params?.likes}
          </Text>
          <Text style={{fontSize: typography.fontSize.md, fontFamily: typography.fontFamily.medium}}>Back</Text>
        </View>

        <View style={{marginVertical: 12}}>
          <Image
            style={{
              width: '100%',
              height: 100,
              borderRadius: borderRadius.small,
              resizeMode: 'cover',
            }}
            source={{uri: route?.params.image}}
          />
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
              position: 'absolute',
              bottom: -22,
            }}>
            <View />
            <View>
              <Text>Liked your photo</Text>
            </View>
          </View>
        </View>

        <View style={{marginVertical: 25}}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
              }}>
              <Text style={{fontSize: typography.fontSize.xxl, fontFamily: typography.fontFamily.bold}}>
                {route?.params?.name}
              </Text>
              <View
                style={{
                  backgroundColor: '#452c63',
                  paddingHorizontal: spacing.md,
                  paddingVertical: 4,
                  borderRadius: borderRadius.xlarge,
                }}>
                <Text style={{textAlign: 'center', color: colors.textInverse}}>
                  new here
                </Text>
              </View>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 15,
              }}>
              <Entypo name="dots-three-horizontal" size={22} color="black" />
            </View>
          </View>

          <View style={{marginVertical: 15}}>
            <View>
              {route?.params?.imageUrls?.length > 0 && (
                <View>
                  <Image
                    style={{
                      width: '100%',
                      height: 350,
                      resizeMode: 'cover',
                      borderRadius: borderRadius.medium,
                    }}
                    source={{
                      uri: route?.params?.imageUrls[0],
                    }}
                  />
                  <Pressable
                    style={{
                      position: 'absolute',
                      bottom: 10,
                      right: 10,
                      backgroundColor: colors.textInverse,
                      width: 42,
                      height: 42,
                      borderRadius: borderRadius.xlarge,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <AntDesign name="hearto" size={25} color="#C5B358" />
                  </Pressable>
                </View>
              )}
            </View>

            <View style={{marginVertical: 15}}>
              {route?.params?.prompts.slice(0, 1).map(prompt => (
                <>
                  <View
                    key={prompt.id}
                    style={{
                      backgroundColor: colors.textInverse,
                      padding: 12,
                      borderRadius: borderRadius.medium,
                      height: 150,
                      justifyContent: 'center',
                    }}>
                    <Text style={{fontSize: typography.fontSize.md, fontFamily: typography.fontFamily.medium}}>
                      {prompt.question}
                    </Text>
                    <Text
                      style={{
                        fontSize: typography.fontSize.xl,
                        fontFamily: typography.fontFamily.semiBold,
                        marginTop: spacing.lg,
                      }}>
                      {prompt.answer}
                    </Text>
                  </View>
                  <View
                    style={{
                      position: 'absolute',
                      bottom: 10,
                      right: 10,
                      backgroundColor: colors.textInverse,
                      width: 42,
                      height: 42,
                      borderRadius: borderRadius.xlarge,
                      justifyContent: 'center',
                      alignItems: 'center',
                      shadowColor: '#000',
                      shadowOffset: {width: 0, height: 1},
                      shadowOpacity: 0.25,
                      shadowRadius: 3.84,
                      // Shadow properties for Android
                      elevation: 5,
                    }}>
                    <AntDesign name="hearto" size={25} color="#C5B358" />
                  </View>
                </>
              ))}
            </View>

            {/* profile details to come here */}

            <View>
              {route?.params?.imageUrls?.slice(1, 3).map((item, index) => (
                <View key={index} style={{marginVertical: 10}}>
                  <Image
                    style={{
                      width: '100%',
                      height: 350,
                      resizeMode: 'cover',
                      borderRadius: borderRadius.medium,
                    }}
                    source={{
                      uri: item,
                    }}
                  />

                  <View
                    style={{
                      position: 'absolute',
                      bottom: 10,
                      right: 10,
                      backgroundColor: colors.textInverse,
                      width: 42,
                      height: 42,
                      borderRadius: borderRadius.xlarge,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <AntDesign name="hearto" size={25} color="#C5B358" />
                  </View>
                </View>
              ))}
            </View>

            <View style={{marginVertical: 15}}>
              {route?.params?.prompts.slice(1, 2).map(prompt => (
                <>
                  <View
                    key={prompt.id}
                    style={{
                      backgroundColor: colors.textInverse,
                      padding: 12,
                      borderRadius: borderRadius.medium,
                      height: 150,
                      justifyContent: 'center',
                    }}>
                    <Text style={{fontSize: typography.fontSize.md, fontFamily: typography.fontFamily.medium}}>
                      {prompt.question}
                    </Text>
                    <Text
                      style={{
                        fontSize: typography.fontSize.xl,
                        fontFamily: typography.fontFamily.semiBold,
                        marginTop: spacing.lg,
                      }}>
                      {prompt.answer}
                    </Text>
                  </View>
                  <View
                    style={{
                      position: 'absolute',
                      bottom: 10,
                      right: 10,
                      backgroundColor: colors.textInverse,
                      width: 42,
                      height: 42,
                      borderRadius: borderRadius.xlarge,
                      justifyContent: 'center',
                      alignItems: 'center',
                      shadowColor: '#000',
                      shadowOffset: {width: 0, height: 1},
                      shadowOpacity: 0.25,
                      shadowRadius: 3.84,
                      // Shadow properties for Android
                      elevation: 5,
                    }}>
                    <AntDesign name="hearto" size={25} color="#C5B358" />
                  </View>
                </>
              ))}
            </View>

            <View>
              {route?.params?.imageUrls?.slice(3, 4).map((item, index) => (
                <View key={index} style={{marginVertical: 10}}>
                  <Image
                    style={{
                      width: '100%',
                      height: 350,
                      resizeMode: 'cover',
                      borderRadius: borderRadius.medium,
                    }}
                    source={{
                      uri: item,
                    }}
                  />
                  <View
                    style={{
                      position: 'absolute',
                      bottom: 10,
                      right: 10,
                      backgroundColor: colors.textInverse,
                      width: 42,
                      height: 42,
                      borderRadius: borderRadius.xlarge,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <AntDesign name="hearto" size={25} color="#C5B358" />
                  </View>
                </View>
              ))}
            </View>
            <View style={{marginVertical: 15}}>
              {route?.params?.prompts.slice(2, 3).map(prompt => (
                <>
                  <View
                    key={prompt.id}
                    style={{
                      backgroundColor: colors.textInverse,
                      padding: 12,
                      borderRadius: borderRadius.medium,
                      height: 150,
                      justifyContent: 'center',
                    }}>
                    <Text style={{fontSize: typography.fontSize.md, fontFamily: typography.fontFamily.medium}}>
                      {prompt.question}
                    </Text>
                    <Text
                      style={{
                        fontSize: typography.fontSize.xl,
                        fontFamily: typography.fontFamily.semiBold,
                        marginTop: spacing.lg,
                      }}>
                      {prompt.answer}
                    </Text>
                  </View>
                  <View
                    style={{
                      position: 'absolute',
                      bottom: 10,
                      right: 10,
                      backgroundColor: colors.textInverse,
                      width: 42,
                      height: 42,
                      borderRadius: borderRadius.xlarge,
                      justifyContent: 'center',
                      alignItems: 'center',
                      shadowColor: '#000',
                      shadowOffset: {width: 0, height: 1},
                      shadowOpacity: 0.25,
                      shadowRadius: 3.84,
                      // Shadow properties for Android
                      elevation: 5,
                    }}>
                    <AntDesign name="hearto" size={25} color="#C5B358" />
                  </View>
                </>
              ))}
            </View>

            <View>
              {route?.params?.imageUrls?.slice(4, 7).map((item, index) => (
                <View key={index} style={{marginVertical: 10}}>
                  <Image
                    style={{
                      width: '100%',
                      height: 350,
                      resizeMode: 'cover',
                      borderRadius: borderRadius.medium,
                    }}
                    source={{
                      uri: item,
                    }}
                  />
                  <View
                    style={{
                      position: 'absolute',
                      bottom: 10,
                      right: 10,
                      backgroundColor: colors.textInverse,
                      width: 42,
                      height: 42,
                      borderRadius: borderRadius.xlarge,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <AntDesign name="hearto" size={25} color="#C5B358" />
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* <View
              style={{
                position:"absolute",
                bottom: 10,
                left: 10,
                backgroundColor: colors.textInverse,
                width: 42,
                height: 42,
                borderRadius: borderRadius.xlarge,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Entypo name="cross" size={25} color="#C5B358" />
            </View> */}
        </View>
      </ScrollView>

      <Pressable
        onPress={match}
        style={{
          position: 'absolute',
          bottom: 45,
          right: 12,
          backgroundColor: colors.textInverse,
          width: 50,
          height: 50,
          borderRadius: borderRadius.round,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <MaterialCommunityIcons
          name="message-outline"
          size={25}
          color="#C5B358"
        />
      </Pressable>
    </>
  );
};

export default HandleLikeScreen;

const styles = StyleSheet.create({});
