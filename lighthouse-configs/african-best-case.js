/**
 * Lighthouse Config: African Best-Case Network Conditions
 *
 * SCENARIO: Premium fiber connections (affluent areas, business districts)
 * - High-speed fiber (100+ Mbps)
 * - High-end Android device or iPhone
 * - Network: 100 Mbps download, 40ms latency
 * - CPU: 1x (no throttling)
 *
 * Use this to test performance for users with premium connectivity.
 * Represents best-case scenario (top 10-15% of African users).
 */

export default {
  extends: 'lighthouse:default',

  settings: {
    // Mobile emulation (standard Moto G4)
    formFactor: 'mobile',
    throttling: {
      // Network throttling
      rttMs: 40,                     // 40ms round-trip time (fiber connection)
      throughputKbps: 100000,        // 100 Mbps download
      requestLatencyMs: 40 * 0.9,    // Server latency
      downloadThroughputKbps: 100000,
      uploadThroughputKbps: 50000,   // 50 Mbps upload (typical fiber ratio)

      // CPU throttling
      cpuSlowdownMultiplier: 1,      // No throttling (high-end device)
    },
    screenEmulation: {
      mobile: true,
      width: 360,
      height: 640,
      deviceScaleFactor: 2.625,
      disabled: false,
    },
    emulatedUserAgent: 'Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',

    // Output settings
    output: 'html',

    // Run only performance, accessibility, best-practices, and SEO
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
  },
};
