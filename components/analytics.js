'use client';

const DEFAULT_SOURCE = 'ai-job-risk-calculator';
const DEFAULT_TOOL = 'AI Job Risk Calculator';

export function trackToolEvent(eventName, details = {}) {
  if (typeof window === 'undefined') return;

  const payload = {
    type: 'ia_tool_event',
    event: eventName,
    source: details.source || DEFAULT_SOURCE,
    tool: details.tool || DEFAULT_TOOL,
    surface: details.surface || 'ai_job_risk_app',
  };

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    tool_source: payload.source,
    tool_name: payload.tool,
    capture_surface: payload.surface,
  });

  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, {
      event_category: 'email_capture',
      event_label: payload.source,
      tool_source: payload.source,
      tool_name: payload.tool,
      capture_surface: payload.surface,
    });
  }

  if (window.parent && window.parent !== window) {
    window.parent.postMessage(payload, 'https://inspireambitions.com');
  }
}
