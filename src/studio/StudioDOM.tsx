'use dom';

import { useEffect, useState } from 'react';
import { LyricGrooveSketchpadSection } from './components/LyricGrooveSketchpadSection';
import { configureNativeBridge } from './utils/nativeBridge';
import type { StudioBridge, StudioTab } from './types';
import './studio.css';

type Props = StudioBridge & {
  tab: StudioTab;
  native: boolean;
  suspended: boolean;
  onReady: () => Promise<void>;
  dom?: import('expo/dom').DOMProps;
};

export default function StudioDOM(props: Props) {
  const { onReady } = props;
  const [ready, setReady] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  useEffect(() => {
    configureNativeBridge(props.native ? props : null);
    let mounted = true;
    // Initialize external storage before allowing edits in the workbench.
    void Promise.resolve().then(() => {
      if (!mounted) return;
      try {
        const saved = localStorage.getItem('studio-theme');
        setTheme(saved === 'dark' ? 'dark' : 'light');
      } catch { /* Private browsing may disable storage. Drafts still use native storage. */ }
      setReady(true);
    });
    return () => { mounted = false; configureNativeBridge(null); };
    // Actions are stable across tab changes. The workbench must remain mounted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    if (ready) { try { localStorage.setItem('studio-theme', theme); } catch {} }
  }, [theme, ready]);
  useEffect(() => {
    if (ready) void onReady();
  }, [ready, onReady]);
  useEffect(() => {
    window.scrollTo(0, 0);
    document.querySelector('[data-studio-scroll]')?.scrollTo(0, 0);
  }, [props.tab]);
  useEffect(() => {
    if (props.suspended) window.dispatchEvent(new Event('studio-suspend'));
  }, [props.suspended]);
  if (!ready) return <p className="p-6">Đang mở phòng sáng tác…</p>;
  return <main className="studio-mobile">
    <LyricGrooveSketchpadSection tab={props.tab} theme={theme}
      onToggleTheme={() => setTheme((value) => value === 'light' ? 'dark' : 'light')} />
  </main>;
}
