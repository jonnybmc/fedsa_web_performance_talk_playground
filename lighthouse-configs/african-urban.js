/**
 * Lighthouse Config: African Urban Network Conditions
 *
 * SCENARIO: Major cities (Johannesburg, Lagos, Nairobi, Cairo)
 * - 4G/LTE connection
 * - Mid-tier Android device (Samsung Galaxy A series)
 * - Network: 15-20 Mbps download, 180ms latency
 * - CPU: 4x slowdown
 *
 * Use this to test performance for users in urban areas with stable connectivity.
 */

export default {
  extends: 'lighthouse:default',

  settings: {
    // Mobile emulation (standard Moto G4)
    formFactor: 'mobile',
    throttling: {
      // Network throttling
      rttMs: 180,                    // 180ms round-trip time (urban Africa)
      throughputKbps: 17500,         // 17.5 Mbps download (average of 15-20 Mbps range)
      requestLatencyMs: 180 * 0.9,   // Server latency
      downloadThroughputKbps: 17500,
      uploadThroughputKbps: 7500,    // ~7.5 Mbps upload (typical 4G ratio)

      // CPU throttling
      cpuSlowdownMultiplier: 4,      // 4x slowdown (mid-tier Android)
    },
    screenEmulation: {
      mobile: true,
      width: 360,
      height: 640,
      deviceScaleFactor: 2.625,
      disabled: false,
    },
    emulatedUserAgent: 'Mozilla/5.0 (Linux; Android 11; SM-A515F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',

    // Output settings
    output: 'html',

    // Run only performance, accessibility, best-practices, and SEO
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
  },
};
