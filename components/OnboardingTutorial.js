import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const OnboardingTutorial = ({ onComplete, visible }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const tutorialSteps = [
    {
      id: 0,
      title: 'Welcome to Lashwa!',
      subtitle: 'Your journey to meaningful connections starts here',
      description: 'We\'re excited to help you find your perfect match. Let\'s get you started with a quick tour.',
      icon: 'heart',
      iconColor: '#581845',
      backgroundColor: '#FFF5F5',
    },
    {
      id: 1,
      title: 'Create Your Profile',
      subtitle: 'Show the real you',
      description: 'Add your best photos, answer fun prompts, and tell your story. The more authentic you are, the better your matches will be.',
      icon: 'person',
      iconColor: '#007AFF',
      backgroundColor: '#F0F8FF',
    },
    {
      id: 2,
      title: 'Discover Matches',
      subtitle: 'Find your perfect connection',
      description: 'Browse through profiles and like the ones that catch your eye. When it\'s mutual, it\'s a match!',
      icon: 'search',
      iconColor: '#34C759',
      backgroundColor: '#F0FFF4',
    },
    {
      id: 3,
      title: 'Start Conversations',
      subtitle: 'Break the ice naturally',
      description: 'Once you match, start chatting! Use our conversation starters or just be yourself.',
      icon: 'chat',
      iconColor: '#FF9500',
      backgroundColor: '#FFF8F0',
    },
    {
      id: 4,
      title: 'Stay Safe',
      subtitle: 'Your safety is our priority',
      description: 'Always meet in public places, trust your instincts, and report any concerning behavior. We\'re here to help.',
      icon: 'shield-check',
      iconColor: '#FF3B30',
      backgroundColor: '#FFF0F0',
    },
    {
      id: 5,
      title: "You're All Set!",
      subtitle: 'Ready to find your match?',
      description: 'Your profile is ready to go! Start swiping and discover amazing people around you.',
      icon: 'check-circle',
      iconColor: '#581845',
      backgroundColor: '#F0F0FF',
    },
  ];

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, currentStep]);

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTutorial = () => {
    onComplete();
  };

  const currentStepData = tutorialSteps[currentStep];

  if (!visible) return null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={skipTutorial} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
        
        <View style={styles.progressContainer}>
          {tutorialSteps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index === currentStep && styles.progressDotActive,
              ]}
            />
          ))}
        </View>
      </View>

      {/* Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}>
        <View style={[styles.iconContainer, { backgroundColor: currentStepData.backgroundColor }]}>
          <MaterialCommunityIcons
            name={currentStepData.icon}
            size={60}
            color={currentStepData.iconColor}
          />
        </View>

        <Text style={styles.title}>{currentStepData.title}</Text>
        <Text style={styles.subtitle}>{currentStepData.subtitle}</Text>
        <Text style={styles.description}>{currentStepData.description}</Text>
      </Animated.View>

      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity
          onPress={previousStep}
          style={[
            styles.navButton,
            currentStep === 0 && styles.navButtonDisabled,
          ]}
          disabled={currentStep === 0}>
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={currentStep === 0 ? '#ccc' : '#581845'}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={nextStep} style={styles.nextButton}>
          <Text style={styles.nextButtonText}>
            {currentStep === tutorialSteps.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <MaterialIcons
            name={currentStep === tutorialSteps.length - 1 ? 'check' : 'arrow-forward'}
            size={20}
            color="white"
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 20 : 20,
    paddingBottom: 20,
  },
  skipButton: {
    padding: 10,
  },
  skipText: {
    color: '#581845',
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  progressDotActive: {
    backgroundColor: '#581845',
    width: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#581845',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  navButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonDisabled: {
    backgroundColor: '#F0F0F0',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#581845',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    gap: 8,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OnboardingTutorial; 