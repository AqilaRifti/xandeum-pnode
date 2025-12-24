/**
 * Code Highlighter
 * Handles syntax highlighting and copy-to-clipboard functionality for code blocks
 */
export class CodeHighlighter {
    constructor() {
        this.codeBlocks = document.querySelectorAll('pre code');
    }

    /**
     * Initialize code highlighter
     */
    init() {
        this.wrapCodeBlocks();
        this.applyHighlighting();
    }

    /**
     * Wrap code blocks with container, header, and copy button
     */
    wrapCodeBlocks() {
        this.codeBlocks.forEach(codeEl => {
            const pre = codeEl.parentElement;
            if (!pre || pre.parentElement?.classList.contains('code-block')) return;

            // Get language from class
            const langClass = Array.from(codeEl.classList).find(c => c.startsWith('language-'));
            const lang = langClass ? langClass.replace('language-', '') : 'text';

            // Create wrapper
            const wrapper = document.createElement('div');
            wrapper.className = 'code-block';

            // Create header
            const header = document.createElement('div');
            header.className = 'code-header';

            // Language label
            const langLabel = document.createElement('span');
            langLabel.className = 'code-lang';
            langLabel.textContent = this.formatLanguage(lang);

            // Copy button
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.setAttribute('aria-label', 'Copy code to clipboard');
            copyBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        <span>Copy</span>
      `;

            copyBtn.addEventListener('click', () => this.copyToClipboard(codeEl.textContent, copyBtn));

            // Assemble
            header.appendChild(langLabel);
            header.appendChild(copyBtn);
            wrapper.appendChild(header);

            // Wrap pre element
            pre.parentNode.insertBefore(wrapper, pre);
            wrapper.appendChild(pre);
        });
    }

    /**
     * Format language name for display
     * @param {string} lang - Language identifier
     * @returns {string} Formatted language name
     */
    formatLanguage(lang) {
        const langMap = {
            'js': 'JavaScript',
            'javascript': 'JavaScript',
            'ts': 'TypeScript',
            'typescript': 'TypeScript',
            'jsx': 'JSX',
            'tsx': 'TSX',
            'html': 'HTML',
            'css': 'CSS',
            'scss': 'SCSS',
            'json': 'JSON',
            'bash': 'Bash',
            'shell': 'Shell',
            'sh': 'Shell',
            'zsh': 'Shell',
            'yaml': 'YAML',
            'yml': 'YAML',
            'md': 'Markdown',
            'markdown': 'Markdown',
            'sql': 'SQL',
            'graphql': 'GraphQL',
            'python': 'Python',
            'py': 'Python',
            'env': 'Environment',
            'text': 'Text',
            'plaintext': 'Text'
        };
        return langMap[lang.toLowerCase()] || lang.toUpperCase();
    }

    /**
     * Copy code to clipboard
     * @param {string} code - Code to copy
     * @param {HTMLElement} button - Copy button element
     */
    async copyToClipboard(code, button) {
        try {
            await navigator.clipboard.writeText(code);
            this.showCopySuccess(button);
        } catch (err) {
            // Fallback for older browsers
            this.fallbackCopy(code, button);
        }
    }

    /**
     * Fallback copy method for browsers without Clipboard API
     * @param {string} code - Code to copy
     * @param {HTMLElement} button - Copy button element
     */
    fallbackCopy(code, button) {
        const textarea = document.createElement('textarea');
        textarea.value = code;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();

        try {
            document.execCommand('copy');
            this.showCopySuccess(button);
        } catch (err) {
            this.showCopyError(button);
        }

        document.body.removeChild(textarea);
    }

    /**
     * Show copy success state
     * @param {HTMLElement} button - Copy button element
     */
    showCopySuccess(button) {
        const span = button.querySelector('span');
        const originalText = span.textContent;

        button.classList.add('copied');
        span.textContent = 'Copied!';

        setTimeout(() => {
            button.classList.remove('copied');
            span.textContent = originalText;
        }, 2000);
    }

    /**
     * Show copy error state
     * @param {HTMLElement} button - Copy button element
     */
    showCopyError(button) {
        const span = button.querySelector('span');
        span.textContent = 'Failed';

        setTimeout(() => {
            span.textContent = 'Copy';
        }, 2000);
    }

    /**
     * Apply basic syntax highlighting
     */
    applyHighlighting() {
        this.codeBlocks.forEach(codeEl => {
            const langClass = Array.from(codeEl.classList).find(c => c.startsWith('language-'));
            const lang = langClass ? langClass.replace('language-', '') : 'text';

            let html = codeEl.innerHTML;

            // Apply highlighting based on language
            switch (lang.toLowerCase()) {
                case 'js':
                case 'javascript':
                case 'ts':
                case 'typescript':
                case 'jsx':
                case 'tsx':
                    html = this.highlightJS(html);
                    break;
                case 'html':
                case 'xml':
                    html = this.highlightHTML(html);
                    break;
                case 'css':
                case 'scss':
                    html = this.highlightCSS(html);
                    break;
                case 'bash':
                case 'shell':
                case 'sh':
                case 'zsh':
                    html = this.highlightShell(html);
                    break;
                case 'json':
                    html = this.highlightJSON(html);
                    break;
            }

            codeEl.innerHTML = html;
        });
    }

    /**
     * Highlight JavaScript/TypeScript code
     * @param {string} html - Code HTML
     * @returns {string} Highlighted HTML
     */
    highlightJS(html) {
        // Comments
        html = html.replace(/(\/\/.*$)/gm, '<span class="token-comment">$1</span>');
        html = html.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="token-comment">$1</span>');

        // Strings
        html = html.replace(/(&quot;[^&]*&quot;|'[^']*'|`[^`]*`)/g, '<span class="token-string">$1</span>');

        // Keywords
        const keywords = ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'extends', 'import', 'export', 'from', 'default', 'async', 'await', 'try', 'catch', 'throw', 'new', 'this', 'super', 'static', 'get', 'set', 'typeof', 'instanceof', 'in', 'of', 'true', 'false', 'null', 'undefined', 'interface', 'type', 'enum', 'implements', 'private', 'public', 'protected', 'readonly'];
        keywords.forEach(kw => {
            const regex = new RegExp(`\\b(${kw})\\b`, 'g');
            html = html.replace(regex, '<span class="token-keyword">$1</span>');
        });

        // Numbers
        html = html.replace(/\b(\d+\.?\d*)\b/g, '<span class="token-number">$1</span>');

        // Functions
        html = html.replace(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g, '<span class="token-function">$1</span>(');

        return html;
    }

