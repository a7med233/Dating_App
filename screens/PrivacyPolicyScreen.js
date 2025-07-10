import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { colors, typography, spacing } from '../theme/colors';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const PrivacyPolicyScreen = () => {
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
          Privacy Policy
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
            Lashwa Privacy Policy
          </Text>

          <Text style={{
            fontSize: typography.fontSize.md,
            fontFamily: typography.fontFamily.regular,
            color: colors.textSecondary,
            lineHeight: 24,
            marginBottom: spacing.md,
          }}>
            At Lashwa, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our dating app and related services.
          </Text>

          <Text style={{
            fontSize: typography.fontSize.md,
            fontFamily: typography.fontFamily.bold,
            color: colors.textPrimary,
            marginTop: spacing.lg,
            marginBottom: spacing.sm,
          }}>
            INFORMATION WE COLLECT
          </Text>

          <Text style={{
            fontSize: typography.fontSize.md,
            fontFamily: typography.fontFamily.bold,
            color: colors.textPrimary,
            marginTop: spacing.md,
            marginBottom: spacing.sm,
          }}>
            Personal Information
          </Text>

          <Text style={{
            fontSize: typography.fontSize.md,
            fontFamily: typography.fontFamily.regular,
            color: colors.textSecondary,
            lineHeight: 24,
            marginBottom: spacing.md,
          }}>
            We collect information you provide directly to us, including:
          </Text>

          <View style={{ marginLeft: spacing.md, marginBottom: spacing.md }}>
            <Text style={{
              fontSize: typography.fontSize.md,
              fontFamily: typography.fontFamily.regular,
              color: colors.textSecondary,
              lineHeight: 24,
              marginBottom: spacing.xs,
            }}>
              • Name, email address, and password
            </Text>
            <Text style={{
              fontSize: typography.fontSize.md,
              fontFamily: typography.fontFamily.regular,
              color: colors.textSecondary,
              lineHeight: 24,
              marginBottom: spacing.xs,
            }}>
              • Date of birth and age
            </Text>
            <Text style={{
              fontSize: typography.fontSize.md,
              fontFamily: typography.fontFamily.regular,
              color: colors.textSecondary,
              lineHeight: 24,
              marginBottom: spacing.xs,
            }}>
              • Gender, sexual orientation, and dating preferences
            </Text>
            <Text style={{
              fontSize: typography.fontSize.md,
              fontFamily: typography.fontFamily.regular,
              color: colors.textSecondary,
              lineHeight: 24,
              marginBottom: spacing.xs,
            }}>
              • Location information and hometown
            </Text>
            <Text style={{
              fontSize: typography.fontSize.md,
              fontFamily: typography.fontFamily.regular,
              color: colors.textSecondary,
              lineHeight: 24,
              marginBottom: spacing.xs,
            }}>
              • Photos and profile information
            </Text>
            <Text style={{
              fontSize: typography.fontSize.md,
              fontFamily: typography.fontFamily.regular,
              color: colors.textSecondary,
              lineHeight: 24,
              marginBottom: spacing.xs,
            }}>
              • Bio, prompts, and other profile details
            </Text>
            <Text style={{
              fontSize: typography.fontSize.md,
              fontFamily: typography.fontFamily.regular,
              color: colors.textSecondary,
              lineHeight: 24,
              marginBottom: spacing.xs,
            }}>
              • Communication preferences and settings
            </Text>
          </View>

          <Text style={{
            fontSize: typography.fontSize.md,
            fontFamily: typography.fontFamily.bold,
            color: colors.textPrimary,
            marginTop: spacing.md,
            marginBottom: spacing.sm,
          }}>
            Usage Information
          </Text>

          <Text style={{
            fontSize: typography.fontSize.md,
            fontFamily: typography.fontFamily.regular,
            color: colors.textSecondary,
            lineHeight: 24,
            marginBottom: spacing.md,
          }}>
            We automatically collect certain information about your use of our services, including:
          </Text>

          <View style={{ marginLeft: spacing.md, marginBottom: spacing.md }}>
            <Text style={{
              fontSize: typography.fontSize.md,
              fontFamily: typography.fontFamily.regular,
              color: colors.textSecondary,
              lineHeight: 24,
              marginBottom: spacing.xs,
            }}>
              • App usage patterns and interactions
            </Text>
            <Text style={{
              fontSize: typography.fontSize.md,
              fontFamily: typography.fontFamily.regular,
              color: colors.textSecondary,
              lineHeight: 24,
              marginBottom: spacing.xs,
            }}>
              • Likes, matches, and messaging activity
            </Text>
            <Text style={{
              fontSize: typography.fontSize.md,
              fontFamily: typography.fontFamily.regular,
              color: colors.textSecondary,
              lineHeight: 24,
              marginBottom: spacing.xs,
            }}>
              • Device information and app performance data
            </Text>
            <Text style={{
              fontSize: typography.fontSize.md,
              fontFamily: typography.fontFamily.regular,
              color: colors.textSecondary,
              lineHeight: 24,
              marginBottom: spacing.xs,
            }}>
              • Location data (with your consent)
            </Text>
          </View>

          <Text style={{
            fontSize: typography.fontSize.md,
            fontFamily: typography.fontFamily.bold,
            color: colors.textPrimary,
            marginTop: spacing.lg,
            marginBottom: spacing.sm,
          }}>
            HOW WE USE YOUR INFORMATION
          </Text>

          <Text style={{
            fontSize: typography.fontSize.md,
            fontFamily: typography.fontFamily.regular,
            color: colors.textSecondary,
            lineHeight: 24,
            marginBottom: spacing.md,
          }}>
            We use the information we collect to:
          </Text>

          <View style={{ marginLeft: spacing.md, marginBottom: spacing.md }}>
            <Text style={{
              fontSize: typography.fontSize.md,
              fontFamily: typography.fontFamily.regular,
              color: colors.textSecondary,
              lineHeight: 24,
              marginBottom: spacing.xs,
            }}>
              • Provide, maintain, and improve our dating services
            </Text>
            <Text style={{
              fontSize: typography.fontSize.md,
              fontFamily: typography.fontFamily.regular,
              color: colors.textSecondary,
              lineHeight: 24,
              marginBottom: spacing.xs,
            }}>
              • Match you with other users based on your preferences
            </Text>
            <Text style={{
              fontSize: typography.fontSize.md,
              fontFamily: typography.fontFamily.regular,
              color: colors.textSecondary,
              lineHeight: 24,
              marginBottom: spacing.xs,
            }}>
              • Enable communication between matched users
            </Text>
            <Text style={{
              fontSize: typography.fontSize.md,
              fontFamily: typography.fontFamily.regular,
              color: colors.textSecondary,
              lineHeight: 24,
              marginBottom: spacing.xs,
            }}>
              • Send you notifications and updates about our services
            </Text>
            <Text style={{
              fontSize: typography.fontSize.md,
              fontFamily: typography.fontFamily.regular,
              color: colors.textSecondary,
              lineHeight: 24,
              marginBottom: spacing.xs,
            }}>
              • Ensure the safety and security of our community
            </Text>
            <Text style={{
              fontSize: typography.fontSize.md,
              fontFamily: typography.fontFamily.regular,
              color: colors.textSecondary,
              lineHeight: 24,
              marginBottom: spacing.xs,
            }}>
              • Detect and prevent fraud, abuse, and violations of our terms
            </Text>
            <Text style={{
              fontSize: typography.fontSize.md,
              fontFamily: typography.fontFamily.regular,
              color: colors.textSecondary,
              lineHeight: 24,
              marginBottom: spacing.xs,
            }}>
              • Comply with legal obligations and enforce our policies
            </Text>
          </View>

          <Text style={{
            fontSize: typography.fontSize.md,
            fontFamily: typography.fontFamily.bold,
            color: colors.textPrimary,
            marginTop: spacing.lg,
            marginBottom: spacing.sm,
          }}>
            INFORMATION SHARING AND DISCLOSURE
          </Text>

          <Text style={{
            fontSize: typography.fontSize.md,
            fontFamily: typography.fontFamily.regular,
            color: colors.textSecondary,
            lineHeight: 24,
            marginBottom: spacing.md,
          }}>
            We may share your information in the following circumstances:
          </Text>

          <View style={{ marginLeft: spacing.md, marginBottom: spacing.md }}>
            <Text style={{
              fontSize: typography.fontSize.md,
              fontFamily: typography.fontFamily.regular,
              color: colors.textSecondary,
              lineHeight: 24,
              marginBottom: spacing.xs,
            }}>
              • With other users when you match or communicate with them
            </Text>
            <Text style={{
              fontSize: typography.fontSize.md,
              fontFamily: typography.fontFamily.regular,
              color: colors.textSecondary,
              lineHeight: 24,
              marginBottom: spacing.xs,
            }}>
              • With service providers who help us operate our services
            </Text>
            <Text style={{
              fontSize: typography.fontSize.md,
              fontFamily: typography.fontFamily.regular,
              color: colors.textSecondary,
              lineHeight: 24,
              marginBottom: spacing.xs,
            }}>
              • When required by law or to protect our rights and safety
            </Text>
            <Text style={{
              fontSize: typography.fontSize.md,
              fontFamily: typography.fontFamily.regular,
              color: colors.textSecondary,
              lineHeight: 24,
              marginBottom: spacing.xs,
            }}>
              • In connection with a business transfer or merger
            </Text>
            <Text style={{
              fontSize: typography.fontSize.md,
              fontFamily: typography.fontFamily.regular,
              color: colors.textSecondary,
              lineHeight: 24,
              marginBottom: spacing.xs,
            }}>
              • With your consent or at your direction
            </Text>
          </View>

          <Text style={{
            fontSize: typography.fontSize.md,
            fontFamily: typography.fontFamily.bold,
            color: colors.textPrimary,
            marginTop: spacing.lg,
            marginBottom: spacing.sm,
          }}>
            DATA SECURITY
          </Text>

          <Text style={{
            fontSize: typography.fontSize.md,
            fontFamily: typography.fontFamily.regular,
            color: colors.textSecondary,
            lineHeight: 24,
            marginBottom: spacing.md,
          }}>
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
          </Text>

          <Text style={{
            fontSize: typography.fontSize.md,
            fontFamily: typography.fontFamily.bold,
            color: colors.textPrimary,
            marginTop: spacing.lg,
            marginBottom: spacing.sm,
          }}>
            YOUR RIGHTS AND CHOICES
          </Text>

          <Text style={{
            fontSize: typography.fontSize.md,
            fontFamily: typography.fontFamily.regular,
            color: colors.textSecondary,
            lineHeight: 24,
            marginBottom: spacing.md,
          }}>
            You have the following rights regarding your personal information:
          </Text>

          <View style={{ marginLeft: spacing.md, marginBottom: spacing.md }}>
            <Text style={{
              fontSize: typography.fontSize.md,
              fontFamily: typography.fontFamily.regular,
              color: colors.textSecondary,
              lineHeight: 24,
              marginBottom: spacing.xs,
            }}>
              • Access and review your personal information
            </Text>
            <Text style={{
              fontSize: typography.fontSize.md,
              fontFamily: typography.fontFamily.regular,
              color: colors.textSecondary,
              lineHeight: 24,
              marginBottom: spacing.xs,
            }}>
              • Update or correct your information through the app
            </Text>
            <Text style={{
              fontSize: typography.fontSize.md,
              fontFamily: typography.fontFamily.regular,
              color: colors.textSecondary,
              lineHeight: 24,
              marginBottom: spacing.xs,
            }}>
              • Delete your account and associated data
            </Text>
            <Text style={{
              fontSize: typography.fontSize.md,
              fontFamily: typography.fontFamily.regular,
              color: colors.textSecondary,
              lineHeight: 24,
              marginBottom: spacing.xs,
            }}>
              • Control your privacy settings and visibility preferences
            </Text>
            <Text style={{
              fontSize: typography.fontSize.md,
              fontFamily: typography.fontFamily.regular,
              color: colors.textSecondary,
              lineHeight: 24,
              marginBottom: spacing.xs,
            }}>
              • Opt out of certain communications and notifications
            </Text>
          </View>

          <Text style={{
            fontSize: typography.fontSize.md,
            fontFamily: typography.fontFamily.bold,
            color: colors.textPrimary,
            marginTop: spacing.lg,
            marginBottom: spacing.sm,
          }}>
            DATA RETENTION
          </Text>

          <Text style={{
            fontSize: typography.fontSize.md,
            fontFamily: typography.fontFamily.regular,
            color: colors.textSecondary,
            lineHeight: 24,
            marginBottom: spacing.md,
          }}>
            We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this Privacy Policy. When you delete your account, we will delete or anonymize your personal information, except where we need to retain certain information for legal, security, or business purposes.
          </Text>

          <Text style={{
            fontSize: typography.fontSize.md,
            fontFamily: typography.fontFamily.bold,
            color: colors.textPrimary,
            marginTop: spacing.lg,
            marginBottom: spacing.sm,
          }}>
            CHILDREN'S PRIVACY
          </Text>

          <Text style={{
            fontSize: typography.fontSize.md,
            fontFamily: typography.fontFamily.regular,
            color: colors.textSecondary,
            lineHeight: 24,
            marginBottom: spacing.md,
          }}>
            Our services are not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
          </Text>

          <Text style={{
            fontSize: typography.fontSize.md,
            fontFamily: typography.fontFamily.bold,
            color: colors.textPrimary,
            marginTop: spacing.lg,
            marginBottom: spacing.sm,
          }}>
            INTERNATIONAL DATA TRANSFERS
          </Text>

          <Text style={{
            fontSize: typography.fontSize.md,
            fontFamily: typography.fontFamily.regular,
            color: colors.textSecondary,
            lineHeight: 24,
            marginBottom: spacing.md,
          }}>
            Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards to protect your information.
          </Text>

          <Text style={{
            fontSize: typography.fontSize.md,
            fontFamily: typography.fontFamily.bold,
            color: colors.textPrimary,
            marginTop: spacing.lg,
            marginBottom: spacing.sm,
          }}>
            CHANGES TO THIS PRIVACY POLICY
          </Text>

          <Text style={{
            fontSize: typography.fontSize.md,
            fontFamily: typography.fontFamily.regular,
            color: colors.textSecondary,
            lineHeight: 24,
            marginBottom: spacing.md,
          }}>
            We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy in the app and updating the "Last updated" date. Your continued use of our services after such changes constitutes acceptance of the updated Privacy Policy.
          </Text>

          <Text style={{
            fontSize: typography.fontSize.md,
            fontFamily: typography.fontFamily.bold,
            color: colors.textPrimary,
            marginTop: spacing.lg,
            marginBottom: spacing.sm,
          }}>
            CONTACT US
          </Text>

          <Text style={{
            fontSize: typography.fontSize.md,
            fontFamily: typography.fontFamily.regular,
            color: colors.textSecondary,
            lineHeight: 24,
            marginBottom: spacing.md,
          }}>
            If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
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
            Email: privacy@lashwa.com{'\n'}
            Phone: +1 (555) 123-4567
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

export default PrivacyPolicyScreen; 