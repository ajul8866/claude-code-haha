import type { Command } from '../../commands.js'
import { isVoiceModeEnabled } from '../../voice/voiceModeEnabled.js'

const voice = {
  type: 'local' as const,
  name: 'voice',
  description: 'Toggle voice mode',
  isEnabled: () => isVoiceModeEnabled(),
  get isHidden() {
    return !isVoiceModeEnabled()
  },
  supportsNonInteractive: false,
  load: () => import('./voice.js'),
} satisfies Command

export default voice
