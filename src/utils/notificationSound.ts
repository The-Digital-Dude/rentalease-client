/**
 * Notification Sound Utility
 *
 * Generates and plays notification sounds using the Web Audio API
 */

class NotificationSound {
  private audioContext: AudioContext | null = null;
  private isEnabled: boolean = true;

  constructor() {
    // Initialize AudioContext on first user interaction (to comply with browser autoplay policies)
    if (typeof window !== 'undefined') {
      this.initAudioContext();
    }
  }

  private initAudioContext() {
    try {
      // Create AudioContext only when needed
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    } catch (error) {
      console.error('Failed to initialize AudioContext:', error);
    }
  }

  /**
   * Play a pleasant notification sound
   */
  async play() {
    if (!this.isEnabled) {
      return;
    }

    try {
      this.initAudioContext();

      if (!this.audioContext) {
        console.warn('AudioContext not available');
        return;
      }

      // Resume AudioContext if it's suspended (browser autoplay policy)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const currentTime = this.audioContext.currentTime;

      // Create oscillator for the first note (E5)
      const oscillator1 = this.audioContext.createOscillator();
      const gainNode1 = this.audioContext.createGain();

      oscillator1.connect(gainNode1);
      gainNode1.connect(this.audioContext.destination);

      oscillator1.frequency.setValueAtTime(659.25, currentTime); // E5
      oscillator1.type = 'sine';

      // Envelope for smooth attack and decay
      gainNode1.gain.setValueAtTime(0, currentTime);
      gainNode1.gain.linearRampToValueAtTime(0.3, currentTime + 0.01);
      gainNode1.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.3);

      oscillator1.start(currentTime);
      oscillator1.stop(currentTime + 0.3);

      // Create oscillator for the second note (C6) - slightly delayed
      const oscillator2 = this.audioContext.createOscillator();
      const gainNode2 = this.audioContext.createGain();

      oscillator2.connect(gainNode2);
      gainNode2.connect(this.audioContext.destination);

      oscillator2.frequency.setValueAtTime(1046.50, currentTime + 0.15); // C6
      oscillator2.type = 'sine';

      gainNode2.gain.setValueAtTime(0, currentTime + 0.15);
      gainNode2.gain.linearRampToValueAtTime(0.25, currentTime + 0.16);
      gainNode2.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.5);

      oscillator2.start(currentTime + 0.15);
      oscillator2.stop(currentTime + 0.5);

    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }

  /**
   * Enable notification sounds
   */
  enable() {
    this.isEnabled = true;
  }

  /**
   * Disable notification sounds
   */
  disable() {
    this.isEnabled = false;
  }

  /**
   * Toggle notification sounds
   */
  toggle() {
    this.isEnabled = !this.isEnabled;
    return this.isEnabled;
  }

  /**
   * Check if sounds are enabled
   */
  getIsEnabled() {
    return this.isEnabled;
  }
}

// Export singleton instance
export const notificationSound = new NotificationSound();

// Export for testing
export default NotificationSound;
