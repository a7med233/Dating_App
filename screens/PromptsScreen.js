import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Modal,
  Dimensions,
  Platform,
  ScrollView,
  StatusBar} from 'react-native';
import React, {useState, useEffect} from 'react';
import { Ionicons } from '@expo/vector-icons';
import {useNavigation, useRoute} from '@react-navigation/native';
import {getRegistrationProgress, saveRegistrationProgress} from '../registrationUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {registerUser} from '../services/api';
import {StackActions} from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, shadows, borderRadius, spacing } from '../theme/colors';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import SamsungKeyboardAvoidingView from '../components/SamsungKeyboardAvoidingView';

const { width, height } = Dimensions.get('window');

const PromptsScreen = () => {
  const route = useRoute();
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

  useEffect(() => {
    if (route?.params?.prompts) {
      setPrompts(route.params.prompts);
    }
  }, [route?.params?.prompts]);

  useEffect(() => {
    if (!editingPrompt && isEditModalVisible) {
      setEditModalVisible(false);
      setEditAnswer('');
    }
  }, [editingPrompt, isEditModalVisible]);

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

  const handleBack = () => {
    navigation.goBack();
  };

  const handleDeletePrompt = (indexToDelete) => {
    const currentPrompts = route?.params?.prompts || prompts;
    const updatedPrompts = currentPrompts.filter((_, index) => index !== indexToDelete);
    setPrompts(updatedPrompts);
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
    <SafeAreaWrapper backgroundColor="white" edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <SamsungKeyboardAvoidingView>
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section with Gradient */}
        <LinearGradient
            colors={colors.primaryGradient}
          start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerSection}
        >
            <View style={styles.headerContent}>
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={colors.textInverse} />
              </TouchableOpacity>
              
            <View style={styles.logoContainer}>
                <Ionicons name="chatbubble-ellipses" size={40} color={colors.textInverse} />
                <Text style={styles.headerTitle}>Profile Prompts</Text>
            </View>
          </View>
        </LinearGradient>

          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Title Section */}
            <View style={styles.titleSection}>
              <Text style={styles.title}>Write your profile answers</Text>
          <Text style={styles.subtitle}>
                Add up to 3 prompts to help others get to know you better. Choose questions that showcase your personality!
          </Text>
            </View>

            {/* Prompts Container */}
          <View style={styles.promptsContainer}>
            {/* Show existing prompts */}
                         {currentPrompts && currentPrompts.length > 0 && (
               currentPrompts.map((item, index) => (
                 <View key={`prompt-${index}-${item?.question}`} style={styles.promptCard}>
                   <View style={styles.promptContent}>
                     <View style={styles.promptHeader}>
                        <Ionicons name="chatbubble-outline" size={16} color={colors.primary} />
                       <Text style={styles.promptQuestion}>
                         {item?.question}
                       </Text>
                     </View>
                     <Text style={styles.promptAnswer}>
                       {item?.answer}
                     </Text>
                      <View style={styles.promptActions}>
                     <TouchableOpacity
                       onPress={() => handleEditPrompt(item, index)}
                       style={styles.editButton}>
                          <Ionicons name="create-outline" size={16} color={colors.primary} />
                       <Text style={styles.editText}>Edit</Text>
                     </TouchableOpacity>
                   <TouchableOpacity
                     onPress={() => handleDeletePrompt(index)}
                     style={styles.deleteButton}>
                          <Ionicons name="trash-outline" size={16} color={colors.error} />
                          <Text style={styles.deleteText}>Delete</Text>
                   </TouchableOpacity>
                      </View>
                    </View>
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
                      <View style={styles.placeholderIcon}>
                        <Ionicons name="add-circle-outline" size={32} color={colors.primary} />
                      </View>
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

            {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={16} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

            {/* Info Section */}
            <View style={styles.infoContainer}>
              <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.infoText}>
                Prompts help others understand your personality and interests. Choose questions that let your true self shine through!
              </Text>
            </View>

            {/* Continue Button */}
          <TouchableOpacity
            onPress={handleNext}
              disabled={currentPrompts.length === 0}
            style={[
                styles.continueButton,
                {
                  opacity: currentPrompts.length === 0 ? 0.6 : 1,
                  backgroundColor: currentPrompts.length === 0 ? colors.textTertiary : colors.primary
                }
              ]}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
                 </View>
        </ScrollView>
      </SamsungKeyboardAvoidingView>

       {/* Edit Modal */}
       <Modal
         visible={isEditModalVisible}
         transparent={true}
         animationType="slide"
         onRequestClose={handleCancelEdit}>
         <SamsungKeyboardAvoidingView>
           <View style={styles.modalContent}>
             <View style={styles.modalHeader}>
               <Text style={styles.modalTitle}>Edit your answer</Text>
              <TouchableOpacity onPress={handleCancelEdit} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
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
                disabled={!editAnswer.trim()}
                 style={[
                   styles.saveButton,
                  {
                    opacity: editAnswer.trim() ? 1 : 0.6,
                    backgroundColor: editAnswer.trim() ? colors.primary : colors.textTertiary
                  }
                ]}>
                 <Text style={styles.saveButtonText}>Save Changes</Text>
               </TouchableOpacity>
             </View>
           </View>
         </SamsungKeyboardAvoidingView>
       </Modal>
    </SafeAreaWrapper>
   );
 };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: Platform.OS === 'android' ? 20 : 0,
  },
  headerSection: {
    height: 180,
    width: '100%',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.large,
    elevation: 8,
  },
  headerContent: {
    width: '100%',
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 0 : (StatusBar.currentHeight || 0),
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 20 : 10,
    left: spacing.lg,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  headerTitle: {
    marginTop: spacing.sm,
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textInverse,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: Platform.OS === 'android' ? 100 : 0,
  },
  titleSection: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  promptsContainer: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  promptCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small,
  },
  promptContent: {
    padding: spacing.lg,
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
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  promptActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.small,
    backgroundColor: colors.primary + '10',
  },
  editText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.small,
    backgroundColor: colors.error + '10',
  },
  deleteText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.error,
  },
  placeholderCard: {
    borderColor: colors.border,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: borderRadius.medium,
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  placeholderIcon: {
    marginBottom: spacing.sm,
  },
  placeholderTitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  placeholderSubtitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error + '10',
    borderRadius: borderRadius.small,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.error + '20',
  },
  errorText: {
    marginLeft: spacing.xs,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.error,
    flex: 1,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primary + '10',
    borderRadius: borderRadius.small,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary + '20',
    marginBottom: spacing.xl,
  },
  infoText: {
    marginLeft: spacing.xs,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  continueButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    marginBottom: Platform.OS === 'android' ? 20 : 0,
    ...shadows.medium,
  },
  continueButtonText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textInverse,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.large,
    padding: spacing.lg,
    margin: spacing.lg,
    width: width - spacing.xl * 2,
    maxHeight: height * 0.8,
    ...shadows.large,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  questionTitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    fontStyle: 'italic',
  },
  textInputContainer: {
    marginBottom: spacing.lg,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.textPrimary,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textInverse,
  },
});

export default PromptsScreen;
