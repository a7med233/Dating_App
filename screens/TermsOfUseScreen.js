import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { colors, typography, spacing } from '../theme/colors';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const TermsOfUseScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaWrapper backgroundColor="#fff" style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.backgroundSecondary,
      }}>
        <Pressable onPress={() => navigation.goBack()} style={{ marginRight: spacing.md }}>
          <AntDesign name="arrowleft" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={{
          fontSize: typography.fontSize.xl,
          fontFamily: typography.fontFamily.bold,
          color: colors.textPrimary,
        }}>
          Terms of Use
        </Text>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: spacing.lg }}>
        <View style={{ paddingVertical: spacing.lg }}>
          <Text style={{
            fontSize: typography.fontSize.lg,
            fontFamily: typography.fontFamily.bold,
            color: colors.textPrimary,
            marginBottom: spacing.md,
          }}>
            Welcome to Lashwa!
          </Text>

          <Text style={{
            fontSize: typography.fontSize.md,
            fontFamily: typography.fontFamily.regular,
            color: colors.textSecondary,
            lineHeight: 24,
            marginBottom: spacing.md,
          }}>
            By accessing or using the Lashwa Services, you agree to this Terms of Use Agreement ("Terms" or "Agreement"), including our Privacy Policy, Community Guidelines, and Safety Tips, so it is important that you read this Agreement and these policies and procedures carefully before creating an account.
          </Text>

          <Text style={{
            fontSize: typography.fontSize.md,
            fontFamily: typography.fontFamily.bold,
            color: colors.textPrimary,
            marginTop: spacing.lg,
            marginBottom: spacing.sm,
          }}>
            INTRODUCTION
          </Text>

          <Text style={{
            fontSize: typography.fontSize.md,
            fontFamily: typography.fontFamily.regular,
            color: colors.textSecondary,
            lineHeight: 24,
            marginBottom: spacing.md,
          }}>
            These Terms of Use apply between you and Lashwa, LLC ("Lashwa") located at 123 Dating Street, Love City, LC 12345, USA. The terms "us," "we," "company," and/or "Lashwa" refer to Lashwa LLC. You and Lashwa may be referred to collectively as the "Parties," or individually as a "Party."
          </Text>

          <Text style={{
            fontSize: typography.fontSize.md,
            fontFamily: typography.fontFamily.regular,
            color: colors.textSecondary,
            lineHeight: 24,
            marginBottom: spacing.md,
          }}>
            By accessing or using our Services through the Lashwa mobile app (the "App") or any other platforms or services that Lashwa may offer (collectively, the "Service" or our "Services"), you agree to be bound by this Agreement. This Agreement applies to everyone who accesses or uses our Services, regardless of registration or subscription status.
          </Text>

          <Text style={{
            fontSize: typography.fontSize.md,
            fontFamily: typography.fontFamily.bold,
            color: colors.textPrimary,
            marginTop: spacing.lg,
            marginBottom: spacing.sm,
          }}>
            ACCOUNT ELIGIBILITY; YOUR RESPONSIBILITIES
          </Text>

          <Text style={{
            fontSize: typography.fontSize.md,
            fontFamily: typography.fontFamily.regular,
            color: colors.textSecondary,
            lineHeight: 24,
            marginBottom: spacing.md,
          }}>
            You may not create an account or use the Services if all of the following is not true, and by using our Services, you represent and warrant that:
          </Text>

          <View style={{ marginLeft: spacing.md, marginBottom: spacing.md }}>
            <Text style={{
              fontSize: typography.fontSize.md,
              fontFamily: typography.fontFamily.regular,
              color: colors.textSecondary,
              lineHeight: 24,
              marginBottom: spacing.xs,
            }}>
              • You are an individual (i.e. not a legal entity, partnership or other commercial organization) and are at least 18 years of age;
            </Text>
            <Text style={{
              fontSize: typography.fontSize.md,
              fontFamily: typography.fontFamily.regular,
              color: colors.textSecondary,
              lineHeight: 24,
              marginBottom: spacing.xs,
            }}>
              • You meet the legal requirements to form a binding contract with Lashwa;
            </Text>
            <Text style={{
              fontSize: typography.fontSize.md,
              fontFamily: typography.fontFamily.regular,
              color: colors.textSecondary,
              lineHeight: 24,
              marginBottom: spacing.xs,
            }}>
              • You are not located in a country that is subject to a U.S. government embargo or that has been designated by the U.S. government as a "terrorist supporting" country;
            </Text>
            <Text style={{
              fontSize: typography.fontSize.md,
              fontFamily: typography.fontFamily.regular,
              color: colors.textSecondary,
              lineHeight: 24,
              marginBottom: spacing.xs,
            }}>
              • You do not have more than one account on our Services;
            </Text>
            <Text style={{
              fontSize: typography.fontSize.md,
              fontFamily: typography.fontFamily.regular,
              color: colors.textSecondary,
              lineHeight: 24,
              marginBottom: spacing.xs,
            }}>
              • We or our affiliates have not previously removed you from our Services unless you have our express written permission to create a new account.
            </Text>
          </View>

          <Text style={{
            fontSize: typography.fontSize.md,
            fontFamily: typography.fontFamily.bold,
            color: colors.textPrimary,
            marginTop: spacing.lg,
            marginBottom: spacing.sm,
          }}>
            PROHIBITED ACTIVITIES
          </Text>

          <Text style={{
            fontSize: typography.fontSize.md,
            fontFamily: typography.fontFamily.regular,
            color: colors.textSecondary,
            lineHeight: 24,
            marginBottom: spacing.md,
          }}>
            You agree that you will not do the following:
          </Text>

          <View style={{ marginLeft: spacing.md, marginBottom: spacing.md }}>
            <Text style={{
              fontSize: typography.fontSize.md,
              fontFamily: typography.fontFamily.regular,
              color: colors.textSecondary,
              lineHeight: 24,
              marginBottom: spacing.xs,
            }}>
              • Provide false information about your identity, age, or affiliation;
            </Text>
            <Text style={{
              fontSize: typography.fontSize.md,
              fontFamily: typography.fontFamily.regular,
              color: colors.textSecondary,
              lineHeight: 24,
              marginBottom: spacing.xs,
            }}>
              • Use the Services in a manner that damages the Services or interferes with their use by other users;
            </Text>
            <Text style={{
              fontSize: typography.fontSize.md,
              fontFamily: typography.fontFamily.regular,
              color: colors.textSecondary,
              lineHeight: 24,
              marginBottom: spacing.xs,
            }}>
              • Harass, bully, stalk, intimidate, assault, defame, harm, or otherwise abuse anyone;
            </Text>
            <Text style={{
              fontSize: typography.fontSize.md,
              fontFamily: typography.fontFamily.regular,
              color: colors.textSecondary,
              lineHeight: 24,
              marginBottom: spacing.xs,
            }}>
              • Post or share inappropriate or prohibited content;
            </Text>
            <Text style={{
              fontSize: typography.fontSize.md,
              fontFamily: typography.fontFamily.regular,
              color: colors.textSecondary,
              lineHeight: 24,
              marginBottom: spacing.xs,
            }}>
              • Use another user's account;
            </Text>
            <Text style={{
              fontSize: typography.fontSize.md,
              fontFamily: typography.fontFamily.regular,
              color: colors.textSecondary,
              lineHeight: 24,
              marginBottom: spacing.xs,
            }}>
              • Use our Services for any harmful, illegal or malicious purpose.
            </Text>
          </View>

          <Text style={{
            fontSize: typography.fontSize.md,
            fontFamily: typography.fontFamily.bold,
            color: colors.textPrimary,
            marginTop: spacing.lg,
            marginBottom: spacing.sm,
          }}>
            CONTENT GUIDELINES
          </Text>

          <Text style={{
            fontSize: typography.fontSize.md,
            fontFamily: typography.fontFamily.regular,
            color: colors.textSecondary,
            lineHeight: 24,
            marginBottom: spacing.md,
          }}>
            Lashwa prohibits uploading or sharing content that:
          </Text>

          <View style={{ marginLeft: spacing.md, marginBottom: spacing.md }}>
            <Text style={{
              fontSize: typography.fontSize.md,
              fontFamily: typography.fontFamily.regular,
              color: colors.textSecondary,
              lineHeight: 24,
              marginBottom: spacing.xs,
            }}>
              • May reasonably be construed as insulting, harassing, abusive or causing psychological distress;
            </Text>
            <Text style={{
              fontSize: typography.fontSize.md,
              fontFamily: typography.fontFamily.regular,
              color: colors.textSecondary,
              lineHeight: 24,
              marginBottom: spacing.xs,
            }}>
              • Is obscene, pornographic, violent or contains nudity;
            </Text>
            <Text style={{
              fontSize: typography.fontSize.md,
              fontFamily: typography.fontFamily.regular,
              color: colors.textSecondary,
              lineHeight: 24,
              marginBottom: spacing.xs,
            }}>
              • Is offensive, threatening, discriminatory, or promotes hatred or intolerance;
            </Text>
            <Text style={{
              fontSize: typography.fontSize.md,
              fontFamily: typography.fontFamily.regular,
              color: colors.textSecondary,
              lineHeight: 24,
              marginBottom: spacing.xs,
            }}>
              • Encourages or promotes any illegal activity;
            </Text>
            <Text style={{
              fontSize: typography.fontSize.md,
              fontFamily: typography.fontFamily.regular,
              color: colors.textSecondary,
              lineHeight: 24,
              marginBottom: spacing.xs,
            }}>
              • Relates to commercial activity or solicitation;
            </Text>
            <Text style={{
              fontSize: typography.fontSize.md,
              fontFamily: typography.fontFamily.regular,
              color: colors.textSecondary,
              lineHeight: 24,
              marginBottom: spacing.xs,
            }}>
              • Involves the image or likeness of another person without that person's consent.
            </Text>
          </View>

          <Text style={{
            fontSize: typography.fontSize.md,
            fontFamily: typography.fontFamily.bold,
            color: colors.textPrimary,
            marginTop: spacing.lg,
            marginBottom: spacing.sm,
          }}>
            PRIVACY AND DATA
          </Text>

          <Text style={{
            fontSize: typography.fontSize.md,
            fontFamily: typography.fontFamily.regular,
            color: colors.textSecondary,
            lineHeight: 24,
            marginBottom: spacing.md,
          }}>
            For information about how Lashwa collects, uses, and shares your personal information, please review our Privacy Policy. By using our Services, you agree that we may use your personal information in accordance with our Privacy Policy.
          </Text>

          <Text style={{
            fontSize: typography.fontSize.md,
            fontFamily: typography.fontFamily.bold,
            color: colors.textPrimary,
            marginTop: spacing.lg,
            marginBottom: spacing.sm,
          }}>
            ACCOUNT TERMINATION
          </Text>

          <Text style={{
            fontSize: typography.fontSize.md,
            fontFamily: typography.fontFamily.regular,
            color: colors.textSecondary,
            lineHeight: 24,
            marginBottom: spacing.md,
          }}>
            You can delete your account at any time by logging into the App, going to Settings, and following the instructions to complete the deletion process. Lashwa reserves the right to investigate and, if necessary, suspend or terminate your account if Lashwa believes that you have violated these Terms, misused our Services, or engaged in conduct that Lashwa deems inappropriate or illegal.
          </Text>

          <Text style={{
            fontSize: typography.fontSize.md,
            fontFamily: typography.fontFamily.bold,
            color: colors.textPrimary,
            marginTop: spacing.lg,
            marginBottom: spacing.sm,
          }}>
            SAFETY DISCLAIMER
          </Text>

          <Text style={{
            fontSize: typography.fontSize.md,
            fontFamily: typography.fontFamily.regular,
            color: colors.textSecondary,
            lineHeight: 24,
            marginBottom: spacing.md,
          }}>
            Lashwa does not conduct criminal background checks or identity checks on its users. While Lashwa strives to promote respectful user experience, it is not responsible for the conduct of any user on or off the Service. Please exercise caution when interacting with others and review our safety tips.
          </Text>

          <Text style={{
            fontSize: typography.fontSize.md,
            fontFamily: typography.fontFamily.regular,
            color: colors.textSecondary,
            lineHeight: 24,
            marginBottom: spacing.md,
          }}>
            YOU ARE SOLELY RESPONSIBLE FOR YOUR INTERACTIONS WITH OTHER USERS. WE CANNOT AND DO NOT GUARANTEE YOUR SAFETY AND ARE NOT A SUBSTITUTE FOR FOLLOWING SAFETY ADVICE OR OTHER REASONABLE PRECAUTIONS.
          </Text>

          <Text style={{
            fontSize: typography.fontSize.md,
            fontFamily: typography.fontFamily.bold,
            color: colors.textPrimary,
            marginTop: spacing.lg,
            marginBottom: spacing.sm,
          }}>
            LIMITATION OF LIABILITY
          </Text>

          <Text style={{
            fontSize: typography.fontSize.md,
            fontFamily: typography.fontFamily.regular,
            color: colors.textSecondary,
            lineHeight: 24,
            marginBottom: spacing.md,
          }}>
            TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT WILL LASHWA, ITS AFFILIATES, EMPLOYEES, LICENSORS OR SERVICE PROVIDERS BE LIABLE FOR ANY INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, PUNITIVE OR CONSEQUENTIAL DAMAGES, INCLUDING, BUT NOT LIMITED TO, DIRECT OR INDIRECT LOSS OF PROFITS, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
          </Text>

          <Text style={{
            fontSize: typography.fontSize.md,
            fontFamily: typography.fontFamily.bold,
            color: colors.textPrimary,
            marginTop: spacing.lg,
            marginBottom: spacing.sm,
          }}>
            CHANGES TO TERMS
          </Text>

          <Text style={{
            fontSize: typography.fontSize.md,
            fontFamily: typography.fontFamily.regular,
            color: colors.textSecondary,
            lineHeight: 24,
            marginBottom: spacing.md,
          }}>
            We may update these Terms from time to time, so please check this page regularly for updates. Your continued access or use of our Services constitutes your continued acceptance of any changes, and as a result, you will be legally bound by the updated Terms.
          </Text>

          <Text style={{
            fontSize: typography.fontSize.md,
            fontFamily: typography.fontFamily.bold,
            color: colors.textPrimary,
            marginTop: spacing.lg,
            marginBottom: spacing.sm,
          }}>
            CONTACT INFORMATION
          </Text>

          <Text style={{
            fontSize: typography.fontSize.md,
            fontFamily: typography.fontFamily.regular,
            color: colors.textSecondary,
            lineHeight: 24,
            marginBottom: spacing.lg,
          }}>
            If you have any questions about these Terms of Use, please contact us at:
          </Text>

          <Text style={{
            fontSize: typography.fontSize.md,
            fontFamily: typography.fontFamily.regular,
            color: colors.textSecondary,
            lineHeight: 24,
            marginBottom: spacing.xl,
          }}>
            Lashwa, LLC{'\n'}
            123 Dating Street{'\n'}
            Love City, LC 12345{'\n'}
            USA{'\n'}
            Email: legal@lashwa.com
          </Text>

          <Text style={{
            fontSize: typography.fontSize.sm,
            fontFamily: typography.fontFamily.regular,
            color: colors.textSecondary,
            lineHeight: 20,
            marginBottom: spacing.xl,
            textAlign: 'center',
          }}>
            Last updated: {new Date().toLocaleDateString()}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
};

export default TermsOfUseScreen; 