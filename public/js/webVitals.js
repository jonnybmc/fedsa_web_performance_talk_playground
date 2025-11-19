/**
 * Real User Monitoring (RUM) with web-vitals library
 *
 * This module implements field performance monitoring using the web-vitals
 * library with attribution. It captures Core Web Vitals from real users and
 * sends them to Google Analytics 4 (GA4) with debugging information.
 *
 * For demo/talk purposes, it also logs detailed attribution data to console.
 */

import { onCLS, onFCP, onFID, onINP, onLCP, onTTFB } from 'https://unpkg.com/web-vitals@4/dist/web-vitals.attribution.js?module';

/**
 * Send metric to Google Analytics 4
 */
function sendToGoogleAnalytics({ name, value, rating, delta, id, attribution }) {
  if (typeof gtag === 'undefined') {
    console.warn('Google Analytics not loaded - metric not sent:', name);
    return;
  }

  const eventParams = {
    value: Math.round(name === 'CLS' ? value * 1000 : value),
    metric_id: id,
    metric_value: value,
    metric_delta: delta,
    metric_rating: rating,
  };

  switch (name) {
    case 'CLS':
      Object.assign(eventParams, {
        debug_target: attribution.largestShiftTarget || '(not set)',
        debug_source: attribution.largestShiftSource || '(not set)',
        debug_time: attribution.largestShiftTime || 0,
        debug_value: attribution.largestShiftValue || 0,
        debug_load_state: attribution.loadState || '(not set)',
      });
      break;

    case 'LCP':
      Object.assign(eventParams, {
        debug_target: attribution.element || '(not set)',
        debug_url: attribution.url || '(not set)',
        debug_time_to_first_byte: attribution.timeToFirstByte || 0,
        debug_resource_load_delay: attribution.resourceLoadDelay || 0,
        debug_resource_load_time: attribution.resourceLoadTime || 0,
        debug_element_render_delay: attribution.elementRenderDelay || 0,
      });
      break;

    case 'INP':
      Object.assign(eventParams, {
        debug_target: attribution.interactionTarget || '(not set)',
        debug_interaction_type: attribution.interactionType || '(not set)',
        debug_load_state: attribution.loadState || '(not set)',
        debug_interaction_time: attribution.interactionTime || 0,
        debug_processing_duration: attribution.processingDuration || 0,
        debug_presentation_delay: attribution.presentationDelay || 0,
      });
      break;

    case 'FCP':
      Object.assign(eventParams, {
        debug_time_to_first_byte: attribution.timeToFirstByte || 0,
        debug_first_byte_to_fcp: attribution.firstByteToFCP || 0,
        debug_load_state: attribution.loadState || '(not set)',
      });
      break;

    case 'TTFB':
      Object.assign(eventParams, {
        debug_waiting_duration: attribution.waitingDuration || 0,
        debug_dns_duration: attribution.dnsDuration || 0,
        debug_connection_duration: attribution.connectionDuration || 0,
        debug_request_duration: attribution.requestDuration || 0,
      });
      break;
  }

  gtag('event', name, eventParams);

  console.log(`Sent ${name} to Google Analytics:`, {
    value,
    rating,
    eventParams
  });
}

/**
 * Log detailed attribution data to console for debugging
 */
