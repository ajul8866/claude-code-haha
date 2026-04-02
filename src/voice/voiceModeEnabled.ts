import { feature } from 'bun:bundle'

/**
 * Check if voice mode is enabled via compile-time feature flag.
 * Modified to work without Anthropic cloud dependencies.
 */
export function isVoiceGrowthBookEnabled(): boolean {
  if (feature('VOICE_MODE')) {
    return true
  }
  return false
}

/**
 * Auth check for voice mode - always returns true for local builds.
 * Modified to work without Anthropic OAuth.
 */
export function hasVoiceAuth(): boolean {
  if (feature('VOICE_MODE')) {
    return true
  }
  return false
}

/**
 * Full runtime check for voice mode.
 * Modified to work without Anthropic cloud dependencies.
 */
export function isVoiceModeEnabled(): boolean {
  if (feature('VOICE_MODE')) {
    return true
  }
  return false
}
