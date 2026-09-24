// Common in-app (embedded webview) browsers that block Google OAuth.
// Google's OAuth consent screen actively refuses to load inside these.
const IN_APP_BROWSER_PATTERNS = [
  /KAKAOTALK/i,
  /NAVER\(/i, // NAVER app webview UA contains "NAVER(inapp; ...)"
  /Line\//i,
  /Instagram/i,
  /FBAN|FBAV/i, // Facebook / Messenger
  /Daum/i,
  /everytime/i,
];

export function isInAppBrowser(userAgent: string): boolean {
  return IN_APP_BROWSER_PATTERNS.some((pattern) => pattern.test(userAgent));
}
