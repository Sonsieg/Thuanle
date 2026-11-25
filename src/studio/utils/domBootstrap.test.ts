import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { createStudioBootstrapScript } from '../domBootstrap.ts';

const initialProps = { names: ['loadDrafts', 'saveDraft', 'onReady'], props: { native: true, tab: 'lyrics', suspended: false } };

test('Android bootstrap installs host OS, initial props and missing injectedObjectJson before Expo entry', () => {
  const window = { ReactNativeWebView: { postMessage() {} } };
  const context = vm.createContext({ window });
  vm.runInContext(createStudioBootstrapScript('android', initialProps), context);
  // Match the HTML bootstrap in Expo SDK 58, then the guards in dom-entry.
  const payload = vm.runInContext('JSON.parse(window.ReactNativeWebView.injectedObjectJson())', context);
  assert.equal(payload.EXPO_DOM_HOST_OS, 'android');
  assert.deepEqual(JSON.parse(JSON.stringify(payload.initialProps)), initialProps);
  assert.equal(vm.runInContext('window.$$EXPO_DOM_HOST_OS', context), 'android');
  assert.equal(vm.runInContext('window.$$EXPO_INITIAL_PROPS.props.tab', context), 'lyrics');
  assert.equal(vm.runInContext('typeof window.ReactNativeWebView.postMessage', context), 'function');
});

test('bootstrap preserves an already installed native injectedObjectJson method', () => {
  const nativeMethod = () => JSON.stringify({ EXPO_DOM_HOST_OS: 'ios', initialProps });
  const window = { ReactNativeWebView: { injectedObjectJson: nativeMethod } };
  vm.runInNewContext(createStudioBootstrapScript('ios', initialProps), { window });
  assert.equal(window.ReactNativeWebView.injectedObjectJson, nativeMethod);
});

for (const value of [null, '{}', 'invalid-json']) {
  test(`bootstrap recovers when injectedObjectJson is present but not ready: ${value}`, () => {
    const window = { ReactNativeWebView: { injectedObjectJson: () => value } };
    vm.runInNewContext(createStudioBootstrapScript('android', initialProps), { window });
    const payload = JSON.parse(window.ReactNativeWebView.injectedObjectJson()!);
    assert.equal(payload.EXPO_DOM_HOST_OS, 'android');
    assert.deepEqual(payload.initialProps, initialProps);
  });
}
