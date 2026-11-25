/**
 * Android RN WebView only reinstalls injectedObjectJson on navigation when a
 * nonempty before-content script exists. Supply the first render's bridge data
 * here as well, so Expo's HTML bootstrap never reads an empty about:blank bridge.
 */
export function createStudioBootstrapScript(
  hostOS: string,
  initialProps: { names: string[]; props: Record<string, string | boolean> },
): string {
  const payload = JSON.stringify({ EXPO_DOM_HOST_OS: hostOS, initialProps });
  return `;(function () {
    var payload = ${payload};
    var bridge = window.ReactNativeWebView;
    var existing = null;
    try {
      if (bridge && typeof bridge.injectedObjectJson === 'function') {
        existing = JSON.parse(bridge.injectedObjectJson());
      }
    } catch (_) {}
    if (bridge && (!existing || !existing.EXPO_DOM_HOST_OS || !existing.initialProps)) {
      bridge.injectedObjectJson = function () { return JSON.stringify(payload); };
    }
    window.$$EXPO_DOM_HOST_OS = payload.EXPO_DOM_HOST_OS;
    window.$$EXPO_INITIAL_PROPS = payload.initialProps;
  })(); true;`;
}
