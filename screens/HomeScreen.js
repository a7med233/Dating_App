import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Image,
} from 'react-native';
import React, {useEffect, useState, useCallback} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import Octicons from 'react-native-vector-icons/Octicons';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {jwtDecode} from 'jwt-decode';
import { fetchMatches } from '../services/api';
import { atob, btoa } from 'base-64';

if (typeof global.atob === 'undefined') {
  global.atob = atob;
}
if (typeof global.btoa === 'undefined') {
  global.btoa = btoa;
}

const HomeScreen = () => {
  const navigation = useNavigation();
  const [option, setOption] = useState('Compatible');
  const [profilesData, setProfilesData] = useState([]);
  const profiles = [
    {
      id: '0',
      name: 'Shreya Singh',
      photos: [
        {
          id: '10',
          image: 'https://www.instagram.com/p/C2rAwvAIDhs/media/?size=l',
        },
        {
          id: '11',
          image: 'https://www.instagram.com/p/Czc7MTGojOL/media/?size=l',
        },
        {
          id: '12',
          image: 'https://www.instagram.com/p/C1WBQCmoGGg/media/?size=l',
        },
        {
          id: '13',
          image: 'https://www.instagram.com/p/CkfLYLvoZdY/media/?size=l',
        },
        {
          id: '14',
          image: 'https://www.instagram.com/p/CgyWempo_iI/media/?size=l',
        },
        {
          id: '14',
          image: 'https://www.instagram.com/p/CRyLfQrBXLf/media/?size=l',
        },
      ],
      prompts: [
        {
          id: '1',
          prompt: 'This year, I really want to',
          answer: 'Turn Vegan',
        },
        {
          id: '2',
          prompt: 'Best travel story',
          answer: 'Hitchhiking in Germany',
        },
        {
          id: '3',
          prompt: 'I go crazy for',
          answer: 'Pani Puri',
        },
      ],
      age: 24,
      type: 'straight',
      gender: 'female',
      height: "5' 5",
      location: 'Vasanth Nagar',
      occupation: 'SDE at Microsoft',
      religion: 'Hindu',
      lookingFor: 'Short-term relationship',
      native: 'Mumbai',
    },
    {
      id: '0',
      name: 'Megha K',
      photos: [
        {
          id: '10',
          image: 'https://www.instagram.com/p/C27SU9sNMXO/media/?size=l',
        },
        {
          id: '11',
          image: 'https://www.instagram.com/p/C2w8cRStX2T/media/?size=l',
        },
        {
          id: '12',
          image: 'https://www.instagram.com/p/Cy8XwyCNeCR/media/?size=l',
        },
        {
          id: '13',
          image: 'https://www.instagram.com/p/CmeiXSoyMXL/media/?size=l',
        },
        {
          id: '14',
          image: 'https://www.instagram.com/p/CGm4TXAFPBw/media/?size=l',
        },
        {
          id: '14',
          image: 'https://www.instagram.com/p/C1ZgN1ZNSO7/media/?size=l',
        },
      ],
      prompts: [
        {
          id: '1',
          prompt: "What's your favorite hobby?",
          answer: 'Painting landscapes',
        },
        {
          id: '2',
          prompt: 'Describe your dream job.',
          answer: 'Wildlife photographer',
        },
        {
          id: '3',
          prompt: "One thing you'd change about the world?",
          answer: 'Eliminate poverty',
        },
      ],
      age: 22,
      type: 'straight',
      gender: 'female',
      height: "5' 3",
      location: 'HSR Layout',
      occupation: 'Soft Engineer',
      religion: 'Hindu',
      lookingFor: 'Long-term relationship',
      native: 'Bangalore',
    },
    {
      id: '0',
      name: 'Neha Sharma',
      photos: [
        {
          id: '10',
          image: 'https://www.instagram.com/p/CnV-OCdh_if/media/?size=l',
        },
        {
          id: '11',
          image: 'https://www.instagram.com/p/C3Nhxdop4ff/media/?size=l',
        },
        {
          id: '12',
          image: 'https://www.instagram.com/p/C1Rzh7KJ0OY/media/?size=l',
        },
        {
          id: '13',
          image: 'https://www.instagram.com/p/CyD-gT3JOpy/media/?size=l',
        },
        {
          id: '14',
          image: 'https://www.instagram.com/p/CwNmWmnpP-q/media/?size=l',
        },
        {
          id: '14',
          image: 'https://www.instagram.com/p/Cu_5SWsJ5Fu/media/?size=l',
        },
      ],
      prompts: [
        {
          id: '4',
          prompt: 'What inspires you the most?',
          answer: 'Nature and its beauty',
        },
        {
          id: '5',
          prompt: 'If you could have any superpower, what would it be?',
          answer: 'Teleportation',
        },
        {
          id: '6',
          prompt: 'Your favorite book/movie of all time?',
          answer: 'The Lord of the Rings trilogy',
        },
      ],
      age: 23,
      type: 'straight',
      gender: 'female',
      height: "5' 5",
      location: 'D Cross',
      occupation: 'Architect',
      religion: 'Hindu',
      lookingFor: 'Long-term relationship',
      native: 'Bangalore',
    },
    {
      id: '0',
      name: 'Sujan anand',
      photos: [
        {
          id: '10',
          image: 'https://www.instagram.com/p/C14N5gcpgYp/media/?size=l',
        },
        {
          id: '11',
          image: 'https://www.instagram.com/p/C01aN_tKsO7/media/?size=l',
        },
        {
          id: '12',
          image: 'https://www.instagram.com/p/C0dwBrJKn2Z/media/?size=l',
        },
        {
          id: '13',
          image: 'https://www.instagram.com/p/CzbOYtRKaPz/media/?size=l',
        },
        {
          id: '14',
          image: 'https://www.instagram.com/p/Cyddsocq-fu/media/?size=l',
        },
        {
          id: '14',
          image: 'https://www.instagram.com/p/Cu62APUJnUt/media/?size=l',
        },
      ],
      prompts: [
        {
          id: '7',
          prompt: 'What is  your proudest accomplishment?',
          answer: 'Running a marathon',
        },
        {
          id: '8',
          prompt: 'If you could live in any era, which one would it be?',
          answer: 'The Roaring Twenties',
        },
        {
          id: '9',
          prompt: 'What is your favorite way to relax after a long day?',
          answer: 'Listening to music and taking a hot bath',
        },
      ],
      age: 23,
      type: 'straight',
      gender: 'male',
      height: "5' 9",
      location: 'Kormangala',
      occupation: 'Software Enginerr',
      religion: 'Hindu',
      lookingFor: 'Long-term relationship',
      native: 'Bangalore',
    },
    {
      id: '0',
      name: 'Sujan anand',
      photos: [
        {
          id: '10',
          image: 'https://www.instagram.com/p/C2JW1pRogTV/media/?size=l',
        },
        {
          id: '11',
          image: 'https://www.instagram.com/p/C3ITT06oZ23/media/?size=l',
        },
        {
          id: '12',
          image: 'https://www.instagram.com/p/Cz3cMylo2W-/media/?size=l',
        },
        {
          id: '13',
          image: 'https://www.instagram.com/p/CtwXJt0SSEM/media/?size=l',
        },
        {
          id: '14',
          image: 'https://www.instagram.com/p/CmrDFESqzjO/media/?size=l',
        },
        {
          id: '14',
          image: 'https://www.instagram.com/p/CeD_9l3hR8h/media/?size=l',
        },
      ],
      prompts: [
        {
          id: '7',
          prompt: 'What is  your proudest accomplishment?',
          answer: 'Running a marathon',
        },
        {
          id: '8',
          prompt: 'If you could live in any era, which one would it be?',
          answer: 'The Roaring Twenties',
        },
        {
          id: '9',
          prompt: 'What is your favorite way to relax after a long day?',
          answer: 'Listening to music and taking a hot bath',
        },
      ],
      age: 23,
      type: 'straight',
      gender: 'male',
      height: "5' 9",
      location: 'Kormangala',
      occupation: 'Software Enginerr',
      religion: 'Hindu',
      lookingFor: 'Long-term relationship',
      native: 'Bangalore',
    },
  ];

  const [userId, setUserId] = useState('');
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

  console.log('userId', userId);

  const showToken = async () => {
    const token = await AsyncStorage.getItem('token');
    console.log('token', token);
  };
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  // const [currentProfile, setCurrentProfile] = useState(profiles[0]);
  const [currentProfile, setCurrentProfile] = useState(profilesData[0]);
  const handleLike = () => {
    // Handle liking the current profile
    // You can implement additional logic here, such as updating the liked profile list
    // For now, just move to the next profile
    navigateToNextProfile();
  };

  const handleCross = () => {
    // Handle crossing the current profile
    // You can implement additional logic here, such as updating the crossed profile list
    // For now, just move to the next profile
    navigateToNextProfile();
  };

  const navigateToNextProfile = () => {
    const nextIndex = currentProfileIndex + 1;
    if (nextIndex <= profilesData.length) {
      setCurrentProfileIndex(nextIndex);
      setCurrentProfile(profilesData[nextIndex]);
      navigation.navigate('Animation');
    } else {
      // No more profiles to display
      console.log('No more profiles');
    }
  };
  console.log('next index', currentProfileIndex);

  useEffect(() => {
    showToken();
  }, []);

  const fetchMatchesHandler = async () => {
    try {
      const response = await fetchMatches(userId);
      const matches = response.data.matches;
      setProfilesData(matches);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };
  useEffect(() => {
    // Update currentProfile when profilesData changes
    if (profilesData.length > 0) {
      setCurrentProfile(profilesData[0]);
    }
  }, [profilesData]);

  useEffect(() => {
    if (userId) {
      fetchMatchesHandler();
    }
  }, [userId]);
  useFocusEffect(
    useCallback(() => {
      console.log('i call');
      if (userId) {
        fetchMatchesHandler();
      }
    }, [userId]),
  );
  console.log('matches', profilesData);

  const [filteredProfiles, setFilteredProfiles] = useState([]);
  useEffect(() => {
    filterProfiles();
  }, [option, profilesData]);

  const filterProfiles = () => {
    let filtered = profilesData;
    if (option === 'Compatible') {
      filtered = profilesData.filter(p => p.type === currentProfile?.type);
    } else if (option === 'Active Today') {
      filtered = profilesData.filter(p => p.lastActive && isToday(new Date(p.lastActive)));
    } else if (option === 'New here') {
      filtered = profilesData.filter(p => p.createdAt && isNewUser(new Date(p.createdAt)));
    }
    setFilteredProfiles(filtered);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };
  const isNewUser = (date) => {
    const now = new Date();
    const diff = now - date;
    return diff < 7 * 24 * 60 * 60 * 1000; // joined within last 7 days
  };

  return (
    <>
      <ScrollView style={{marginTop: 55}}>
        <View
          style={{
            padding: 10,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
          }}>
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: '#D0D0D0',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Ionicons name="sparkles-sharp" size={22} color="black" />
          </View>
          <Pressable
            onPress={() => setOption('Compatible')}
            style={{
              borderColor: option == 'Compatible' ? 'transparent' : '#808080',
              borderWidth: 0.7,
              padding: 10,
              borderRadius: 20,
              backgroundColor: option == 'Compatible' ? 'black' : 'transparent',
            }}>
            <Text
              style={{
                textAlign: 'center',
                fontSize: 14,
                fontWeight: '400',
                color: option == 'Compatible' ? 'white' : '#808080',
              }}>
              Compatible
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setOption('Active Today')}
            style={{
              borderColor: option == 'Active Today' ? 'transparent' : '#808080',
              borderWidth: 0.7,
              padding: 10,
              borderRadius: 20,
              backgroundColor:
                option == 'Active Today' ? 'black' : 'transparent',
            }}>
            <Text
              style={{
                textAlign: 'center',
                fontSize: 14,
                fontWeight: '400',
                color: option == 'Active Today' ? 'white' : '#808080',
              }}>
              Active Today
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setOption('New here')}
            style={{
              borderColor: option == 'New here' ? 'transparent' : '#808080',
              borderWidth: 0.7,
              padding: 10,
              borderRadius: 20,
              backgroundColor: option == 'New here' ? 'black' : 'transparent',
            }}>
            <Text
              style={{
                textAlign: 'center',
                fontSize: 14,
                fontWeight: '400',
                color: option == 'New here' ? 'white' : '#808080',
              }}>
              New here
            </Text>
          </Pressable>
        </View>
        <View style={{marginHorizontal: 12, marginVertical: 12}}>
          {/* {profiles?.map((item, index) => ( */}
          {filteredProfiles.length === 0 ? (
            <Text style={{textAlign:'center',marginTop:20}}>No profiles found for this filter.</Text>
          ) : (
            <>
              {(() => {
                const profile = filteredProfiles[0];
                if (!profile) return null;
                return (
                  <View>
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                      <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
                        <Text style={{fontSize: 22, fontWeight: 'bold'}}>{profile?.firstName}</Text>
                        <View style={{backgroundColor: '#452c63', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20}}>
                          <Text style={{textAlign: 'center', color: 'white'}}>new here</Text>
                        </View>
                      </View>
                      <View style={{flexDirection: 'row', alignItems: 'center', gap: 15}}>
                        <Entypo name="dots-three-horizontal" size={22} color="black" />
                      </View>
                    </View>
                    <View style={{marginVertical: 15}}>
                      {profile?.imageUrls?.length > 0 && (
                        <View>
                          <Image
                            style={{width: '100%', height: 350, resizeMode: 'cover', borderRadius: 10}}
                            source={{uri: profile?.imageUrls[0]}}
                          />
                          <Pressable
                            onPress={() => navigation.navigate('SendLike', {image: profile?.imageUrls[0], name: profile?.firstName, userId: userId, likedUserId: profile?._id})}
                            style={{position: 'absolute', bottom: 10, right: 10, backgroundColor: 'white', width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center'}}>
                            <AntDesign name="hearto" size={25} color="#C5B358" />
                          </Pressable>
                        </View>
                      )}
                    </View>
                    <View style={{marginVertical: 15}}>
                      {profile?.prompts?.slice(0, 1).map(prompt => (
                        <View key={prompt.id} style={{backgroundColor: 'white', padding: 12, borderRadius: 10, height: 150, justifyContent: 'center'}}>
                          <Text style={{fontSize: 15, fontWeight: '500'}}>{prompt.question}</Text>
                          <Text style={{fontSize: 20, fontWeight: '600', marginTop: 20}}>{prompt.answer}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                );
              })()}
            </>
          )}
          {/* ))} */}
        </View>
      </ScrollView>
      <Pressable
        onPress={handleCross}
        style={{
          position: 'absolute',
          bottom: 15,
          left: 12,
          backgroundColor: 'white',
          width: 50,
          height: 50,
          borderRadius: 25,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Entypo name="cross" size={25} color="#C5B358" />
      </Pressable>
    </>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({});
