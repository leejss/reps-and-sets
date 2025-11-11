import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/auth-store';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { Routes } from './route-config';

/**
 * 루트 화면 - 인증 상태에 따라 로그인 화면 또는 메인 화면으로 리디렉션
 */
export default function Index() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  // 인증 상태를 확인하는 동안 로딩 표시
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // 인증되지 않았으면 로그인 화면으로
  if (!isAuthenticated) {
    return <Redirect href={Routes.LOGIN} />;
  }

  // 인증되었으면 메인 화면(탭)으로
  return <Redirect href={Routes.TABS} />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.dark,
  },
});
