import { Component, type ReactNode } from 'react';

const KEYS = ['ardh.decisions.v1', 'ardh.session.v2'];

/**
 * Last line of defence: if rendering ever throws (for example because saved browser data was edited by hand),
 * show a calm message with a one-click reset instead of a blank page. Text is bilingual and does not depend on
 * the language provider, which may be the thing that failed.
 */
export default class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  reset = () => {
    for (const k of KEYS) { try { localStorage.removeItem(k); } catch { /* storage unavailable */ } }
    location.hash = '#/login';
    location.reload();
  };
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main role="alert" style={{ maxWidth: 520, margin: '15vh auto', padding: 24, font: '16px/1.6 system-ui, sans-serif' }}>
        <h1 style={{ fontSize: 22 }}>কিছু একটা ভুল হয়েছে · Something went wrong</h1>
        <p>এই ব্রাউজারে সংরক্ষিত ডেটা পড়া যায়নি। রিসেট করলে সংরক্ষিত সিদ্ধান্ত ও সাইন-ইন মুছে যাবে।</p>
        <p>The data saved in this browser could not be read. Resetting clears saved decisions and the sign-in.</p>
        <button type="button" onClick={this.reset} style={{ padding: '10px 18px', fontSize: 16, cursor: 'pointer' }}>Reset local data · রিসেট</button>
      </main>
    );
  }
}
