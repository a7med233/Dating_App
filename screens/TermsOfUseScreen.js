import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, shadows, borderRadius, spacing } from '../theme/colors';
import SafeAreaWrapper from '../components/SafeAreaWrapper';

const TermsOfUseScreen = () => {
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
          Terms of Use
        </Text>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Terms of Use</Text>
          
          <Text style={styles.paragraph}>
            Welcome to Lashwa!
          </Text>
          
          <Text style={styles.paragraph}>
            By accessing or using the Lashwa Services, you agree to this Terms of Use Agreement ("Terms" or "Agreement"), including our Privacy Policy, Community Guidelines, and Safety Tips, so it is important that you read this Agreement and these policies and procedures carefully before creating an account.
          </Text>

          <Text style={styles.sectionTitle}>INTRODUCTION</Text>
          <Text style={styles.paragraph}>
            These Terms of Use apply between you and Kashmir Traders Kft.
          </Text>
          <Text style={styles.paragraph}>
            Headquarters : 1081 Budapest, Népszínház Street 21. Ground floor{'\n'}
            Company registration number : 01-09-350580{'\n'}
            Tax number : 27121267-2-42{'\n'}
            Registered with the Metropolitan Tribunal At the Commercial Court .
          </Text>
          <Text style={styles.paragraph}>
            The terms "us," "we," "company," and/or "Lashwa" refer to Kashmir Traders Kft. You and Lashwa may be referred to collectively as the "Parties," or individually as a "Party."
          </Text>
          <Text style={styles.paragraph}>
            By accessing or using our Services through the Lashwa mobile app (the "App") or any other platforms or services that Lashwa may offer (collectively, the "Service" or our "Services"), you agree to be bound by this Agreement. This Agreement applies to everyone who accesses or uses our Services, regardless of registration or subscription status.
          </Text>

          <Text style={styles.sectionTitle}>ACCOUNT ELIGIBILITY; YOUR RESPONSIBILITIES</Text>
          <Text style={styles.paragraph}>
            You may not create an account or use the Services if all of the following is not true, and by using our Services, you represent and warrant that:
          </Text>
          <Text style={styles.bulletPoint}>• You are an individual (i.e. not a legal entity, partnership or other commercial organization) and are at least 18 years of age;</Text>
          <Text style={styles.bulletPoint}>• You meet the legal requirements to form a binding contract with Lashwa;</Text>
          <Text style={styles.bulletPoint}>• You are not located in a country that is subject to a U.S. government embargo or that has been designated by the U.S. government as a "terrorist supporting" country;</Text>
          <Text style={styles.bulletPoint}>• You do not have more than one account on our Services;</Text>
          <Text style={styles.bulletPoint}>• We or our affiliates have not previously removed you from our Services unless you have our express written permission to create a new account.</Text>

          <Text style={styles.sectionTitle}>PROHIBITED ACTIVITIES</Text>
          <Text style={styles.paragraph}>
            You agree that you will not do the following:
          </Text>
          <Text style={styles.bulletPoint}>• Provide false information about your identity, age, or affiliation;</Text>
          <Text style={styles.bulletPoint}>• Use the Services in a manner that damages the Services or interferes with their use by other users;</Text>
          <Text style={styles.bulletPoint}>• Harass, bully, stalk, intimidate, assault, defame, harm, or otherwise abuse anyone;</Text>
          <Text style={styles.bulletPoint}>• Post or share inappropriate or prohibited content;</Text>
          <Text style={styles.bulletPoint}>• Use another user's account;</Text>
          <Text style={styles.bulletPoint}>• Use our Services for any harmful, illegal or malicious purpose.</Text>

          <Text style={styles.sectionTitle}>CONTENT GUIDELINES</Text>
          <Text style={styles.paragraph}>
            Lashwa prohibits uploading or sharing content that:
          </Text>
          <Text style={styles.bulletPoint}>• May reasonably be construed as insulting, harassing, abusive or causing psychological distress;</Text>
          <Text style={styles.bulletPoint}>• Is obscene, pornographic, violent or contains nudity;</Text>
          <Text style={styles.bulletPoint}>• Is offensive, threatening, discriminatory, or promotes hatred or intolerance;</Text>
          <Text style={styles.bulletPoint}>• Encourages or promotes any illegal activity;</Text>
          <Text style={styles.bulletPoint}>• Relates to commercial activity or solicitation;</Text>
          <Text style={styles.bulletPoint}>• Involves the image or likeness of another person without that person's consent.</Text>

          <Text style={styles.sectionTitle}>PRIVACY AND DATA</Text>
          <Text style={styles.paragraph}>
            For information about how Lashwa collects, uses, and shares your personal information, please review our Privacy Policy. By using our Services, you agree that we may use your personal information in accordance with our Privacy Policy.
          </Text>

          <Text style={styles.sectionTitle}>ACCOUNT TERMINATION</Text>
          <Text style={styles.paragraph}>
            You can delete your account at any time by logging into the App, going to Settings, and following the instructions to complete the deletion process. Lashwa reserves the right to investigate and, if necessary, suspend or terminate your account if Lashwa believes that you have violated these Terms, misused our Services, or engaged in conduct that Lashwa deems inappropriate or illegal.
          </Text>

          <Text style={styles.sectionTitle}>SAFETY DISCLAIMER</Text>
          <Text style={styles.paragraph}>
            Lashwa does not conduct criminal background checks or identity checks on its users. While Lashwa strives to promote respectful user experience, it is not responsible for the conduct of any user on or off the Service. Please exercise caution when interacting with others and review our safety tips.
          </Text>
          <Text style={styles.paragraph}>
            YOU ARE SOLELY RESPONSIBLE FOR YOUR INTERACTIONS WITH OTHER USERS. WE CANNOT AND DO NOT GUARANTEE YOUR SAFETY AND ARE NOT A SUBSTITUTE FOR FOLLOWING SAFETY ADVICE OR OTHER REASONABLE PRECAUTIONS.
          </Text>

          <Text style={styles.sectionTitle}>LIMITATION OF LIABILITY</Text>
          <Text style={styles.paragraph}>
            TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT WILL LASHWA, ITS AFFILIATES, EMPLOYEES, LICENSORS OR SERVICE PROVIDERS BE LIABLE FOR ANY INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, PUNITIVE OR CONSEQUENTIAL DAMAGES, INCLUDING, BUT NOT LIMITED TO, DIRECT OR INDIRECT LOSS OF PROFITS, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
          </Text>

          <Text style={styles.sectionTitle}>CHANGES TO TERMS</Text>
          <Text style={styles.paragraph}>
            We may update these Terms from time to time, so please check this page regularly for updates. Your continued access or use of our Services constitutes your continued acceptance of any changes, and as a result, you will be legally bound by the updated Terms.
          </Text>

          <Text style={styles.sectionTitle}>CONTACT INFORMATION</Text>
          <Text style={styles.paragraph}>
            If you have any questions about these Terms of Use, please contact us at:
          </Text>
          <Text style={styles.paragraph}>
            Kashmir Traders Kft.{'\n'}
            Headquarters : 1081 Budapest, Népszínház Street 21. Ground floor{'\n'}
            Company registration number : 01-09-350580{'\n'}
            Tax number : 27121267-2-42{'\n'}
            Registered with the Metropolitan Tribunal At the Commercial Court .{'\n'}
            Email: info@lashwa.com
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
});

export default TermsOfUseScreen; 