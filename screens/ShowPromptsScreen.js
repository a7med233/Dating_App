import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Platform,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  KeyboardAvoidingView
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, shadows, borderRadius, spacing } from '../theme/colors';
import SafeAreaWrapper from '../components/SafeAreaWrapper';


const { width, height } = Dimensions.get('window');

const ShowPromptsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [prompts, setPrompts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('About me');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  
  const promptCategories = [
    {
      id: '0',
      name: 'About me',
      icon: 'person',
      questions: [
        { id: '10', question: 'A random fact I love is' },
        { id: '11', question: 'Typical Sunday' },
        { id: '12', question: 'I go crazy for' },
        { id: '13', question: 'Unusual Skills' },
        { id: '14', question: 'My greatest strength' },
        { id: '15', question: 'My simple pleasures' },
        { id: '16', question: 'A life goal of mine' },
        { id: '17', question: 'My love language is' },
        { id: '18', question: 'I get way too excited about' },
      ],
    },
    {
      id: '1',
      name: 'Self Care',
      icon: 'leaf',
      questions: [
        { id: '20', question: 'I unwind by' },
        { id: '21', question: 'A boundary of mine is' },
        { id: '22', question: 'I feel most supported when' },
        { id: '23', question: 'I hype myself up by' },
        { id: '24', question: 'To me, relaxation is' },
        { id: '25', question: 'I beat my blues by' },
        { id: '26', question: 'My skin care routine' },
        { id: '27', question: 'My perfect self-care day' },
      ],
    },
    {
      id: '2',
      name: 'Dating',
      icon: 'heart',
      questions: [
        { id: '30', question: 'My ideal first date' },
        { id: '31', question: 'I\'m looking for someone who' },
        { id: '32', question: 'My biggest dating deal-breaker' },
        { id: '33', question: 'I know it\'s going to be a good date when' },
        { id: '34', question: 'My best date story' },
        { id: '35', question: 'I\'m a total romantic when it comes to' },
        { id: '36', question: 'My love language is' },
        { id: '37', question: 'I\'m attracted to people who' },
      ],
    },
    {
      id: '3',
      name: 'Lifestyle',
      icon: 'cafe',
      questions: [
        { id: '40', question: 'My perfect weekend' },
        { id: '41', question: 'I spend way too much money on' },
        { id: '42', question: 'My most controversial opinion' },
        { id: '43', question: 'I\'m currently obsessed with' },
        { id: '44', question: 'My comfort food' },
        { id: '45', question: 'I\'m a total foodie when it comes to' },
        { id: '46', question: 'My travel style' },
        { id: '47', question: 'My guilty pleasure' },
      ],
    },
    {
      id: '4',
      name: 'Fun Facts',
      icon: 'happy',
      questions: [
        { id: '50', question: 'My most irrational fear' },
        { id: '51', question: 'I\'m the type of person who' },
        { id: '52', question: 'My most embarrassing moment' },
        { id: '53', question: 'I\'m weirdly good at' },
        { id: '54', question: 'My most controversial take' },
        { id: '55', question: 'I\'m a total nerd about' },
        { id: '56', question: 'My most useless talent' },
        { id: '57', question: 'I\'m the friend who always' },
      ],
    },
  ];
  
  useEffect(() => {
    if (route?.params?.prompts) {
      setPrompts(route.params.prompts);
    }
  }, [route?.params?.prompts]);
  
  const openModal = item => {
    setModalVisible(true);
    setQuestion(item?.question);
    setAnswer('');
  };

  const addPrompt = () => {
    if (!answer.trim()) {
      return;
    }
    const newPrompt = { question, answer: answer.trim() };
    const updatedPrompts = [...prompts, newPrompt];
    setPrompts(updatedPrompts);
    setQuestion('');
    setAnswer('');
    setModalVisible(false);
    
    navigation.navigate('Prompts', {
      prompts: updatedPrompts,
    });
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const currentCategory = promptCategories.find(cat => cat.name === selectedCategory);
  
  return (
    <SafeAreaWrapper backgroundColor="white" edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
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
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.textInverse} />
              </TouchableOpacity>
              
              <View style={styles.logoContainer}>
                <Ionicons name="chatbubble-ellipses" size={40} color={colors.textInverse} />
                <Text style={styles.headerTitle}>Choose a Prompt</Text>
              </View>
          </View>
        </LinearGradient>

          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Title Section */}
            <View style={styles.titleSection}>
              <Text style={styles.title}>Select a question to answer</Text>
              <Text style={styles.subtitle}>
                Choose from different categories to showcase different aspects of your personality
              </Text>
            </View>

          {/* Category Tabs */}
            <View style={styles.categorySection}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.categoryScroll}
              >
                {promptCategories.map((category) => (
                <TouchableOpacity
                    key={category.id}
                  style={[
                    styles.categoryTab,
                      selectedCategory === category.name && styles.categoryTabActive
                  ]}
                    onPress={() => setSelectedCategory(category.name)}
                  >
                    <Ionicons 
                      name={category.icon} 
                      size={18} 
                      color={selectedCategory === category.name ? colors.textInverse : colors.textSecondary} 
                  />
                  <Text style={[
                    styles.categoryText,
                      selectedCategory === category.name && styles.categoryTextActive
                  ]}>
                      {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          {/* Questions List */}
            <View style={styles.questionsSection}>
              <Text style={styles.sectionTitle}>
                {currentCategory?.name} Questions
              </Text>
              <View style={styles.questionsList}>
                {currentCategory?.questions.map((questionItem) => (
                      <TouchableOpacity
                        key={questionItem.id}
                        onPress={() => openModal(questionItem)}
                    style={styles.questionItem}
                  >
                    <View style={styles.questionContent}>
                      <Ionicons name="chatbubble-outline" size={16} color={colors.primary} />
                        <Text style={styles.questionText}>
                          {questionItem.question}
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                      </TouchableOpacity>
                    ))}
              </View>
            </View>

            {/* Info Section */}
            <View style={styles.infoContainer}>
              <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.infoText}>
                Choose questions that help others understand your personality, interests, and what makes you unique!
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Answer Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <SafeAreaWrapper style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Answer your question</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.questionTitle}>
              {question}
            </Text>
            
            <View style={styles.textInputContainer}>
              <TextInput
                value={answer}
                onChangeText={text => setAnswer(text)}
                style={styles.textInput}
                placeholder="Enter your answer..."
                placeholderTextColor={colors.textTertiary}
                multiline={true}
                textAlignVertical="top"
                autoFocus={true}
              />
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
            <TouchableOpacity
              onPress={addPrompt}
                disabled={!answer.trim()}
              style={[
                styles.addButton,
                  {
                    opacity: answer.trim() ? 1 : 0.6,
                    backgroundColor: answer.trim() ? colors.primary : colors.textTertiary
                  }
                ]}>
              <Text style={styles.addButtonText}>Add Answer</Text>
            </TouchableOpacity>
            </View>
                      </View>
          </KeyboardAvoidingView>
        </SafeAreaWrapper>
      </Modal>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
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
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 20 : 10,
    right: spacing.lg,
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
  categorySection: {
    marginBottom: spacing.xl,
  },
  categoryScroll: {
    paddingHorizontal: spacing.sm,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
    borderRadius: borderRadius.round,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
    ...shadows.small,
  },
  categoryTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
  },
  categoryTextActive: {
    color: colors.textInverse,
  },
  questionsSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  questionsList: {
    gap: spacing.sm,
  },
  questionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small,
  },
  questionContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: spacing.sm,
  },
  questionText: {
    flex: 1,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
    lineHeight: 22,
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
  addButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textInverse,
  },
});

export default ShowPromptsScreen;