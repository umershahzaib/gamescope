/**
 * PC Compatibility Checker
 * Intelligently compares user PC specs with game requirements
 */

/**
 * Extract numeric value from RAM/VRAM strings
 * Examples: "8 GB", "16GB RAM", "8192 MB" -> 8192 (in MB)
 */
const parseMemorySize = (memStr) => {
  if (!memStr) return 0

  const str = memStr.toString().toLowerCase()
  const gbMatch = str.match(/(\d+)\s*gb/i)
  const mbMatch = str.match(/(\d+)\s*mb/i)

  if (gbMatch) {
    return parseInt(gbMatch[1]) * 1024 // Convert GB to MB
  }
  if (mbMatch) {
    return parseInt(mbMatch[1])
  }

  // Try to extract any number
  const numMatch = str.match(/(\d+)/)
  if (numMatch) {
    const num = parseInt(numMatch[1])
    // If it's a small number (< 100), assume GB
    return num < 100 ? num * 1024 : num
  }

  return 0
}

/**
 * Compare RAM/VRAM
 */
const compareMemory = (userMem, requiredMem) => {
  if (!requiredMem) return { status: 'unknown', message: 'Not specified' }
  if (!userMem) return { status: 'unknown', message: 'User specs not provided' }

  const userSize = parseMemorySize(userMem)
  const requiredSize = parseMemorySize(requiredMem)

  if (userSize === 0 || requiredSize === 0) {
    return { status: 'unknown', message: 'Unable to parse memory values' }
  }

  if (userSize >= requiredSize) {
    return { status: 'pass', message: `${userMem} meets requirement` }
  } else {
    return { status: 'fail', message: `${userMem} is below ${requiredMem}` }
  }
}

/**
 * Compare Operating Systems
 */
const compareOS = (userOS, requiredOS) => {
  if (!requiredOS) return { status: 'unknown', message: 'Not specified' }
  if (!userOS) return { status: 'unknown', message: 'User OS not provided' }

  const userOSLower = userOS.toLowerCase()
  const requiredOSLower = requiredOS.toLowerCase()

  // Check for Windows versions
  if (requiredOSLower.includes('windows')) {
    if (!userOSLower.includes('windows')) {
      return { status: 'fail', message: 'Requires Windows' }
    }

    // Extract version numbers
    const requiredVersion = requiredOSLower.match(/windows\s*(\d+)/)?.[1]
    const userVersion = userOSLower.match(/windows\s*(\d+)/)?.[1]

    if (requiredVersion && userVersion) {
      if (parseInt(userVersion) >= parseInt(requiredVersion)) {
        return { status: 'pass', message: 'OS compatible' }
      } else {
        return { status: 'fail', message: `Requires Windows ${requiredVersion} or higher` }
      }
    }

    return { status: 'pass', message: 'Windows detected' }
  }

  // Simple keyword matching for other OS
  if (userOSLower.includes(requiredOSLower) || requiredOSLower.includes(userOSLower)) {
    return { status: 'pass', message: 'OS compatible' }
  }

  return { status: 'unknown', message: 'Unable to determine OS compatibility' }
}

/**
 * Compare CPUs (simplified - acknowledges uncertainty)
 */
const compareCPU = (userCPU, requiredCPU) => {
  if (!requiredCPU) return { status: 'unknown', message: 'Not specified' }
  if (!userCPU) return { status: 'unknown', message: 'User CPU not provided' }

  const userLower = userCPU.toLowerCase()
  const requiredLower = requiredCPU.toLowerCase()

  // Extract generation/series numbers for Intel
  const userIntelGen = userLower.match(/i[3579][-\s]*(\d+)/)?.[1]
  const reqIntelGen = requiredLower.match(/i[3579][-\s]*(\d+)/)?.[1]

  if (userIntelGen && reqIntelGen) {
    const userGen = parseInt(userIntelGen.substring(0, 2))
    const reqGen = parseInt(reqIntelGen.substring(0, 2))

    if (userGen > reqGen) {
      return { status: 'pass', message: 'Newer CPU generation' }
    } else if (userGen === reqGen) {
      return { status: 'pass', message: 'Similar CPU generation' }
    } else {
      return { status: 'uncertain', message: 'Older CPU generation - may still work' }
    }
  }

  // Extract Ryzen generation for AMD
  const userRyzen = userLower.match(/ryzen\s*([3579])\s*(\d+)/)?.[2]
  const reqRyzen = requiredLower.match(/ryzen\s*([3579])\s*(\d+)/)?.[2]

  if (userRyzen && reqRyzen) {
    const userGen = parseInt(userRyzen.substring(0, 1))
    const reqGen = parseInt(reqRyzen.substring(0, 1))

    if (userGen >= reqGen) {
      return { status: 'pass', message: 'Meets or exceeds CPU requirement' }
    } else {
      return { status: 'uncertain', message: 'Older CPU generation - performance may vary' }
    }
  }

  // If we can't confidently compare, be honest
  return { status: 'uncertain', message: 'Unable to confidently compare CPUs' }
}

