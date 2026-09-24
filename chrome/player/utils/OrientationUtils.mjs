/**
 * Utility functions for screen orientation detection and locking.
 */
export class OrientationUtils {
  /**
   * Checks if the Screen Orientation API is available.
   * @return {boolean} True if supported, false otherwise.
   */
  static isSupported() {
    return !!(window.screen && window.screen.orientation && window.screen.orientation.lock);
  }

  /**
   * Locks the screen orientation to the given type.
   * Locking is only permitted in certain contexts (e.g. while in fullscreen
   * on many Android browsers), so failures are handled gracefully.
   * @param {string} orientationType - One of 'landscape', 'portrait', etc.
   * @return {Promise<boolean>} Whether the lock succeeded.
   */
  static async lock(orientationType) {
    if (!OrientationUtils.isSupported()) {
      return false;
    }
    try {
      await window.screen.orientation.lock(orientationType);
      return true;
    } catch (e) {
      console.warn('Failed to lock screen orientation', e);
      return false;
    }
  }

  /**
   * Unlocks the screen orientation so the device can freely rotate.
   * @return {Promise<void>}
   */
  static async unlock() {
    if (!OrientationUtils.isSupported()) {
      return;
    }
    try {
      window.screen.orientation.unlock();
    } catch (e) {
      console.warn('Failed to unlock screen orientation', e);
    }
  }

  /**
   * Determines whether the screen is currently in landscape orientation.
   * @return {boolean} True if landscape, false if portrait.
   */
  static isLandscape() {
    return (window.matchMedia && window.matchMedia('(orientation: landscape)').matches) ||
        (window.innerWidth > window.innerHeight);
  }

  /**
   * Watches for screen rotation changes, invoking the callback with the new
   * landscape state each time. Falls back to matchMedia when the Screen
   * Orientation API event is unavailable.
   * @param {function(boolean):void} callback - Called with whether now landscape.
   * @return {function():void} Unsubscribe function.
   */
  static watchRotation(callback) {
    if (OrientationUtils.isSupported()) {
      const handler = () => callback(OrientationUtils.isLandscape());
      window.screen.orientation.addEventListener('change', handler);
      return () => window.screen.orientation.removeEventListener('change', handler);
    }

    const mql = window.matchMedia('(orientation: landscape)');
    const handler = (e) => callback(e.matches);
    if (mql.addEventListener) {
      mql.addEventListener('change', handler);
      return () => mql.removeEventListener('change', handler);
    }

    // Very old browsers: poll via resize.
    const onResize = () => callback(OrientationUtils.isLandscape());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }
}
