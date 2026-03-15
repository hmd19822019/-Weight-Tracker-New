import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native'

import { colors, typography } from '../theme'
import { storage, STORAGE_KEYS } from '../utils/storage'

interface LoginScreenProps {
  onLoginSuccess: () => void
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [codeSent, setCodeSent] = useState(false)

  const handleSendCode = async () => {
    if (!phone || phone.length !== 11) {
      Alert.alert('错误', '请输入有效的手机号')
      return
    }

    setLoading(true)
    try {
      // Mock: In production, call API to send verification code
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000))
      setCodeSent(true)
      Alert.alert('成功', '验证码已发送（测试环境：123456）')
    } catch (error) {
      Alert.alert('错误', '发送验证码失败')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    if (!code || code.length !== 6) {
      Alert.alert('错误', '请输入6位验证码')
      return
    }

    setLoading(true)
    try {
      // Mock: In production, call API to verify code
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000))

      // For testing, accept any 6-digit code
      if (code.length === 6) {
        const mockToken = 'mock_token_' + Date.now()
        const mockUser = {
          id: 'user_' + Date.now(),
          phone,
          nickname: '用户' + phone.slice(-4),
        }

        await storage.setItem(STORAGE_KEYS.USER_TOKEN, mockToken)
        await storage.setItem(STORAGE_KEYS.USER_DATA, mockUser)

        Alert.alert('成功', '登录成功', [
          { text: '确定', onPress: onLoginSuccess },
        ])
      } else {
        Alert.alert('错误', '验证码错误')
      }
    } catch (error) {
      Alert.alert('错误', '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>欢迎使用</Text>
          <Text style={styles.subtitle}>体重追踪助手</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>手机号</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="请输入手机号"
            placeholderTextColor={colors.light.textSecondary}
            maxLength={11}
            editable={!loading}
          />

          {codeSent && (
            <>
              <Text style={styles.label}>验证码</Text>
              <TextInput
                style={styles.input}
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                placeholder="请输入验证码"
                placeholderTextColor={colors.light.textSecondary}
                maxLength={6}
                editable={!loading}
              />
            </>
          )}

          {!codeSent ? (
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSendCode}
              disabled={loading}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>获取验证码</Text>
              )}
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.7}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>登录</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resendButton}
                onPress={handleSendCode}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Text style={styles.resendText}>重新发送验证码</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <Text style={styles.hint}>
          测试环境：任意手机号 + 验证码 123456
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    ...typography.h1,
    color: colors.light.text,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.h3,
    color: colors.light.textSecondary,
  },
  form: {
    marginBottom: 24,
  },
  label: {
    ...typography.bodyBold,
    color: colors.light.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.light.surface,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: colors.light.text,
    marginBottom: 16,
  },
  button: {
    backgroundColor: colors.light.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    ...typography.bodyBold,
    color: '#FFFFFF',
  },
  resendButton: {
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  resendText: {
    ...typography.body,
    color: colors.light.primary,
  },
  hint: {
    ...typography.caption,
    color: colors.light.textSecondary,
    textAlign: 'center',
  },
})
