/**
 * Parse RAWG PC requirements text into structured data
 * RAWG returns requirements as plain text, this parser extracts key fields
 */

export const parseRequirements = (requirementsText) => {
  if (!requirementsText || typeof requirementsText !== 'string') {
    return null
  }

  const requirements = {}
  const text = requirementsText.toLowerCase()

  // OS patterns
  const osMatch = text.match(/os[:\s]*([^\n]+)/i) ||
                  text.match(/operating system[:\s]*([^\n]+)/i)
  if (osMatch) {
    requirements.os = osMatch[1].trim()
  }

  // Processor/CPU patterns
  const cpuMatch = text.match(/processor[:\s]*([^\n]+)/i) ||
                   text.match(/cpu[:\s]*([^\n]+)/i)
  if (cpuMatch) {
    requirements.processor = cpuMatch[1].trim()
  }

  // Memory/RAM patterns
  const ramMatch = text.match(/memory[:\s]*([^\n]+)/i) ||
                   text.match(/ram[:\s]*([^\n]+)/i)
  if (ramMatch) {
    requirements.memory = ramMatch[1].trim()
  }

  // Graphics/GPU patterns
  const gpuMatch = text.match(/graphics[:\s]*([^\n]+)/i) ||
                   text.match(/gpu[:\s]*([^\n]+)/i) ||
                   text.match(/video card[:\s]*([^\n]+)/i)
  if (gpuMatch) {
    requirements.graphics = gpuMatch[1].trim()
  }

  // DirectX patterns
  const dxMatch = text.match(/directx[:\s]*([^\n]+)/i) ||
                  text.match(/direct x[:\s]*([^\n]+)/i)
  if (dxMatch) {
    requirements.directx = dxMatch[1].trim()
  }

  // Storage patterns
  const storageMatch = text.match(/storage[:\s]*([^\n]+)/i) ||
                       text.match(/hard drive[:\s]*([^\n]+)/i) ||
                       text.match(/disk space[:\s]*([^\n]+)/i)
  if (storageMatch) {
    requirements.storage = storageMatch[1].trim()
  }

  // Additional Notes
  const notesMatch = text.match(/additional notes[:\s]*([^\n]+)/i) ||
                     text.match(/notes[:\s]*([^\n]+)/i)
  if (notesMatch) {
    requirements.additionalNotes = notesMatch[1].trim()
  }

  // If we couldn't parse any fields, return the raw text
  if (Object.keys(requirements).length === 0) {
    return { raw: requirementsText }
  }

  return requirements
}

/**
 * Extract PC platform requirements from RAWG game data
 */
export const extractPCRequirements = (gameData) => {
  if (!gameData || !gameData.platforms) {
    return { minimum: null, recommended: null }
  }

  // Find PC platform
  const pcPlatform = gameData.platforms.find(p => {
    const platformName = p.platform?.name?.toLowerCase() || ''
    return platformName.includes('pc') || platformName.includes('windows')
  })

  if (!pcPlatform || !pcPlatform.requirements) {
    return { minimum: null, recommended: null }
  }

  const requirements = {
    minimum: null,
    recommended: null
  }

  if (pcPlatform.requirements.minimum) {
    requirements.minimum = parseRequirements(pcPlatform.requirements.minimum)
  }

  if (pcPlatform.requirements.recommended) {
    requirements.recommended = parseRequirements(pcPlatform.requirements.recommended)
  }

  return requirements
}

export default {
  parseRequirements,
  extractPCRequirements
}
