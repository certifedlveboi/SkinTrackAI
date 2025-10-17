import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth, useAlert } from '@/template';
import { theme } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const { sendOTP, verifyOTPAndLogin, signInWithPassword, signUpWithPassword, operationLoading } = useAuth();
  const { showAlert } = useAlert();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendOtp = async () => {
    if (!validateEmail(email)) {
      showAlert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    if (!isLogin) {
      if (!password || password.length < 6) {
        showAlert('Invalid Password', 'Password must be at least 6 characters');
        return;
      }

      if (password !== confirmPassword) {
        showAlert('Password Mismatch', 'Passwords do not match');
        return;
      }
    }

    const { error } = await sendOTP(email);
    
    if (error) {
      showAlert('Error', error);
    } else {
      setShowOtpInput(true);
      showAlert('OTP Sent', 'Please check your email for the verification code');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      showAlert('Invalid OTP', 'Please enter the 6-digit code');
      return;
    }

    if (isLogin) {
      // For login, verify OTP directly
      const { error } = await verifyOTPAndLogin(email, otp);
      
      if (error) {
        showAlert('Error', error);
      }
    } else {
      // For signup, verify OTP with password
      const { error } = await verifyOTPAndLogin(email, otp, { password });
      
      if (error) {
        showAlert('Error', error);
      } else {
        showAlert('Success', 'Account created successfully!');
      }
    }
  };

  const handlePasswordLogin = async () => {
    if (!validateEmail(email)) {
      showAlert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    if (!password) {
      showAlert('Invalid Password', 'Please enter your password');
      return;
    }

    const { error } = await signInWithPassword(email, password);
    
    if (error) {
      showAlert('Error', error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#1A202C', '#2D3748', '#1A202C']}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 40 }]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo/Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <MaterialIcons name="face-retouching-natural" size={60} color={theme.colors.primary} />
            </View>
            <Text style={styles.title}>SkinTrackAI</Text>
            <Text style={styles.subtitle}>
              {isLogin ? 'Welcome back!' : 'Create your account'}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <MaterialIcons name="email" size={20} color="#A0AEC0" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#718096"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!showOtpInput && !operationLoading}
              />
            </View>

            {!showOtpInput && (
              <>
                <View style={styles.inputContainer}>
                  <MaterialIcons name="lock" size={20} color="#A0AEC0" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#718096"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    editable={!operationLoading}
                  />
                </View>

                {!isLogin && (
                  <View style={styles.inputContainer}>
                    <MaterialIcons name="lock" size={20} color="#A0AEC0" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Confirm Password"
                      placeholderTextColor="#718096"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry
                      editable={!operationLoading}
                    />
                  </View>
                )}
              </>
            )}

            {showOtpInput && (
              <View style={styles.inputContainer}>
                <MaterialIcons name="security" size={20} color="#A0AEC0" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="6-digit OTP"
                  placeholderTextColor="#718096"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                  editable={!operationLoading}
                />
              </View>
            )}

            {/* Action Buttons */}
            {!showOtpInput ? (
              <>
                {isLogin && (
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handlePasswordLogin}
                    disabled={operationLoading}
                  >
                    {operationLoading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.primaryButtonText}>Sign In</Text>
                    )}
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.primaryButton, isLogin && styles.secondaryButton]}
                  onPress={handleSendOtp}
                  disabled={operationLoading}
                >
                  {operationLoading ? (
                    <ActivityIndicator color={isLogin ? theme.colors.primary : '#FFFFFF'} />
                  ) : (
                    <Text style={[styles.primaryButtonText, isLogin && styles.secondaryButtonText]}>
                      {isLogin ? 'Sign In with OTP' : 'Send OTP'}
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleVerifyOtp}
                  disabled={operationLoading}
                >
                  {operationLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Verify OTP</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => setShowOtpInput(false)}
                  disabled={operationLoading}
                >
                  <Text style={styles.linkButtonText}>Back</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Toggle Login/Signup */}
            {!showOtpInput && (
              <View style={styles.toggleContainer}>
                <Text style={styles.toggleText}>
                  {isLogin ? "Don't have an account? " : 'Already have an account? '}
                </Text>
                <TouchableOpacity
                  onPress={() => setIsLogin(!isLogin)}
                  disabled={operationLoading}
                >
                  <Text style={styles.toggleLink}>
                    {isLogin ? 'Sign Up' : 'Sign In'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(66, 153, 225, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: theme.fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#A0AEC0',
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D3748',
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#4A5568',
  },
  inputIcon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#FFFFFF',
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: theme.fontWeight.bold,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.primary,
    shadowOpacity: 0,
    elevation: 0,
  },
  secondaryButtonText: {
    color: theme.colors.primary,
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  linkButtonText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.lg,
  },
  toggleText: {
    color: '#A0AEC0',
    fontSize: 14,
  },
  toggleLink: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: theme.fontWeight.bold,
  },
});
