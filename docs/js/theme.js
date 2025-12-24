/**
 * Theme Manager
 * Handles light/dark theme switching with localStorage persistence
 * and system preference detection
 */
export class ThemeManager {
    constructor() {
        this.storageKey = 'docs-theme';
        this.root = document.documentElement;
        this.toggleBtn = null;
    }

    /**
     * Initialize the theme manager
     */
    init() {
        this.loadTheme();
        this.bindToggle();
        this.watchSystemPreference();
    }

    /**
     * Load theme from localStorage or system preference
     */
    loadTheme() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved && (saved === 'light' || saved === 'dark')) {
                this.setTheme(saved, false);
            } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                this.setTheme('dark', false);
            } else {
                this.setTheme('light', false);
            }
        } catch (e) {
            // localStorage not available, use system preference
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                this.setTheme('dark', false);
            }
        }
    }

    /**
     * Set the theme
     * @param {string} theme - 'light' or 'dark'
     * @param {boolean} save - Whether to save to localStorage
     */
    setTheme(theme, save = true) {
        this.root.setAttribute('data-theme', theme);

        if (save) {
            try {
                localStorage.setItem(this.storageKey, theme);
            } catch (e) {
                // localStorage not available
            }
        }

        this.updateToggleButton(theme);
    }

    /**
     * Toggle between light and dark themes
     */
    toggle() {
        const current = this.root.getAttribute('data-theme') || 'light';
        const newTheme = current === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    /**
     * Bind click event to theme toggle button
     */
    bindToggle() {
        this.toggleBtn = document.querySelector('.theme-toggle');
        if (this.toggleBtn) {
            this.toggleBtn.addEventListener('click', () => this.toggle());

            // Set initial button state
            const currentTheme = this.root.getAttribute('data-theme') || 'light';
            this.updateToggleButton(currentTheme);
        }
    }

    /**
     * Update toggle button appearance
     * @param {string} theme - Current theme
     */
    updateToggleButton(theme) {
        if (!this.toggleBtn) return;

        const label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
        this.toggleBtn.setAttribute('aria-label', label);
        this.toggleBtn.setAttribute('title', label);
    }

    /**
     * Watch for system preference changes
     */
    watchSystemPreference() {
        if (!window.matchMedia) return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        mediaQuery.addEventListener('change', (e) => {
            // Only auto-switch if user hasn't set a preference
            try {
                const saved = localStorage.getItem(this.storageKey);
                if (!saved) {
                    this.setTheme(e.matches ? 'dark' : 'light', false);
                }
            } catch (err) {
                this.setTheme(e.matches ? 'dark' : 'light', false);
            }
        });
    }
}
