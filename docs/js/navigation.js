/**
 * Navigation Manager
 * Handles sidebar navigation, mobile menu toggle, and active link highlighting
 */
export class Navigation {
    constructor() {
        this.sidebar = document.querySelector('.sidebar');
        this.menuToggle = document.querySelector('.menu-toggle');
        this.overlay = null;
        this.currentPath = this.getCurrentPath();
    }

    /**
     * Initialize navigation
     */
    init() {
        this.createOverlay();
        this.setActiveLink();
        this.bindEvents();
    }

    /**
     * Get current page path
     * @returns {string} Current page filename
     */
    getCurrentPath() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html';
        return filename === '' ? 'index.html' : filename;
    }

    /**
     * Create mobile overlay element
     */
    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'sidebar-overlay';
        this.overlay.setAttribute('aria-hidden', 'true');
        document.body.appendChild(this.overlay);
    }

    /**
     * Set active link in sidebar based on current page
     */
    setActiveLink() {
        const navLinks = document.querySelectorAll('.nav-link');

        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            const linkPath = href.split('/').pop();

            if (linkPath === this.currentPath) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            } else {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
            }
        });
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Mobile menu toggle
        if (this.menuToggle) {
            this.menuToggle.addEventListener('click', () => this.toggleMobileMenu());
        }

        // Close menu when clicking overlay
        if (this.overlay) {
            this.overlay.addEventListener('click', () => this.closeMobileMenu());
        }

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.sidebar?.classList.contains('open')) {
                this.closeMobileMenu();
            }
        });

        // Close menu when clicking a nav link (mobile)
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    this.closeMobileMenu();
                }
            });
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && this.sidebar?.classList.contains('open')) {
                this.closeMobileMenu();
            }
        });
    }

    /**
     * Toggle mobile menu visibility
     */
    toggleMobileMenu() {
        const isOpen = this.sidebar?.classList.contains('open');

        if (isOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    /**
     * Open mobile menu
     */
    openMobileMenu() {
        this.sidebar?.classList.add('open');
        this.overlay?.classList.add('visible');
        this.menuToggle?.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';

        // Focus first nav link for accessibility
        const firstLink = this.sidebar?.querySelector('.nav-link');
        firstLink?.focus();
    }

    /**
     * Close mobile menu
     */
    closeMobileMenu() {
        this.sidebar?.classList.remove('open');
        this.overlay?.classList.remove('visible');
        this.menuToggle?.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';

        // Return focus to menu toggle
        this.menuToggle?.focus();
    }
}
