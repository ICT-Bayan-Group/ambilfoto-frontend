
import { authApi } from './auth.service';

export interface PuzzleChallenge {
  challengeId: string;
  token: string;
  imageUrl: string;
  expiresIn: number;
  action: string;
}

export interface PuzzleSolution {
  challengeId: string;
  userPosition: number;
  timestamp: number;
  token: string;
}

class PuzzleCaptchaService {
  private currentChallenge: PuzzleChallenge | null = null;
  private solvingStartTime: number = 0;

  /**
   * Get CAPTCHA configuration from backend
   */
  async getConfig() {
    try {
      // ✅ FIXED: Changed from /captcha/config to /captcha/config (already correct in captcha.service.ts)
      const response = await authApi.get('/captcha/config');
      return response.data.config;
    } catch (error) {
      console.error('❌ Failed to get CAPTCHA config:', error);
      return null;
    }
  }

  /**
   * Generate new puzzle challenge
   * 
   * @param action - Action type (login, register, etc.)
   * @returns Promise<PuzzleChallenge | null>
   */
  async generateChallenge(action: string): Promise<PuzzleChallenge | null> {
    try {
      // ✅ CORRECT: Calls /captcha/challenge (which maps to /api/captcha/challenge)
      const response = await authApi.post('/captcha/challenge', { action });
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to generate challenge');
      }

      this.currentChallenge = response.data.challenge;
      this.solvingStartTime = Date.now();

      console.log('✅ Puzzle challenge generated:', this.currentChallenge?.challengeId);
      
      return this.currentChallenge;
    } catch (error: any) {
      console.error('❌ Failed to generate puzzle challenge:', error);
      
      // If puzzle CAPTCHA is not available, return null
      if (error.response?.data?.error?.includes('not supported')) {
        console.log('ℹ️ Puzzle CAPTCHA not supported, falling back to reCAPTCHA');
        return null;
      }
      
      throw error;
    }
  }

  /**
   * Generate solution token
   * 
   * This creates the token that will be sent to backend for verification
   * Format: challengeId:userPosition:timestamp:signature
   * 
   * Note: signature is generated on backend, we just send the data
   * 
   * @param userPosition - Final position of puzzle piece (in pixels)
   * @returns string - Solution token
   */
  createSolutionToken(userPosition: number): string {
    if (!this.currentChallenge) {
      throw new Error('No active challenge');
    }

    const completionTime = Date.now();
    
    // Calculate signature using simple hash (backend will verify with HMAC)
    const data = `${this.currentChallenge.challengeId}:${userPosition}:${completionTime}`;
    const signature = this.simpleHash(data);

    // Format: challengeId:userPosition:timestamp:signature
    const token = `${this.currentChallenge.challengeId}:${userPosition}:${completionTime}:${signature}`;

    console.log('🔐 Solution token created:', {
      challengeId: this.currentChallenge.challengeId,
      userPosition,
      completionTime: completionTime - this.solvingStartTime,
    });

    return token;
  }

  /**
   * Simple hash function for client-side token generation
   * Note: Backend uses HMAC for actual verification
   * 
   * @private
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Get full image URL
   * ✅ FIXED: Now uses correct endpoint structure
   */
  getImageUrl(imageId: string): string {
    const baseUrl = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:5000/api';
    // Image URL will be /api/captcha/image/:imageId
    return `${baseUrl}/captcha/image/${imageId}`;
  }

  /**
   * Clear current challenge
   */
  clearChallenge(): void {
    this.currentChallenge = null;
    this.solvingStartTime = 0;
  }

  /**
   * Get current challenge
   */
  getCurrentChallenge(): PuzzleChallenge | null {
    return this.currentChallenge;
  }

  /**
   * Check if challenge has expired
   */
  isExpired(): boolean {
    if (!this.currentChallenge) {
      return true;
    }

    const elapsed = Date.now() - this.solvingStartTime;
    return elapsed > (this.currentChallenge.expiresIn * 1000);
  }

  /**
   * Get time remaining (in seconds)
   */
  getTimeRemaining(): number {
    if (!this.currentChallenge) {
      return 0;
    }

    const elapsed = Date.now() - this.solvingStartTime;
    const remaining = (this.currentChallenge.expiresIn * 1000) - elapsed;
    
    return Math.max(0, Math.floor(remaining / 1000));
  }

  /**
   * Check health of puzzle CAPTCHA service
   */
  async healthCheck() {
    try {
      const response = await authApi.get('/captcha/health');
      return response.data.health;
    } catch (error) {
      console.error('❌ CAPTCHA health check failed:', error);
      return { healthy: false };
    }
  }
}

// Export singleton instance
export const puzzleCaptchaService = new PuzzleCaptchaService();

export default puzzleCaptchaService;