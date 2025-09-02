import DOMPurify from 'dompurify';

/**
 * Escape HTML special characters in a string to prevent attribute injection.
 * @param {string} str - Input string to escape.
 * @returns {string} Escaped string safe for HTML usage.
 */
export function escapeHTML(str = '') {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Sanitize an HTML string allowing only a limited set of tags.
 * Uses DOMPurify if available.
 * @param {string} html - Raw HTML content.
 * @returns {string} Sanitized HTML.
 */
export function sanitizeHTML(html = '') {
    return DOMPurify.sanitize(String(html), {
        ALLOWED_TAGS: ['br', 'strong', 'em', 'b', 'i'],
        ALLOWED_ATTR: []
    });
}
