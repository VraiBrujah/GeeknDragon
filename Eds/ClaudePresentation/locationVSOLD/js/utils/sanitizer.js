/**
 * Utility functions for sanitizing HTML content.
 * Uses DOMPurify when available to prevent XSS.
 */
function sanitizeHTML(html) {
  if (typeof window !== 'undefined') {
    if (window.DOMPurify) {
      return window.DOMPurify.sanitize(html);
    }
  } else if (typeof global !== 'undefined' && global.DOMPurify) {
    return global.DOMPurify.sanitize(html);
  } else if (typeof DOMPurify !== 'undefined') {
    return DOMPurify.sanitize(html);
  }
  return html;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { sanitizeHTML };
} else {
  window.sanitizeHTML = sanitizeHTML;
}
