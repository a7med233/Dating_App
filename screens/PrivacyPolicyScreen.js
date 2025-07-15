import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, shadows, borderRadius, spacing } from '../theme/colors';
import SafeAreaWrapper from '../components/SafeAreaWrapper';

const PrivacyPolicyScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaWrapper backgroundColor={colors.background} style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.cardBorder,
        backgroundColor: colors.background,
      }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            padding: spacing.xs,
            borderRadius: borderRadius.medium,
          }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={{
          fontSize: typography.fontSize.lg,
          fontFamily: typography.fontFamily.bold,
          color: colors.textPrimary,
          marginLeft: spacing.md,
        }}>
          Privacy Policy
        </Text>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Privacy Policy</Text>
          
          <Text style={styles.subtitle}>Lashwa Privacy Policy</Text>
          
          <Text style={styles.paragraph}>
            At Lashwa, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our dating app and related services.
          </Text>

          <Text style={styles.sectionTitle}>INFORMATION WE COLLECT</Text>
          
          <Text style={styles.subsectionTitle}>Personal Information</Text>
          <Text style={styles.paragraph}>
            We collect information you provide directly to us, including:
          </Text>
          <Text style={styles.bulletPoint}>• Name, email address, and password</Text>
          <Text style={styles.bulletPoint}>• Date of birth and age</Text>
          <Text style={styles.bulletPoint}>• Gender, sexual orientation, and dating preferences</Text>
          <Text style={styles.bulletPoint}>• Location information and hometown</Text>
          <Text style={styles.bulletPoint}>• Photos and profile information</Text>
          <Text style={styles.bulletPoint}>• Bio, prompts, and other profile details</Text>
          <Text style={styles.bulletPoint}>• Communication preferences and settings</Text>

          <Text style={styles.subsectionTitle}>Usage Information</Text>
          <Text style={styles.paragraph}>
            We automatically collect certain information about your use of our services, including:
          </Text>
          <Text style={styles.bulletPoint}>• App usage patterns and interactions</Text>
          <Text style={styles.bulletPoint}>• Likes, matches, and messaging activity</Text>
          <Text style={styles.bulletPoint}>• Device information and app performance data</Text>
          <Text style={styles.bulletPoint}>• Location data (with your consent)</Text>

          <Text style={styles.sectionTitle}>HOW WE USE YOUR INFORMATION</Text>
          <Text style={styles.paragraph}>
            We use the information we collect to:
          </Text>
          <Text style={styles.bulletPoint}>• Provide, maintain, and improve our dating services</Text>
          <Text style={styles.bulletPoint}>• Match you with other users based on your preferences</Text>
          <Text style={styles.bulletPoint}>• Enable communication between matched users</Text>
          <Text style={styles.bulletPoint}>• Send you notifications and updates about our services</Text>
          <Text style={styles.bulletPoint}>• Ensure the safety and security of our community</Text>
          <Text style={styles.bulletPoint}>• Detect and prevent fraud, abuse, and violations of our terms</Text>
          <Text style={styles.bulletPoint}>• Comply with legal obligations and enforce our policies</Text>

          <Text style={styles.sectionTitle}>INFORMATION SHARING AND DISCLOSURE</Text>
          <Text style={styles.paragraph}>
            We may share your information in the following circumstances:
          </Text>
          <Text style={styles.bulletPoint}>• With other users when you match or communicate with them</Text>
          <Text style={styles.bulletPoint}>• With service providers who help us operate our services</Text>
          <Text style={styles.bulletPoint}>• When required by law or to protect our rights and safety</Text>
          <Text style={styles.bulletPoint}>• In connection with a business transfer or merger</Text>
          <Text style={styles.bulletPoint}>• With your consent or at your direction</Text>

          <Text style={styles.sectionTitle}>DATA SECURITY</Text>
          <Text style={styles.paragraph}>
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
          </Text>

          <Text style={styles.sectionTitle}>YOUR RIGHTS AND CHOICES</Text>
          <Text style={styles.paragraph}>
            You have the following rights regarding your personal information:
          </Text>
          <Text style={styles.bulletPoint}>• Access and review your personal information</Text>
          <Text style={styles.bulletPoint}>• Update or correct your information through the app</Text>
          <Text style={styles.bulletPoint}>• Delete your account and associated data</Text>
          <Text style={styles.bulletPoint}>• Control your privacy settings and visibility preferences</Text>
          <Text style={styles.bulletPoint}>• Opt out of certain communications and notifications</Text>

          <Text style={styles.sectionTitle}>DATA RETENTION</Text>
          <Text style={styles.paragraph}>
            We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this Privacy Policy. When you delete your account, we will delete or anonymize your personal information, except where we need to retain certain information for legal, security, or business purposes.
          </Text>

          <Text style={styles.sectionTitle}>CHILDREN'S PRIVACY</Text>
          <Text style={styles.paragraph}>
            Our services are not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
          </Text>

          <Text style={styles.sectionTitle}>INTERNATIONAL DATA TRANSFERS</Text>
          <Text style={styles.paragraph}>
            Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards to protect your information.
          </Text>

          <Text style={styles.sectionTitle}>CHANGES TO THIS PRIVACY POLICY</Text>
          <Text style={styles.paragraph}>
            We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy in the app and updating the "Last updated" date. Your continued use of our services after such changes constitutes acceptance of the updated Privacy Policy.
          </Text>

          <Text style={styles.sectionTitle}>CONTACT US</Text>
          <Text style={styles.paragraph}>
            If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
          </Text>
          <Text style={styles.paragraph}>
            Kashmir Traders Ltd.{'\n'}
            Headquarters : 1081 Budapest, Népszínház Street 21. Ground floor{'\n'}
            Company registration number : 01-09-350580{'\n'}
            Tax number : 27121267-2-42{'\n'}
            Registered with the Metropolitan Tribunal At the Commercial Court .{'\n'}
            Email: info@lashwa.com
          </Text>

          <Text style={styles.lastUpdated}>
            Last updated: 2025-07-15
          </Text>
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  subsectionTitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  paragraph: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.textPrimary,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  bulletPoint: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.textPrimary,
    lineHeight: 24,
    marginBottom: spacing.xs,
    marginLeft: spacing.md,
  },
  lastUpdated: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: spacing.lg,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default PrivacyPolicyScreen; 