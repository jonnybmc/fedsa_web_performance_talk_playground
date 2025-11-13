/**
 * Lighthouse Config: Budget Consumer Windows Laptop
 *
 * SCENARIO: Typical consumer's home laptop - The "Middle Class" Gap
 * - $300-500 Windows laptop from Best Buy, Takealot, Amazon
 * - Budget Intel Celeron/Core i3 or AMD Athlon processor
 * - Home WiFi connection (not premium office fiber)
 * - Network: 20-50 Mbps download, 60ms latency
 * - CPU: 4-5x slowdown
 *
 * REPRESENTS: 60%+ of desktop browsing happens on budget laptops, not MacBook Pros
 *
 * COMMON MODELS:
 * - Acer Aspire Go 15 (Intel Core i3-N355, 8GB RAM)
 * - Lenovo IdeaPad Slim 3i (Intel Core i3-1315U, 8GB RAM)
 * - HP 14" (Intel Celeron N4020, 4-8GB RAM)
 * - ASUS Vivobook (AMD Athlon, 4-8GB RAM)
 *
 * PRICE RANGE:
 * - USA: $300-500
 * - South Africa: R5,000-R8,000
 * - Europe: €350-550
 *
 * PURPOSE: Demonstrates the "consumer laptop" blind spot
 * Businesses test on:
 * - MacBook Pro M2 ($2000) ✅ Tested
 * - iPhone 15 Pro ($1000) ✅ Tested
 * But miss:
 * - Acer Aspire ($400) ❌ Never tested ← This config!
 *
 * TEACHING POINT:
 * Developer machine score: 78/100
 * Consumer laptop score: ~55/100
 * → Even desktop users on consumer hardware struggle!
 */

export default {
  extends: 'lighthouse:default',

  settings: {
    // Desktop form factor (budget laptop screen)
    formFactor: 'desktop',

    throttling: {
      // Network throttling (home WiFi, not premium office fiber)
      rttMs: 60,                     // 60ms round-trip time (typical home WiFi)
      throughputKbps: 30000,         // 30 Mbps download (average home broadband)
      requestLatencyMs: 60 * 0.9,    // Request latency
      downloadThroughputKbps: 30000,
      uploadThroughputKbps: 10000,   // 10 Mbps upload (typical home ratio)

      // CPU throttling (budget Intel Celeron/Core i3 or AMD Athlon)
      cpuSlowdownMultiplier: 4.5,    // 4.5x slowdown (budget laptop CPU)
    },

    screenEmulation: {
      mobile: false,
      width: 1366,                   // Most common budget laptop resolution
      height: 768,                   // HD (not FHD) - budget screens
      deviceScaleFactor: 1,          // No retina on budget laptops
      disabled: false,
    },

    // Windows 11 Chrome user agent (most common consumer OS)
    emulatedUserAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',

    // Output settings
    output: 'html',

    // Run only performance, accessibility, best-practices, and SEO
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
  },
};
