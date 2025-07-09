import { ScrollView, StyleSheet, Text, View, Image,  Platform, StatusBar } from 'react-native'
import { colors, typography, shadows, borderRadius, spacing } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import GradientButton from '../components/GradientButton';
import ThemedCard from '../components/ThemedCard';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import React, { Fragment, useState, useEffect } from 'react'
import { useRoute } from '@react-navigation/native'
import { Ionicons, Entypo, AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { jwtDecode } from 'jwt-decode';

const ProfileDetailsScreen = () => {
    const route = useRoute();
    const [currentUserId, setCurrentUserId] = useState(null);
    const [isOwnProfile, setIsOwnProfile] = useState(false);
    
    console.log(route?.params)

    useEffect(() => {
        const getCurrentUserId = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                if (token) {
                    const decodedToken = jwtDecode(token);
                    const userId = decodedToken.userId;
                    setCurrentUserId(userId);
                    
                    // Check if this is the user's own profile
                    const profileUserId = route?.params?.currentProfile?._id;
                    setIsOwnProfile(userId === profileUserId);
                }
            } catch (error) {
                console.error('Error getting current user ID:', error);
            }
        };
        
        getCurrentUserId();
    }, [route?.params?.currentProfile?._id]);

  return (
    <SafeAreaWrapper backgroundColor={colors.background} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* {profiles?.map((item, index) => ( */}
          <>
            <View>
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
                    {route?.params?.currentProfile?.firstName}
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
                  <Entypo
                    name="dots-three-horizontal"
                    size={22}
                    color="black"
                  />
                </View>
              </View>

              <View style={{marginVertical: 15}}>
                <View>
                  {route?.params?.currentProfile?.imageUrls?.length > 0 && 
                   route?.params?.currentProfile?.imageUrls[0] && (
                    <View>
                      <Image
                        style={{
                          width: '100%',
                          height: 350,
                          resizeMode: 'cover',
                          borderRadius: borderRadius.medium,
                        }}
                        source={{
                          uri: route?.params?.currentProfile?.imageUrls[0]
                        }}
                      />
                      {!isOwnProfile && (
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
                      )}
                    </View>
                  )}
                </View>

                {/* Profile Information Section */}
                <View style={{
                  backgroundColor: colors.textInverse,
                  padding: spacing.lg,
                  borderRadius: borderRadius.medium,
                  marginVertical: spacing.md,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}>
                  <Text style={{
                    fontSize: typography.fontSize.lg,
                    fontFamily: typography.fontFamily.bold,
                    color: colors.textPrimary,
                    marginBottom: spacing.md,
                  }}>
                    About {route?.params?.currentProfile?.firstName}
                  </Text>
                  
                  {route?.params?.currentProfile?.gender && route?.params?.currentProfile?.genderVisible !== false && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
                      <Text style={{
                        fontSize: typography.fontSize.md,
                        fontFamily: typography.fontFamily.medium,
                        color: colors.textSecondary,
                        width: 80,
                      }}>
                        Gender:
                      </Text>
                      <Text style={{
                        fontSize: typography.fontSize.md,
                        fontFamily: typography.fontFamily.semiBold,
                        color: colors.textPrimary,
                      }}>
                        {route?.params?.currentProfile?.gender}
                      </Text>
                    </View>
                  )}
                  
                  {route?.params?.currentProfile?.type && route?.params?.currentProfile?.typeVisible !== false && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
                      <Text style={{
                        fontSize: typography.fontSize.md,
                        fontFamily: typography.fontFamily.medium,
                        color: colors.textSecondary,
                        width: 80,
                      }}>
                        Sexuality:
                      </Text>
                      <Text style={{
                        fontSize: typography.fontSize.md,
                        fontFamily: typography.fontFamily.semiBold,
                        color: colors.textPrimary,
                      }}>
                        {route?.params?.currentProfile?.type}
                      </Text>
                    </View>
                  )}
                  
                  {route?.params?.currentProfile?.lookingFor && route?.params?.currentProfile?.lookingForVisible !== false && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
                      <Text style={{
                        fontSize: typography.fontSize.md,
                        fontFamily: typography.fontFamily.medium,
                        color: colors.textSecondary,
                        width: 80,
                      }}>
                        Looking for:
                      </Text>
                      <Text style={{
                        fontSize: typography.fontSize.md,
                        fontFamily: typography.fontFamily.semiBold,
                        color: colors.textPrimary,
                      }}>
                        {route?.params?.currentProfile?.lookingFor}
                      </Text>
                    </View>
                  )}
                  
                  {route?.params?.currentProfile?.location && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
                      <Text style={{
                        fontSize: typography.fontSize.md,
                        fontFamily: typography.fontFamily.medium,
                        color: colors.textSecondary,
                        width: 80,
                      }}>
                        Location:
                      </Text>
                      <Text style={{
                        fontSize: typography.fontSize.md,
                        fontFamily: typography.fontFamily.semiBold,
                        color: colors.textPrimary,
                      }}>
                        {route?.params?.currentProfile?.location}
                      </Text>
                    </View>
                  )}
                  
                  {route?.params?.currentProfile?.hometown && (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{
                        fontSize: typography.fontSize.md,
                        fontFamily: typography.fontFamily.medium,
                        color: colors.textSecondary,
                        width: 80,
                      }}>
                        Hometown:
                      </Text>
                      <Text style={{
                        fontSize: typography.fontSize.md,
                        fontFamily: typography.fontFamily.semiBold,
                        color: colors.textPrimary,
                      }}>
                        {route?.params?.currentProfile?.hometown}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={{marginVertical: 15}}>
                  {route?.params?.currentProfile?.prompts?.slice(0, 1).map((prompt, index) => (
                    <Fragment key={prompt.id || `prompt-${index}`}>
                      <View
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
                      {!isOwnProfile && (
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
                      )}
                    </Fragment>
                  ))}
                </View>

                {/* profile details to come here */}

                <View>
                  {route?.params?.currentProfile?.imageUrls?.slice(1, 3).map((item, index) => (
                    item && (
                      <View key={`image-${index}`} style={{marginVertical: 10}}>
                        <Image
                          style={{
                            width: '100%',
                            height: 350,
                            resizeMode: 'cover',
                            borderRadius: borderRadius.medium,
                          }}
                          source={{
                            uri: item
                          }}
                        />

                        {!isOwnProfile && (
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
                        )}
                      </View>
                    )
                  ))}
                </View>

                <View style={{marginVertical: 15}}>
                  {route?.params?.currentProfile?.prompts?.slice(1, 2).map((prompt, index) => (
                    <Fragment key={prompt.id || `prompt-${index + 1}`}>
                      <View
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
                      {!isOwnProfile && (
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
                      )}
                    </Fragment>
                  ))}
                </View>

                <View>
                  {route?.params?.currentProfile?.imageUrls?.slice(3, 4).map((item, index) => (
                    item && (
                      <View key={`image-${index + 3}`} style={{marginVertical: 10}}>
                        <Image
                          style={{
                            width: '100%',
                            height: 350,
                            resizeMode: 'cover',
                            borderRadius: borderRadius.medium,
                          }}
                          source={{
                            uri: item
                          }}
                        />
                        {!isOwnProfile && (
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
                        )}
                      </View>
                    )
                  ))}
                </View>
                <View style={{marginVertical: 15}}>
                  {route?.params?.currentProfile?.prompts?.slice(2, 3).map((prompt, index) => (
                    <Fragment key={prompt.id || `prompt-${index + 2}`}>
                      <View
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
                      {!isOwnProfile && (
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
                      )}
                    </Fragment>
                  ))}
                </View>

                <View>
                  {route?.params?.currentProfile?.imageUrls?.slice(4, 7).map((item, index) => (
                    item && (
                      <View key={`image-${index + 4}`} style={{marginVertical: 10}}>
                        <Image
                          style={{
                            width: '100%',
                            height: 350,
                            resizeMode: 'cover',
                            borderRadius: borderRadius.medium,
                          }}
                          source={{
                            uri: item
                          }}
                        />
                        {!isOwnProfile && (
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
                        )}
                      </View>
                    )
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
          </>
          {/* ))} */}
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  )
}

export default ProfileDetailsScreen

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'android' ? 100 : 50, // Extra padding for Android
  },
  content: {
    marginHorizontal: 12,
    marginVertical: 12,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
})