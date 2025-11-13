/**
 * Lighthouse Config: African Suburban Network Conditions
 *
 * SCENARIO: Suburban areas (townships, smaller cities)
 * - 3G/4G mixed connection
 * - Lower-tier Android device (budget smartphones)
 * - Network: 8-12 Mbps download, 250ms latency
 * - CPU: 6x slowdown
 *
 * Use this to test performance for users in suburban areas with moderate connectivity.
 */

export default {
  extends: 'lighthouse:default',

  settings: {
    // Mobile emulation (standard Moto G4)
    formFactor: 'mobile',
    throttling: {
      // Network throttling
      rttMs: 250,                    // 250ms round-trip time (suburban Africa)
      throughputKbps: 10000,         // 10 Mbps download (average of 8-12 Mbps range)
      requestLatencyMs: 250 * 0.9,   // Server latency
      downloadThroughputKbps: 10000,
      uploadThroughputKbps: 3500,    // ~3.5 Mbps upload (typical 3G/4G ratio)

      // CPU throttling
      cpuSlowdownMultiplier: 6,      // 6x slowdown (lower-tier Android)
    },
    screenEmulation: {
      mobile: true,
      width: 360,
      height: 640,
      deviceScaleFactor: 2.625,
      disabled: false,
    },
    emulatedUserAgent: 'Mozilla/5.0 (Linux; Android 10; SM-A105F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',

    // Output settings
    output: 'html',

    // Run only performance, accessibility, best-practices, and SEO
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
  },
};
