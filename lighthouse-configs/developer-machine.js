/**
 * Lighthouse Config: Developer Machine (Unthrottled)
 *
 * SCENARIO: "Works fine on my machine" - The TechMart Problem
 * - MacBook Pro M1/M2 on office desk
 * - 100+ Mbps office WiFi or ethernet
 * - Desktop browser, high-end hardware
 * - Network: Unthrottled (fast office connection)
 * - CPU: No throttling (native M1/M2 performance)
 *
 * PURPOSE: Demonstrates why the TechMart redesign passed QA but failed in production.
 * This represents the unrealistic testing conditions that led to the disaster.
 *
 * TEACHING POINT:
 * - Developer machine score: 95/100 ✅ (misleading!)
 * - African rural score: 28/100 ❌ (reality for 40% of users)
 * → Never test performance only on high-end hardware with fast WiFi
 *
 * Use this config to show stakeholders the danger of unthrottled testing.
 */

export default {
  extends: 'lighthouse:default',

  settings: {
    // Desktop form factor (MacBook Pro screen)
    formFactor: 'desktop',
    throttling: {
      // Minimal throttling (simulates fast office WiFi/ethernet)
      rttMs: 10,                     // 10ms round-trip time (local network)
      throughputKbps: 100000,        // 100 Mbps download (typical office)
      requestLatencyMs: 10 * 0.9,    // Minimal latency
      downloadThroughputKbps: 100000,
      uploadThroughputKbps: 50000,   // 50 Mbps upload

      // No CPU throttling (native M1/M2 performance)
      cpuSlowdownMultiplier: 1,      // No slowdown
    },
    screenEmulation: {
      mobile: false,
      width: 1920,
      height: 1080,
      deviceScaleFactor: 2,           // Retina display
      disabled: false,
    },
    emulatedUserAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',

    // Output settings
    output: 'html',

    // Run only performance, accessibility, best-practices, and SEO
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
  },
};
