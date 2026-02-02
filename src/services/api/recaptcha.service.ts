/**
 * reCAPTCHA Service
 * Handles Google reCAPTCHA v3 integration
 */

class RecaptchaService {
  private siteKey: string;
  private isLoaded: boolean = false;
  private loadPromise: Promise<void> | null = null;

  constructor() {
    this.siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';
  }

  /**
   * Load reCAPTCHA script
   */
  private loadScript(): Promise<void> {
    if (this.isLoaded) {
      return Promise.resolve();
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = new Promise((resolve, reject) => {
      // Check if reCAPTCHA is disabled
      if (!import.meta.env.VITE_ENABLE_RECAPTCHA || import.meta.env.VITE_ENABLE_RECAPTCHA === 'false') {
        console.log('⚠️ reCAPTCHA is disabled');
        this.isLoaded = true;
        resolve();
        return;
      }

      // Check if site key exists
      if (!this.siteKey) {
        console.warn('⚠️ reCAPTCHA site key not found. Skipping reCAPTCHA.');
        this.isLoaded = true;
        resolve();
        return;
      }

      // Check if already loaded
      if (window.grecaptcha) {
        this.isLoaded = true;
        resolve();
        return;
      }

      // Load script
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${this.siteKey}`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        console.log('✅ reCAPTCHA loaded');
        this.isLoaded = true;
        resolve();
      };

      script.onerror = () => {
        console.error('❌ Failed to load reCAPTCHA');
        this.isLoaded = false;
        this.loadPromise = null;
        reject(new Error('Failed to load reCAPTCHA'));
      };

      document.head.appendChild(script);
    });

    return this.loadPromise;
  }

  /**
   * Execute reCAPTCHA and get token
   * @param action - Action name (e.g., 'login', 'register', 'reset_password')
   * @returns Promise<string | null> - reCAPTCHA token or null if disabled
   */
  async executeRecaptcha(action: string): Promise<string | null> {
    try {
      // If reCAPTCHA is disabled, return null
      if (!import.meta.env.VITE_ENABLE_RECAPTCHA || import.meta.env.VITE_ENABLE_RECAPTCHA === 'false') {
        console.log('⚠️ reCAPTCHA is disabled, skipping...');
        return null;
      }

      // If no site key, return null
      if (!this.siteKey) {
        console.warn('⚠️ No reCAPTCHA site key configured');
        return null;
      }

      // Load script if not loaded
      await this.loadScript();

      // Wait for grecaptcha to be ready
      if (!window.grecaptcha || !window.grecaptcha.ready) {
        console.warn('⚠️ reCAPTCHA not ready');
        return null;
      }

      // Execute reCAPTCHA
      return new Promise((resolve) => {
        window.grecaptcha.ready(async () => {
          try {
            const token = await window.grecaptcha.execute(this.siteKey, { action });
            console.log(`✅ reCAPTCHA token generated for action: ${action}`);
            resolve(token);
          } catch (error) {
            console.error('❌ reCAPTCHA execution failed:', error);
            resolve(null);
          }
        });
      });
    } catch (error) {
      console.error('❌ reCAPTCHA error:', error);
      return null;
    }
  }

  /**
   * Check if reCAPTCHA is enabled
   */
  isEnabled(): boolean {
    return (
      import.meta.env.VITE_ENABLE_RECAPTCHA === 'true' &&
      !!this.siteKey
    );
  }

  /**
   * Preload reCAPTCHA (call on app initialization)
   */
  async preload(): Promise<void> {
    if (this.isEnabled()) {
      await this.loadScript();
    }
  }
}

// Export singleton instance
export const recaptchaService = new RecaptchaService();

// Type declarations for window.grecaptcha
declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

export default recaptchaService;