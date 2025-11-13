/**
 * Lighthouse Config: African Rural Network Conditions
 *
 * SCENARIO: Rural areas, remote locations
 * - 2G/3G connection (spotty coverage)
 * - Very budget Android device (entry-level smartphones)
 * - Network: 2-5 Mbps download, 400ms latency
 * - CPU: 8x slowdown
 *
 * Use this to test performance for users in rural areas with poor connectivity.
 * This represents the worst-case scenario for African users.
 */

export default {
  extends: 'lighthouse:default',

  settings: {
    // Mobile emulation (standard Moto G4)
    formFactor: 'mobile',
    throttling: {
      // Network throttling
      rttMs: 400,                    // 400ms round-trip time (rural Africa)
      throughputKbps: 3500,          // 3.5 Mbps download (average of 2-5 Mbps range)
      requestLatencyMs: 400 * 0.9,   // Server latency
      downloadThroughputKbps: 3500,
      uploadThroughputKbps: 1500,    // ~1.5 Mbps upload (typical 2G/3G ratio)

      // CPU throttling
      cpuSlowdownMultiplier: 8,      // 8x slowdown (very budget Android)
    },
    screenEmulation: {
      mobile: true,
      width: 360,
      height: 640,
      deviceScaleFactor: 2.625,
      disabled: false,
    },
    emulatedUserAgent: 'Mozilla/5.0 (Linux; Android 9; SM-A013F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',

    // Output settings
    output: 'html',

    // Run only performance, accessibility, best-practices, and SEO
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
  },
};