function logToConsole({ name, value, rating, delta, id, attribution }) {
  const emoji = rating === 'good' ? '✅' : rating === 'needs-improvement' ? '⚠️' : '❌';
  const color = rating === 'good' ? 'color: green' : rating === 'needs-improvement' ? 'color: orange' : 'color: red';

  console.group(`%c${emoji} ${name}: ${Math.round(name === 'CLS' ? value * 1000 : value)}${name === 'CLS' ? '' : 'ms'}`, color);
  console.log('Rating:', rating);
  console.log('Delta:', delta);
  console.log('ID:', id);

  switch (name) {
    case 'CLS':
      console.log('Attribution:');
      console.log('  Largest Shift Target:', attribution.largestShiftTarget);
      console.log('  Largest Shift Source:', attribution.largestShiftSource);
      console.log('  Largest Shift Time:', attribution.largestShiftTime, 'ms');
      console.log('  Largest Shift Value:', attribution.largestShiftValue);
      console.log('  Load State:', attribution.loadState);
      console.log('\nTIP: This element caused the biggest layout shift!');
      if (attribution.largestShiftTarget) {
        console.log('   Inspect:', attribution.largestShiftTarget);
      }
      break;

    case 'LCP':
      console.log('Attribution:');
      console.log('  Element:', attribution.element);
      console.log('  URL:', attribution.url);
      console.log('  Time to First Byte:', attribution.timeToFirstByte, 'ms');
      console.log('  Resource Load Delay:', attribution.resourceLoadDelay, 'ms');
      console.log('  Resource Load Time:', attribution.resourceLoadTime, 'ms');
      console.log('  Element Render Delay:', attribution.elementRenderDelay, 'ms');
      console.log('\nTIP: This is the largest contentful element in viewport!');
      break;

    case 'INP':
      console.log('Attribution:');
      console.log('  Interaction Target:', attribution.interactionTarget);
      console.log('  Interaction Type:', attribution.interactionType);
      console.log('  Load State:', attribution.loadState);
      console.log('  Interaction Time:', attribution.interactionTime, 'ms');
      console.log('  Processing Duration:', attribution.processingDuration, 'ms');
      console.log('  Presentation Delay:', attribution.presentationDelay, 'ms');
      console.log('\nTIP: This interaction took the longest to respond!');
      if (attribution.interactionTarget) {
        console.log('   Element:', attribution.interactionTarget);
      }
      break;

    case 'FCP':
      console.log('Attribution:');
      console.log('  Time to First Byte:', attribution.timeToFirstByte, 'ms');
      console.log('  First Byte to FCP:', attribution.firstByteToFCP, 'ms');
      console.log('  Load State:', attribution.loadState);
      break;

    case 'TTFB':
      console.log('Attribution:');
      console.log('  Waiting Duration:', attribution.waitingDuration, 'ms');
      console.log('  DNS Duration:', attribution.dnsDuration, 'ms');
      console.log('  Connection Duration:', attribution.connectionDuration, 'ms');
      console.log('  Request Duration:', attribution.requestDuration, 'ms');
      break;
  }

  console.groupEnd();
}

/**
 * Initialize Web Vitals monitoring
 */
export function initWebVitals() {
  console.log('%cWeb Vitals RUM initialized', 'color: blue; font-weight: bold');
  console.log('%cCore Web Vitals will be reported as they occur.', 'color: blue');
  console.log('%cMetrics are sent to Google Analytics (if configured)', 'color: blue');
  console.log('');

  onCLS((metric) => {
    logToConsole(metric);
    sendToGoogleAnalytics(metric);
  });

  onFCP((metric) => {
    logToConsole(metric);
    sendToGoogleAnalytics(metric);
  });

  onFID((metric) => {
    logToConsole(metric);
    sendToGoogleAnalytics(metric);
  });

  onINP((metric) => {
    logToConsole(metric);
    sendToGoogleAnalytics(metric);
  });

  onLCP((metric) => {
    logToConsole(metric);
    sendToGoogleAnalytics(metric);
  });

  onTTFB((metric) => {
    logToConsole(metric);
    sendToGoogleAnalytics(metric);
  });

  console.log('%cAll Web Vitals listeners registered', 'color: green; font-weight: bold');
  console.log('');
}

console.log(`%c
╔══════════════════════════════════════════════════════════╗
║  Real User Monitoring (RUM) Active                      ║
║  Powered by web-vitals@4 with attribution              ║
╚══════════════════════════════════════════════════════════╝

Monitoring Core Web Vitals:
  • CLS (Cumulative Layout Shift) - Target: <0.1
  • LCP (Largest Contentful Paint) - Target: <2.5s
  • INP (Interaction to Next Paint) - Target: <200ms
  • FCP (First Contentful Paint) - Target: <1.8s
  • TTFB (Time to First Byte) - Target: <800ms

Attribution data will identify:
  • Which elements cause problems
  • When problems occur (load state)
  • How long each phase takes

For this demo:
  • Metrics logged to console with full debugging info
  • Metrics sent to Google Analytics 4 (if configured)
  • Useful for diagnosing performance issues in production
`, 'color: blue');