    /**
     * Highlight HTML code
     * @param {string} html - Code HTML
     * @returns {string} Highlighted HTML
     */
    highlightHTML(html) {
        // Tags
        html = html.replace(/(&lt;\/?)([\w-]+)/g, '$1<span class="token-tag">$2</span>');

        // Attributes
        html = html.replace(/\s([\w-]+)=/g, ' <span class="token-attr-name">$1</span>=');

        // Attribute values
        html = html.replace(/=(&quot;[^&]*&quot;)/g, '=<span class="token-attr-value">$1</span>');

        return html;
    }

    /**
     * Highlight CSS code
     * @param {string} html - Code HTML
     * @returns {string} Highlighted HTML
     */
    highlightCSS(html) {
        // Comments
        html = html.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="token-comment">$1</span>');

        // Properties
        html = html.replace(/([\w-]+)\s*:/g, '<span class="token-property">$1</span>:');

        // Values with units
        html = html.replace(/:\s*([^;{]+)/g, ': <span class="token-string">$1</span>');

        // Selectors
        html = html.replace(/^([^{]+)\{/gm, '<span class="token-tag">$1</span>{');

        return html;
    }

    /**
     * Highlight Shell commands
     * @param {string} html - Code HTML
     * @returns {string} Highlighted HTML
     */
    highlightShell(html) {
        // Comments
        html = html.replace(/(#.*$)/gm, '<span class="token-comment">$1</span>');

        // Commands at start of line
        html = html.replace(/^(\s*)([\w-]+)/gm, '$1<span class="token-function">$2</span>');

        // Strings
        html = html.replace(/(&quot;[^&]*&quot;|'[^']*')/g, '<span class="token-string">$1</span>');

        // Flags
        html = html.replace(/\s(--?[\w-]+)/g, ' <span class="token-keyword">$1</span>');

        return html;
    }

    /**
     * Highlight JSON code
     * @param {string} html - Code HTML
     * @returns {string} Highlighted HTML
     */
    highlightJSON(html) {
        // Property names
        html = html.replace(/(&quot;[\w-]+&quot;)\s*:/g, '<span class="token-property">$1</span>:');

        // String values
        html = html.replace(/:\s*(&quot;[^&]*&quot;)/g, ': <span class="token-string">$1</span>');

        // Numbers
        html = html.replace(/:\s*(\d+\.?\d*)/g, ': <span class="token-number">$1</span>');

        // Booleans and null
        html = html.replace(/:\s*(true|false|null)\b/g, ': <span class="token-keyword">$1</span>');

        return html;
    }
}
