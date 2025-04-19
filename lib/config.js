/**
 * Configuration for image compression tiers
 * Each tier defines settings for image compression:
 * - maxWidth: Maximum width for image resizing
 * - quality: JPEG compression quality (0-1, where 1 is highest quality)
 */
module.exports = {
  imageTiers: {
    None: null,
    Low: {
      maxWidth: 2000,
      quality: 0.9
    },
    Medium: {
      maxWidth: 1400,
      quality: 0.7
    },
    High: {
      maxWidth: 1024,
      quality: 0.5
    }
  }
}; 