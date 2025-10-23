class CustomFooter extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        footer {
          background: #1a202c;
          color: white;
          padding: 1.5rem 2rem;
          text-align: center;
          font-size: 0.875rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        .footer-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        .footer-links {
          display: flex;
          gap: 1rem;
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .footer-link {
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          transition: color 0.2s;
        }
        .footer-link:hover {
          color: white;
        }
        .copyright {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.75rem;
        }
      </style>
      <footer>
        <div class="footer-content">
          <ul class="footer-links">
            <li><a href="#" class="footer-link">Privacy Policy</a></li>
            <li><a href="#" class="footer-link">Terms of Service</a></li>
            <li><a href="#" class="footer-link">Documentation</a></li>
            <li><a href="#" class="footer-link">Support</a></li>
          </ul>
          <div class="copyright">
            &copy; ${new Date().getFullYear()} PR Visionary Analytics. All rights reserved.
          </div>
        </div>
      </footer>
    `;
  }
}
customElements.define('custom-footer', CustomFooter);