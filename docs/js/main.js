/**
 * Main Entry Point
 * Initializes all documentation modules
 */
import { ThemeManager } from './theme.js';
import { Navigation } from './navigation.js';
import { CodeHighlighter } from './code-highlight.js';

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme manager
    const theme = new ThemeManager();
    theme.init();

    // Initialize navigation
    const nav = new Navigation();
    nav.init();

    // Initialize code highlighter
    const codeHighlight = new CodeHighlighter();
    codeHighlight.init();

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });

                // Update URL without scrolling
                history.pushState(null, '', targetId);
            }
        });
    });

    // Add scroll-based header shadow
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 10) {
                header.style.boxShadow = 'var(--shadow-md)';
            } else {
                header.style.boxShadow = 'none';
            }
        });
    }
});
