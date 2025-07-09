import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

const ProfileCard = ({ profile, onPress, style }) => {
  if (!profile) return null;
  return (
    <TouchableOpacity style={[styles.card, style]} onPress={onPress}>
      <Image
        source={{ uri: profile.imageUrls?.[0] || 'https://via.placeholder.com/100' }}
        style={styles.image}
      />
      <View style={styles.info}>
        <Text style={styles.name}>{profile.firstName} {profile.lastName}</Text>
        <Text style={styles.details}>{profile.age ? `${profile.age} yrs` : ''} {profile.location ? `• ${profile.location}` : ''}</Text>
        {profile.lookingFor && profile.lookingForVisible !== false && (
          <Text style={styles.lookingFor}>{profile.lookingFor}</Text>
        )}
        {profile.gender && profile.genderVisible !== false && (
          <Text style={styles.details}>{profile.gender}</Text>
        )}
        {profile.type && profile.typeVisible !== false && (
          <Text style={styles.details}>{profile.type}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
    backgroundColor: '#eee',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#581845',
  },
  details: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  lookingFor: {
    fontSize: 13,
    color: '#900C3F',
    marginTop: 4,
  },
});

export default ProfileCard; 