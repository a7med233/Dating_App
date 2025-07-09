import {Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  StatusBar,
  ScrollView,
  TextInput,
  Modal,
  KeyboardAvoidingView,} from 'react-native';
import React, {useState, useEffect} from 'react';
import { MaterialCommunityIcons, AntDesign, MaterialIcons } from '@expo/vector-icons';
import {useNavigation, useRoute} from '@react-navigation/native';
import {getRegistrationProgress, saveRegistrationProgress} from '../registrationUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {registerUser} from '../services/api';
import {StackActions} from '@react-navigation/native';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import { colors, typography, shadows, borderRadius, spacing } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';

const PromptsScreen = () => {
  const route = useRoute();

  console.log('he', route?.params?.PromptsScreen);
  const navigation = useNavigation();
  const [userData, setUserData] = useState();
  const [error, setError] = useState('');
  const [prompts, setPrompts] = useState([]);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [editAnswer, setEditAnswer] = useState('');

  const getAllUserData = async () => {
    try {
      const nameData = await getRegistrationProgress('Name');
      const emailData = await getRegistrationProgress('Email');
      const passwordData = await getRegistrationProgress('Password');
      const birthData = await getRegistrationProgress('Birth');
      const locationData = await getRegistrationProgress('Location');
      const genderData = await getRegistrationProgress('Gender');
      const hometownData = await getRegistrationProgress('Hometown');
      const lookingForData = await getRegistrationProgress('LookingFor');
      const typeData = await getRegistrationProgress('Type');
      const promptsData = await getRegistrationProgress('Prompts');
      const photoData = await getRegistrationProgress('Photo');

      const allData = {
        name: nameData,
        email: emailData,
        password: passwordData,
        birth: birthData,
        location: locationData,
        gender: genderData,
        hometown: hometownData,
        lookingFor: lookingForData,
        type: typeData,
        prompts: promptsData,
        photo: photoData,
      };

      console.log('All registration data:', allData);
      setUserData(allData);
      if (promptsData) {
        setPrompts(promptsData.prompts || []);
      }
      return allData;
    } catch (error) {
      console.error('Error getting all user data:', error);
      return null;
    }
  };

  // Update local state when prompts are received from route params
  useEffect(() => {
    if (route?.params?.prompts) {
      setPrompts(route.params.prompts);
    }
  }, [route?.params?.prompts]);

  // Close modal if editingPrompt becomes null
  useEffect(() => {
    if (!editingPrompt && isEditModalVisible) {
      setEditModalVisible(false);
      setEditAnswer('');
    }
  }, [editingPrompt, isEditModalVisible]);

  // Set editAnswer when editingPrompt changes
  useEffect(() => {
    if (editingPrompt && editingPrompt.answer) {
      console.log('Setting editAnswer to:', editingPrompt.answer);
      setEditAnswer(editingPrompt.answer);
    }
  }, [editingPrompt]);

  const registerUserHandler = async userData => {
    try {
      const payload = {
        ...userData,
        prompts: userData.prompts || [],
      };
      const response = await registerUser(payload);
      const token = response.data.token;
      AsyncStorage.setItem('token', token);
      clearAllScreenData();
      navigation.replace('Main');
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  };

  const handleNext = () => {
    const currentPrompts = route?.params?.prompts || prompts;
    if (currentPrompts.length === 0) {
      setError('Please add at least one prompt.');
      return;
    }
    setError('');
    saveRegistrationProgress('Prompts', {prompts: currentPrompts});
    navigation.navigate('PreFinal');
  };

  const handleDeletePrompt = (indexToDelete) => {
    const currentPrompts = route?.params?.prompts || prompts;
    const updatedPrompts = currentPrompts.filter((_, index) => index !== indexToDelete);
    setPrompts(updatedPrompts);
    // Update the route params to reflect the change
    navigation.setParams({ prompts: updatedPrompts });
  };

  const handleEditPrompt = (prompt, index) => {
    if (!prompt || index === undefined) {
      return;
    }
    console.log('Editing prompt:', prompt);
    console.log('Current answer:', prompt.answer);
    setEditingPrompt({ ...prompt, index });
    setEditAnswer(prompt.answer || '');
    setEditModalVisible(true);
  };

  const handleSaveEdit = () => {
    if (!editAnswer.trim() || !editingPrompt) {
      return;
    }
    
    const currentPrompts = route?.params?.prompts || prompts;
    const updatedPrompts = [...currentPrompts];
    updatedPrompts[editingPrompt.index] = {
      ...editingPrompt,
      answer: editAnswer.trim()
    };
    
    setPrompts(updatedPrompts);
    navigation.setParams({ prompts: updatedPrompts });
    setEditModalVisible(false);
    setEditingPrompt(null);
    setEditAnswer('');
  };

  const handleCancelEdit = () => {
    setEditModalVisible(false);
    setEditingPrompt(null);
    setEditAnswer('');
  };

  const currentPrompts = route?.params?.prompts || prompts;
  
  return (
    <SafeAreaWrapper backgroundColor={colors.background} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.content}>
        {/* Header */}
        <LinearGradient
          colors={colors.purpleToCoral}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.iconContainer}>
                <MaterialIcons name="edit" size={24} color={colors.textInverse} />
              </View>
              <Text style={styles.logoText}>Prompts</Text>
            </View>
          </View>
        </LinearGradient>

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>
            Write your profile answers
          </Text>

          <Text style={styles.subtitle}>
            Add up to 3 prompts to help others get to know you better
          </Text>

          <View style={styles.promptsContainer}>
            {/* Show existing prompts */}
                         {currentPrompts && currentPrompts.length > 0 && (
               currentPrompts.map((item, index) => (
                 <View key={`prompt-${index}-${item?.question}`} style={styles.promptCard}>
                   <View style={styles.promptContent}>
                     <View style={styles.promptHeader}>
                       <MaterialIcons name="format-quote" size={16} color={colors.primary} />
                       <Text style={styles.promptQuestion}>
                         {item?.question}
                       </Text>
                     </View>
                     <Text style={styles.promptAnswer}>
                       {item?.answer}
                     </Text>
                     <TouchableOpacity
                       onPress={() => handleEditPrompt(item, index)}
                       style={styles.editButton}>
                       <MaterialIcons name="edit" size={16} color={colors.textSecondary} />
                       <Text style={styles.editText}>Edit</Text>
                     </TouchableOpacity>
                   </View>
                   <TouchableOpacity
                     onPress={() => handleDeletePrompt(index)}
                     style={styles.deleteButton}>
                     <MaterialIcons name="delete-outline" size={20} color={colors.error} />
                   </TouchableOpacity>
                 </View>
               ))
             )}
            
            {/* Show placeholder prompts for adding more (up to 3 total) */}
            {(!currentPrompts || currentPrompts.length < 3) && (
              <View>
                {Array.from({ length: 3 - (currentPrompts?.length || 0) }).map((_, index) => (
                  <TouchableOpacity
                    key={`prompt-placeholder-${index}`}
                    onPress={() => navigation.navigate('ShowPrompts', { 
                      prompts: currentPrompts || [] 
                    })}
                    style={styles.placeholderCard}>
                    <MaterialIcons name="add-circle-outline" size={32} color={colors.textSecondary} />
                    <Text style={styles.placeholderTitle}>
                      Select a Prompt
                    </Text>
                    <Text style={styles.placeholderSubtitle}>
                      And write your own answer
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <MaterialIcons name="error-outline" size={20} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
        </ScrollView>

        {/* Next Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            onPress={handleNext}
            style={[
              styles.nextButton,
              currentPrompts.length === 0 && styles.nextButtonDisabled
            ]}
            disabled={currentPrompts.length === 0}>
            <Text style={styles.nextButtonText}>Continue</Text>
            <MaterialIcons name="arrow-forward" size={20} color={colors.textInverse} />
          </TouchableOpacity>
                 </View>
       </View>

       {/* Edit Modal */}
       <Modal
         visible={isEditModalVisible}
         transparent={true}
         animationType="slide"
         onRequestClose={handleCancelEdit}>
         <KeyboardAvoidingView 
           style={styles.modalOverlay}
           behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
           keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
           <View style={styles.modalContent}>
             <View style={styles.modalHeader}>
               <Text style={styles.modalTitle}>Edit your answer</Text>
               <TouchableOpacity onPress={handleCancelEdit}>
                 <MaterialIcons name="close" size={24} color={colors.textSecondary} />
               </TouchableOpacity>
             </View>
             
             <Text style={styles.questionTitle}>
               {editingPrompt?.question || 'No question'}
             </Text>
             
             <View style={styles.textInputContainer}>
               <TextInput
                 value={editAnswer}
                 onChangeText={text => setEditAnswer(text)}
                 style={styles.textInput}
                 placeholder="Enter Your Answer"
                 placeholderTextColor={colors.textTertiary}
                 multiline={true}
                 textAlignVertical="top"
                 autoFocus={true}
               />
             </View>
             
             <View style={styles.modalButtons}>
               <TouchableOpacity 
                 onPress={handleCancelEdit}
                 style={styles.cancelButton}>
                 <Text style={styles.cancelButtonText}>Cancel</Text>
               </TouchableOpacity>
               
               <TouchableOpacity
                 onPress={handleSaveEdit}
                 style={[
                   styles.saveButton,
                   { opacity: editAnswer.trim() ? 1 : 0.5 }
                 ]}
                 disabled={!editAnswer.trim()}>
                 <Text style={styles.saveButtonText}>Save Changes</Text>
               </TouchableOpacity>
             </View>
           </View>
         </KeyboardAvoidingView>
       </Modal>
     </SafeAreaWrapper>
   );
 };

export default PromptsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  headerGradient: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: borderRadius.large,
    borderBottomRightRadius: borderRadius.large,
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textInverse,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  promptsContainer: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  promptCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadows.small,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  promptContent: {
    flex: 1,
    padding: spacing.md,
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  promptQuestion: {
    flex: 1,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textPrimary,
    fontStyle: 'italic',
  },
  promptAnswer: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: spacing.xs,
  },
  editText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
  },
  deleteButton: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.errorBackground,
    borderTopRightRadius: borderRadius.medium,
    borderBottomRightRadius: borderRadius.medium,
  },
  placeholderCard: {
    borderColor: colors.cardBorder,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
  },
  placeholderTitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  placeholderSubtitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorBackground,
    padding: spacing.md,
    borderRadius: borderRadius.medium,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  errorText: {
    flex: 1,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.error,
  },
  bottomContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    backgroundColor: colors.cardBackground,
  },
  nextButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.round,
    gap: spacing.sm,
    ...shadows.small,
  },
  nextButtonDisabled: {
    backgroundColor: colors.textTertiary,
  },
  nextButtonText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textInverse,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.large,
    padding: spacing.lg,
    width: '100%',
    maxHeight: '80%',
    ...shadows.large,
  },
  modalScrollView: {
    flex: 1,
    marginBottom: spacing.md,
  },
  modalScrollContent: {
    flexGrow: 1,
  },
  modalScrollContent: {
    flexGrow: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },
  questionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.primary,
    marginBottom: spacing.lg,
  },
  textInputContainer: {
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    marginBottom: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
    minHeight: 120,
    flex: 1,
  },
  textInput: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    lineHeight: 24,
    textAlignVertical: 'top',
    flex: 1,
    fontFamily: typography.fontFamily.regular,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.round,
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.textInverse,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.textTertiary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.round,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.textInverse,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
  },
});