/**
 * Compare GPUs (simplified - acknowledges uncertainty)
 */
const compareGPU = (userGPU, requiredGPU) => {
  if (!requiredGPU) return { status: 'unknown', message: 'Not specified' }
  if (!userGPU) return { status: 'unknown', message: 'User GPU not provided' }

  const userLower = userGPU.toLowerCase()
  const requiredLower = requiredGPU.toLowerCase()

  // NVIDIA GTX/RTX comparison
  if (userLower.includes('rtx') && requiredLower.includes('gtx')) {
    return { status: 'pass', message: 'RTX is newer than GTX' }
  }

  if (userLower.includes('rtx') && requiredLower.includes('rtx')) {
    const userSeries = userLower.match(/rtx\s*(\d+)/)?.[1]
    const reqSeries = requiredLower.match(/rtx\s*(\d+)/)?.[1]

    if (userSeries && reqSeries) {
      if (parseInt(userSeries) >= parseInt(reqSeries)) {
        return { status: 'pass', message: 'Meets or exceeds GPU requirement' }
      } else {
        return { status: 'uncertain', message: 'Lower GPU series - may still work with reduced settings' }
      }
    }
  }

  if (userLower.includes('gtx') && requiredLower.includes('gtx')) {
    const userSeries = userLower.match(/gtx\s*(\d+)/)?.[1]
    const reqSeries = requiredLower.match(/gtx\s*(\d+)/)?.[1]

    if (userSeries && reqSeries) {
      if (parseInt(userSeries) >= parseInt(reqSeries)) {
        return { status: 'pass', message: 'Meets GPU requirement' }
      } else {
        return { status: 'uncertain', message: 'Lower GPU series - performance may be limited' }
      }
    }
  }

  // AMD RX comparison
  if (userLower.includes('rx') && requiredLower.includes('rx')) {
    const userSeries = userLower.match(/rx\s*(\d+)/)?.[1]
    const reqSeries = requiredLower.match(/rx\s*(\d+)/)?.[1]

    if (userSeries && reqSeries) {
      if (parseInt(userSeries) >= parseInt(reqSeries)) {
        return { status: 'pass', message: 'Meets GPU requirement' }
      } else {
        return { status: 'uncertain', message: 'Lower GPU series - check benchmarks' }
      }
    }
  }

  // If we can't confidently compare, be honest
  return { status: 'uncertain', message: 'Unable to confidently compare GPUs' }
}

/**
 * Compare storage
 */
const compareStorage = (userStorage, requiredStorage) => {
  if (!requiredStorage) return { status: 'unknown', message: 'Not specified' }
  if (!userStorage) return { status: 'unknown', message: 'User storage not provided' }

  const userSize = parseMemorySize(userStorage)
  const requiredSize = parseMemorySize(requiredStorage)

  if (userSize === 0 || requiredSize === 0) {
    return { status: 'unknown', message: 'Unable to parse storage values' }
  }

  if (userSize >= requiredSize) {
    return { status: 'pass', message: `${userStorage} available` }
  } else {
    return { status: 'fail', message: `Need ${requiredStorage}, have ${userStorage}` }
  }
}

/**
 * Main compatibility check function
 */
export const checkCompatibility = (userSpecs, gameRequirements) => {
  if (!gameRequirements || !gameRequirements.minimum) {
    return {
      canRun: null,
      message: 'System requirements not available for this game',
      breakdown: null
    }
  }

  const minReq = gameRequirements.minimum

  const breakdown = {
    os: compareOS(userSpecs.os, minReq.os),
    cpu: compareCPU(userSpecs.cpu, minReq.processor),
    ram: compareMemory(userSpecs.ram, minReq.memory),
    gpu: compareGPU(userSpecs.gpu, minReq.graphics),
    vram: compareMemory(userSpecs.vram, minReq.vram),
    storage: compareStorage(userSpecs.storage, minReq.storage)
  }

  // Count passes, fails, and uncertains
  const results = Object.values(breakdown)
  const passes = results.filter(r => r.status === 'pass').length
  const fails = results.filter(r => r.status === 'fail').length
  const uncertains = results.filter(r => r.status === 'uncertain').length
  const unknowns = results.filter(r => r.status === 'unknown').length

  // Determine overall result
  let canRun = null
  let message = ''

  if (fails > 0) {
    canRun = false
    message = `Your PC does not meet ${fails} requirement(s). Upgrading these components is recommended.`
  } else if (passes >= 3 && uncertains === 0) {
    canRun = true
    message = 'Your PC meets the minimum requirements for this game.'
  } else if (uncertains > 0) {
    canRun = null
    message = `Your PC may run this game, but we couldn't confidently compare ${uncertains} component(s). Check benchmarks for better accuracy.`
  } else {
    canRun = null
    message = 'Unable to determine compatibility. Please verify your PC specifications.'
  }

  return {
    canRun,
    message,
    breakdown
  }
}

export default {
  checkCompatibility,
  compareMemory,
  compareOS,
  compareCPU,
  compareGPU,
  compareStorage
}
