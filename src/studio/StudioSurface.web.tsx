import { lazy, Suspense, useSyncExternalStore } from 'react';
import type { StudioBridge, StudioTab } from './types';

// Audio/canvas libraries require a browser. Never evaluate them during Expo SSR.
const BrowserStudio = lazy(() => import('./StudioDOM'));
const subscribe = () => () => {};
type Props = StudioBridge & {
  tab: StudioTab;
  native: boolean;
  suspended: boolean;
  onReady: () => Promise<void>;
  dom?: import('expo/dom').DOMProps;
};
export default function StudioSurface(props: Props) {
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  const loading = <div style={{ padding: 24 }}>Đang mở phòng sáng tác…</div>;
  if (!hydrated) return loading;
  return <div data-studio-scroll style={{ flex: 1, minHeight: 0, width: '100%', overflowY: 'auto', overscrollBehaviorY: 'contain' }}>
    <Suspense fallback={loading}><BrowserStudio {...props} /></Suspense>
  </div>;
}
