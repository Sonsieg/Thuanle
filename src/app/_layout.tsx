import { Tabs, TabList, TabTrigger, TabSlot } from 'expo-router/ui';
import { usePathname } from 'expo-router';
import Head from 'expo-router/head';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { setAudioModeAsync } from 'expo-audio';
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { AppState, Platform, StyleSheet, Text, View, KeyboardAvoidingView, Pressable, useWindowDimensions, Alert } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import StudioDOM from '@/studio/StudioSurface';
import { nativeStudioServices } from '@/studio/nativeServices';
import { createStudioBootstrapScript } from '@/studio/domBootstrap';
import type { StudioTab } from '@/studio/types';

const subscribeHydration = () => () => {};

const tabs = [
  { name: 'drafts', href: '/' as const, label: 'Bản nháp', icon: '▤' },
  { name: 'lyrics', href: '/lyrics' as const, label: 'Lời & Hợp âm', icon: '✎' },
  { name: 'groove', href: '/groove' as const, label: 'Phối khí', icon: '≋' },
  { name: 'melody', href: '/melody' as const, label: 'Giai điệu', icon: '♫' },
  { name: 'piano', href: '/piano' as const, label: 'Piano', icon: '▥' },
];

export default function StudioLayout() {
  const path = usePathname();
  const viewport = useWindowDimensions();
  const hydrated = useSyncExternalStore(subscribeHydration, () => true, () => false);
  const width = hydrated ? viewport.width : 0;
  const height = hydrated ? viewport.height : 0;
  // Require a wide window so opening the portrait keyboard does not switch layouts.
  const compact = width >= 600 && width > height && height < 600;
  const [landscapeLocked, setLandscapeLocked] = useState(false);
  const [rotating, setRotating] = useState(false);
  const toggleOrientation = async () => {
    if (rotating) return;
    setRotating(true);
    try {
      // A stale development build may not contain the optional orientation module yet.
      const ScreenOrientation = await import('expo-screen-orientation');
      if (landscapeLocked) {
        await ScreenOrientation.unlockAsync();
        setLandscapeLocked(false);
      } else {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        setLandscapeLocked(true);
      }
    } catch {
      Alert.alert('Xoay màn hình', 'Thiết bị chưa cho phép đổi hướng màn hình. Bạn vẫn có thể xoay máy khi bật chế độ tự xoay của hệ thống.');
    } finally { setRotating(false); }
  };
  const selected = tabs.find((tab) => tab.href === path) ?? tabs[0];
  const [suspended, setSuspended] = useState(false);
  const [studioInstance, setStudioInstance] = useState(0);
  const [studioReady, setStudioReady] = useState(false);
  const [studioError, setStudioError] = useState<string | null>(null);
  const onStudioReady = useCallback(async () => {
    setStudioReady(true);
    setStudioError(null);
  }, [setStudioReady, setStudioError]);
  const retryStudio = () => {
    setStudioReady(false);
    setStudioError(null);
    setStudioInstance((value) => value + 1);
  };
  useEffect(() => {
    if (studioReady || studioError) return;
    const timeout = setTimeout(() => setStudioError('Phòng sáng tác chưa khởi động được. Kiểm tra kết nối tới Metro rồi thử lại.'), 60000);
    return () => clearTimeout(timeout);
  }, [studioReady, studioError, studioInstance]);
  const bootstrap = createStudioBootstrapScript(Platform.OS, {
    names: [...Object.keys(nativeStudioServices), 'onReady'],
    props: { native: Platform.OS !== 'web', tab: selected.name, suspended },
  });
  useEffect(() => {
    void SplashScreen.hideAsync();
    if (Platform.OS !== 'web') {
      void setAudioModeAsync({ playsInSilentMode: true }).catch((error) => console.warn('Audio session:', error));
    }
    const subscription = AppState.addEventListener('change', (state) => setSuspended(state !== 'active'));
    return () => subscription.remove();
  }, []);
  return <SafeAreaProvider>
    <Head>
      <title>{selected.label} · Thuận Lê Studio</title>
      <meta name="description" content="Viết lời tiếng Việt, tìm hợp âm, tạo giai điệu và chơi piano cùng Thuận Lê Studio." />
      <meta name="theme-color" content="#0A192F" />
    </Head>
    <SafeAreaView style={styles.root} edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar style="dark" />
      <View style={[styles.header, compact && styles.headerCompact]}>
        <Image source={require('@/assets/brand/app-icon.png')} contentFit="contain"
          accessibilityLabel="Thuận Lê Studio" style={[styles.brandIcon, compact && styles.brandIconCompact]} />
        <View style={styles.headerTitle}>
          {!compact && <Text style={styles.eyebrow}>THUẬN LÊ STUDIO</Text>}
          <Text numberOfLines={1} style={[styles.title, compact && styles.titleCompact]}>{selected.label}</Text>
        </View>
        {Platform.OS !== 'web' ? <Pressable onPress={() => void toggleOrientation()} disabled={rotating}
          accessibilityRole="button" accessibilityLabel={landscapeLocked ? 'Bật tự xoay màn hình' : 'Xoay màn hình ngang'}
          style={styles.rotateButton}>
          <Text style={styles.rotateText}>{rotating ? 'Đang xoay…' : landscapeLocked ? '↻ Tự xoay' : '↔ Xoay ngang'}</Text>
        </Pressable> : <Text style={styles.badge}>LYRIC & GROOVE</Text>}
      </View>
      <Tabs style={styles.content}>
        <KeyboardAvoidingView style={styles.content} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.content}>
            <StudioDOM key={studioInstance} {...nativeStudioServices} onReady={onStudioReady}
              native={Platform.OS !== 'web'} tab={selected.name as StudioTab}
              suspended={suspended} dom={{ useExpoDOMWebView: false,
                style: styles.content, containerStyle: styles.content,
                injectedJavaScriptBeforeContentLoaded: bootstrap,
                scrollEnabled: true, allowsInlineMediaPlayback: true, mediaPlaybackRequiresUserAction: false,
                mediaCapturePermissionGrantType: 'grantIfSameHostElsePrompt',
                contentInsetAdjustmentBehavior: 'never',
                onError: () => setStudioError('Không tải được phòng sáng tác. Hãy thử kết nối lại rồi tải lại.'),
                onHttpError: (event) => {
                  if (event.nativeEvent.statusCode >= 400) setStudioError(`Không tải được phòng sáng tác (HTTP ${event.nativeEvent.statusCode}).`);
                },
              }} />
            {(!studioReady || studioError) && <View style={styles.loading} accessibilityLiveRegion="polite">
              <Text style={styles.loadingTitle}>{studioError ? 'Chưa mở được studio' : 'Đang mở phòng sáng tác…'}</Text>
              <Text style={styles.loadingDetail}>{studioError ?? 'Đang tải bộ xử lý nhạc và các bản nháp.'}</Text>
              {studioError && <Pressable onPress={retryStudio} style={styles.retry} accessibilityRole="button">
                <Text style={styles.retryText}>Tải lại studio</Text>
              </Pressable>}
            </View>}
          </View>
        </KeyboardAvoidingView>
        <View style={styles.routeSlot}><TabSlot /></View>
        <TabList style={[styles.tabList, compact && styles.tabListCompact]}>
          {tabs.map((tab) => <TabTrigger key={tab.name} name={tab.name} href={tab.href}
            style={[styles.tab, compact && styles.tabCompact, selected.name === tab.name && styles.activeTab]} accessibilityLabel={tab.label}>
            <Text style={[styles.icon, compact && styles.iconCompact, selected.name === tab.name && styles.activeText]}>{tab.icon}</Text>
            <Text numberOfLines={1} style={[styles.label, selected.name === tab.name && styles.activeText]}>{width > 0 && width < 400 && tab.name === 'lyrics' ? 'Lời nhạc' : tab.label}</Text>
          </TabTrigger>)}
        </TabList>
      </Tabs>
    </SafeAreaView>
  </SafeAreaProvider>;
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f8fc' },
  content: { flex: 1 },
  loading: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: '#f5f8fc', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  loadingTitle: { fontSize: 20, fontWeight: '700', color: '#0a192f', textAlign: 'center' },
  loadingDetail: { fontSize: 14, color: '#475569', textAlign: 'center', lineHeight: 22 },
  retry: { backgroundColor: '#0369a1', paddingVertical: 13, paddingHorizontal: 24, borderRadius: 12 },
  retryText: { color: '#fff', fontWeight: '700' },
  brandIcon: { width: 38, height: 38, borderRadius: 10, marginRight: 10 },
  brandIconCompact: { width: 30, height: 30, borderRadius: 8 },
  headerTitle: { flex: 1, minWidth: 0 },
  headerCompact: { paddingVertical: 2, paddingHorizontal: 12 },
  titleCompact: { fontSize: 17, marginTop: 0 },
  rotateButton: { minHeight: 44, paddingHorizontal: 10, marginLeft: 8, justifyContent: 'center', borderRadius: 9, backgroundColor: '#e0f2fe' },
  rotateText: { color: '#0369a1', fontSize: 12, fontWeight: '600' },
  tabListCompact: { paddingTop: 2, paddingBottom: 2 },
  tabCompact: { minHeight: 44, flexDirection: 'row', gap: 6, paddingVertical: 3 },
  iconCompact: { fontSize: 20, lineHeight: 23 },
  header: { paddingHorizontal: 20, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#dce6f2' },
  eyebrow: { fontSize: 10, letterSpacing: 2, color: '#64748b', fontWeight: '700' },
  title: { fontSize: 23, color: '#0a192f', fontWeight: '700', marginTop: 3 },
  badge: { fontSize: 9, color: '#0369a1', fontWeight: '700', letterSpacing: 1, backgroundColor: '#e0f2fe', padding: 9, borderRadius: 8 },
  routeSlot: { height: 0, overflow: 'hidden' },
  tabList: { flexDirection: 'row', paddingTop: 7, paddingHorizontal: 4, paddingBottom: 5, borderTopWidth: 1, borderTopColor: '#dce6f2', backgroundColor: '#fff' },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, paddingVertical: 6, borderRadius: 12, minHeight: 54 },
  activeTab: { backgroundColor: '#e0f2fe' },
  icon: { fontSize: 24, color: '#64748b', lineHeight: 26 },
  label: { fontSize: 11, color: '#64748b', fontWeight: '600' },
  activeText: { color: '#0369a1' },
});
