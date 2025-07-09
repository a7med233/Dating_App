import {StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  Button,
  Platform,
  StatusBar,} from 'react-native';
import React, { useState, useEffect } from 'react';
import { Entypo } from '@expo/vector-icons';
import Modal from 'react-native-modal';
import { useNavigation, useRoute } from '@react-navigation/native';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import { colors, typography, shadows, borderRadius, spacing } from '../theme/colors';

const ShowPromptsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [prompts, setPrompts] = useState([]);
  const promptss = [
    {
      id: '0',
      name: 'About me',
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
          question: 'My greatest strenght',
        },
        {
          id: '15',
          question: 'My simple pleasures',
        },
        {
          id: '16',
          question: 'A life goal of mine',
        },
      ],
    },
    {
      id: '2',
      name: 'Self Care',
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

  console.log('question', prompts);
  
  return (
    <SafeAreaWrapper backgroundColor={colors.background} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={{backgroundColor:'#fff', ...styles.content}}>
        <View
          style={{
            padding: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Text style={{ fontSize: typography.fontSize.md, fontFamily: typography.fontFamily.medium, color: colors.primary }}>
            View all
          </Text>

          <Text style={{ fontSize: typography.fontSize.md, fontFamily: typography.fontFamily.bold, color: colors.primary }}>
            Prompts
          </Text>

          <Entypo name="cross" size={22} color="black" />
        </View>

        <View
          style={{
            marginHorizontal: 10,
            marginTop: spacing.lg,
            flexDirection: 'row',
            gap: 10,
          }}>
          {promptss?.map((item) => (
            <View key={item.id}>
              <Pressable
                style={{
                  padding: 10,
                  borderRadius: borderRadius.xlarge,
                  backgroundColor: option == item?.name ? colors.primary : colors.textInverse,
                  borderWidth: 1,
                  borderColor: option == item?.name ? colors.primary : '#ddd',
                }}
                onPress={() => setOption(item?.name)}>
                <Text
                  style={{
                    textAlign: 'center',
                    color: option == item?.name ? colors.textInverse : colors.textPrimary,
                    fontFamily: typography.fontFamily.medium,
                  }}>
                  {item?.name}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
        
        <View style={{ marginTop: spacing.lg, marginHorizontal: 12 }}>
          {promptss?.map((item) => (
            <View key={item.id}>
              {option === item?.name && (
                <View>
                  {item?.questions?.map((questionItem) => (
                    <Pressable
                      key={questionItem.id}
                      onPress={() => openModal(questionItem)}
                      style={styles.questionItem}>
                      <Text style={styles.questionText}>
                        {questionItem.question}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      </View>
      
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setModalVisible(false)}
        onHardwareBackPress={() => setModalVisible(false)}
        swipeDirection={['up', 'down']}
        swipeThreshold={200}
        onTouchOutside={() => setModalVisible(false)}
        style={styles.modal}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            Answer your question
          </Text>
          <Text style={styles.questionTitle}>
            {question}
          </Text>
          <View style={styles.textInputContainer}>
            <TextInput
              value={answer}
              onChangeText={text => setAnswer(text)}
              style={styles.textInput}
              placeholder="Enter Your Answer"
              placeholderTextColor="#999"
              multiline={true}
              textAlignVertical="top"
              autoFocus={true}
            />
          </View>
          <Pressable
            onPress={addPrompt}
            style={[
              styles.addButton,
              { opacity: answer.trim() ? 1 : 0.5 }
            ]}
            disabled={!answer.trim()}>
            <Text style={styles.addButtonText}>Add Answer</Text>
          </Pressable>
        </View>
      </Modal>
    </SafeAreaWrapper>
  );
};

export default ShowPromptsScreen;

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
  questionItem: {
    marginVertical: 12,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    backgroundColor: '#f8f9fa',
    borderRadius: borderRadius.small,
  },
  questionText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
  },
  modal: {
    margin: 20,
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: colors.textInverse,
    borderRadius: borderRadius.large,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    textAlign: 'center',
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.md,
    marginBottom: spacing.md,
    color: colors.textPrimary,
  },
  questionTitle: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  textInputContainer: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: borderRadius.medium,
    padding: 15,
    marginVertical: 12,
    backgroundColor: '#f8f9fa',
    minHeight: 120,
  },
  textInput: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    lineHeight: 24,
    textAlignVertical: 'top',
    flex: 1,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.round,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  addButtonText: {
    color: colors.textInverse,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
  },
});