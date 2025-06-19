import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Pressable,
  TextInput,
  Button,
  Modal,
  TouchableOpacity,
} from 'react-native';
import React, {useState} from 'react';
import Entypo from 'react-native-vector-icons/Entypo';
import {useNavigation} from '@react-navigation/native';

const ShowPromptsScreen = () => {
  const navigation = useNavigation();
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
          id: '10',
          question: 'I unwind by',
        },
        {
          id: '11',
          question: 'A boundary of mine is',
        },
        {
          id: '12',
          question: 'I feel most supported when',
        },
        {
          id: '13',
          question: 'I hype myself up by',
        },
        {
          id: '14',
          question: 'To me, relaxation is',
        },
        {
          id: '15',
          question: 'I beat my blues by',
        },
        {
          id: '16',
          question: 'My skin care routine',
        },
      ],
    },
  ];
  const [option, setOption] = useState('About me');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  
  const openModal = item => {
    setModalVisible(true);
    setQuestion(item?.question);
  };

  const closeModal = () => {
    setModalVisible(false);
    setQuestion('');
    setAnswer('');
  };

  const addPrompt = () => {
    if (answer.trim()) {
      const newPrompt = {question, answer};
      setPrompts([...prompts, newPrompt]);
      setQuestion('');
      setAnswer('');
      setModalVisible(false);
      
      if (prompts.length === 2) { // Changed from 3 to 2 since we're adding one more
        navigation.navigate('Prompts', {
          prompts: [...prompts, newPrompt],
        });
      }
    }
  };

  console.log('question', prompts);
  
  return (
    <>
      <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
        <View
          style={{
            padding: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Text style={{fontSize: 15, fontWeight: '500', color: '#581845'}}>
            View all
          </Text>

          <Text style={{fontSize: 16, fontWeight: 'bold', color: '#581845'}}>
            Prompts
          </Text>

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Entypo name="cross" size={22} color="black" />
          </TouchableOpacity>
        </View>

        <View
          style={{
            marginHorizontal: 10,
            marginTop: 20,
            flexDirection: 'row',
            gap: 10,
          }}>
          {promptss?.map((item, index) => (
            <View key={index}>
              <Pressable
                style={{
                  padding: 10,
                  borderRadius: 20,
                  backgroundColor: option == item?.name ? '#581845' : 'white',
                  borderWidth: 1,
                  borderColor: option == item?.name ? '#581845' : '#ddd',
                }}
                onPress={() => setOption(item?.name)}>
                <Text
                  style={{
                    textAlign: 'center',
                    color: option == item?.name ? 'white' : 'black',
                  }}>
                  {item?.name}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
        
        <View style={{marginTop: 20, marginHorizontal: 12}}>
          {promptss?.map((item, index) => (
            <View key={index}>
              {option === item?.name && (
                <View>
                  {item?.questions?.map((question, questionIndex) => (
                    <Pressable
                      onPress={() => openModal(question)}
                      style={{
                        marginVertical: 12,
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        backgroundColor: '#f8f9fa',
                        borderRadius: 8,
                      }}
                      key={questionIndex}>
                      <Text style={{fontSize: 15, fontWeight: '500'}}>
                        {question.question}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      </SafeAreaView>

      {/* Custom Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Answer your question</Text>
              <TouchableOpacity onPress={closeModal}>
                <Entypo name="cross" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.questionText}>{question}</Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                value={answer}
                onChangeText={text => setAnswer(text)}
                style={styles.textInput}
                placeholder="Enter Your Answer"
                multiline={true}
                numberOfLines={4}
              />
            </View>
            
            <TouchableOpacity
              style={styles.addButton}
              onPress={addPrompt}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default ShowPromptsScreen;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  inputContainer: {
    borderColor: '#202020',
    borderWidth: 1,
    borderRadius: 10,
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  textInput: {
    padding: 15,
    fontSize: 16,
    color: '#333',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  addButton: {
    backgroundColor: '#581845',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
