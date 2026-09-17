/**
 * User PC Specifications Storage
 * Stores and retrieves user's PC specs from localStorage
 */

const PC_SPECS_KEY = 'gamescope_user_pc_specs'

export const defaultPCSpecs = {
  cpu: '',
  gpu: '',
  ram: '',
  vram: '',
  os: '',
  storage: ''
}

/**
 * Get user's saved PC specifications
 */
export const getUserPCSpecs = () => {
  try {
    const saved = localStorage.getItem(PC_SPECS_KEY)
    if (saved) {
      return { ...defaultPCSpecs, ...JSON.parse(saved) }
    }
    return defaultPCSpecs
  } catch (error) {
    console.error('Error loading PC specs:', error)
    return defaultPCSpecs
  }
}

/**
 * Save user's PC specifications
 */
export const saveUserPCSpecs = (specs) => {
  try {
    localStorage.setItem(PC_SPECS_KEY, JSON.stringify(specs))
    return true
  } catch (error) {
    console.error('Error saving PC specs:', error)
    return false
  }
}

/**
 * Check if user has saved their PC specs
 */
export const hasSavedPCSpecs = () => {
  const specs = getUserPCSpecs()
  return Object.values(specs).some(value => value && value.trim() !== '')
}

/**
 * Clear saved PC specifications
 */
export const clearUserPCSpecs = () => {
  try {
    localStorage.removeItem(PC_SPECS_KEY)
    return true
  } catch (error) {
    console.error('Error clearing PC specs:', error)
    return false
  }
}

export default {
  getUserPCSpecs,
  saveUserPCSpecs,
  hasSavedPCSpecs,
  clearUserPCSpecs,
  defaultPCSpecs
}
