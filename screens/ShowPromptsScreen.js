import {StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  Button,
  Platform,
  StatusBar,
  ScrollView,
  TouchableOpacity,} from 'react-native';
import React, { useState, useEffect } from 'react';
import { Entypo, MaterialIcons } from '@expo/vector-icons';
import Modal from 'react-native-modal';
import { useNavigation, useRoute } from '@react-navigation/native';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import { colors, typography, shadows, borderRadius, spacing } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';

const ShowPromptsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [prompts, setPrompts] = useState([]);
  const promptss = [
    {
      id: '0',
      name: 'About me',
      icon: 'person',
      questions: [
        {
          id: '10',
          question: 'A random fact I love is',
        },
        {
          id: '11',
          question: 'Typical Sunday',
        },
        {
          id: '12',
          question: 'I go crazy for',
        },
        {
          id: '13',
          question: 'Unusual Skills',
        },
        {
          id: '14',
          question: 'My greatest strength',
        },
        {
          id: '15',
          question: 'My simple pleasures',
        },
        {
          id: '16',
          question: 'A life goal of mine',
        },
        {
          id: '17',
          question: 'My love language is',
        },
        {
          id: '18',
          question: 'I get way too excited about',
        },
      ],
    },
    {
      id: '1',
      name: 'Self Care',
      icon: 'spa',
      questions: [
        {
          id: '20',
          question: 'I unwind by',
        },
        {
          id: '21',
          question: 'A boundary of mine is',
        },
        {
          id: '22',
          question: 'I feel most supported when',
        },
        {
          id: '23',
          question: 'I hype myself up by',
        },
        {
          id: '24',
          question: 'To me, relaxation is',
        },
        {
          id: '25',
          question: 'I beat my blues by',
        },
        {
          id: '26',
          question: 'My skin care routine',
        },
        {
          id: '27',
          question: 'My perfect self-care day',
        },
      ],
    },
    {
      id: '2',
      name: 'Dating',
      icon: 'favorite',
      questions: [
        {
          id: '30',
          question: 'My ideal first date',
        },
        {
          id: '31',
          question: 'I\'m looking for someone who',
        },
        {
          id: '32',
          question: 'My biggest dating deal-breaker',
        },
        {
          id: '33',
          question: 'I know it\'s going to be a good date when',
        },
        {
          id: '34',
          question: 'My best date story',
        },
        {
          id: '35',
          question: 'I\'m a total romantic when it comes to',
        },
        {
          id: '36',
          question: 'My love language is',
        },
        {
          id: '37',
          question: 'I\'m attracted to people who',
        },
      ],
    },
    {
      id: '3',
      name: 'Lifestyle',
      icon: 'local-cafe',
      questions: [
        {
          id: '40',
          question: 'My perfect weekend',
        },
        {
          id: '41',
          question: 'I spend way too much money on',
        },
        {
          id: '42',
          question: 'My most controversial opinion',
        },
        {
          id: '43',
          question: 'I\'m currently obsessed with',
        },
        {
          id: '44',
          question: 'My comfort food',
        },
        {
          id: '45',
          question: 'I\'m a total foodie when it comes to',
        },
        {
          id: '46',
          question: 'My travel style',
        },
        {
          id: '47',
          question: 'My guilty pleasure',
        },
      ],
    },
    {
      id: '4',
      name: 'Fun Facts',
      icon: 'emoji-emotions',
      questions: [
        {
          id: '50',
          question: 'My most irrational fear',
        },
        {
          id: '51',
          question: 'I\'m the type of person who',
        },
        {
          id: '52',
          question: 'My most embarrassing moment',
        },
        {
          id: '53',
          question: 'I\'m weirdly good at',
        },
        {
          id: '54',
          question: 'My most controversial take',
        },
        {
          id: '55',
          question: 'I\'m a total nerd about',
        },
        {
          id: '56',
          question: 'My most useless talent',
        },
        {
          id: '57',
          question: 'I\'m the friend who always',
        },
      ],
    },
  ];
  const [option, setOption] = useState('About me');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  
  // Initialize prompts from route params if they exist
  useEffect(() => {
    if (route?.params?.prompts) {
      setPrompts(route.params.prompts);
    }
  }, [route?.params?.prompts]);
  
  const openModal = item => {
    setModalVisible(!isModalVisible);
    setQuestion(item?.question);
  };

  const addPrompt = () => {
    if (!answer.trim()) {
      return; // Don't add empty answers
    }
    const newPrompt = { question, answer: answer.trim() };
    const updatedPrompts = [...prompts, newPrompt];
    setPrompts(updatedPrompts);
    setQuestion('');
    setAnswer('');
    setModalVisible(false);
    
    // Navigate back to Prompts screen with all prompts
    navigation.navigate('Prompts', {
      prompts: updatedPrompts,
    });
  };

  const handleClose = () => {
    navigation.goBack();
  };

  console.log('question', prompts);
  
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
            <View style={styles.headerButton} />

            <Text style={styles.headerTitle}>Prompts</Text>

            <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
              <MaterialIcons name="close" size={24} color={colors.textInverse} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Category Tabs */}
          <View style={styles.categoryContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {promptss?.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.categoryTab,
                    option === item?.name && styles.categoryTabActive
                  ]}
                  onPress={() => setOption(item?.name)}>
                  <MaterialIcons 
                    name={item.icon} 
                    size={16} 
                    color={option === item?.name ? colors.textInverse : colors.textSecondary} 
                  />
                  <Text style={[
                    styles.categoryText,
                    option === item?.name && styles.categoryTextActive
                  ]}>
                    {item?.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          {/* Questions List */}
          <View style={styles.questionsContainer}>
            {promptss?.map((item) => (
              <View key={item.id}>
                {option === item?.name && (
                  <View>
                    {item?.questions?.map((questionItem) => (
                      <TouchableOpacity
                        key={questionItem.id}
                        onPress={() => openModal(questionItem)}
                        style={styles.questionItem}>
                        <Text style={styles.questionText}>
                          {questionItem.question}
                        </Text>
                        <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
      
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setModalVisible(false)}
        onHardwareBackPress={() => setModalVisible(false)}
        swipeDirection={['up', 'down']}
        swipeThreshold={200}
        onTouchOutside={() => setModalVisible(false)}
        style={styles.modal}
        avoidKeyboard={true}>
        <ScrollView 
          contentContainerStyle={styles.modalScrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Answer your question</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={colors.textSecondary} />
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
                placeholder="Enter Your Answer"
                placeholderTextColor={colors.textTertiary}
                multiline={true}
                textAlignVertical="top"
                autoFocus={true}
              />
            </View>
            <TouchableOpacity
              onPress={addPrompt}
              style={[
                styles.addButton,
                { opacity: answer.trim() ? 1 : 0.5 }
              ]}
              disabled={!answer.trim()}>
              <Text style={styles.addButtonText}>Add Answer</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
    </SafeAreaWrapper>
  );
};

export default ShowPromptsScreen;

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
    justifyContent: 'space-between',
  },
  headerButton: {
    padding: spacing.xs,
  },
  headerButtonText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.textInverse,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textInverse,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  categoryContainer: {
    marginBottom: spacing.lg,
  },
  categoryScroll: {
    flexGrow: 0,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
    borderRadius: borderRadius.round,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: spacing.xs,
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
  questionsContainer: {
    marginBottom: spacing.xl,
  },
  questionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadows.small,
  },
  questionText: {
    flex: 1,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  modal: {
    margin: spacing.lg,
    justifyContent: 'center',
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.large,
    padding: spacing.lg,
    ...shadows.large,
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
  },
  textInput: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    lineHeight: 24,
    textAlignVertical: 'top',
    flex: 1,
    fontFamily: typography.fontFamily.regular,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.round,
    alignItems: 'center',
  },
  addButtonText: {
    color: colors.textInverse,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
  },
});