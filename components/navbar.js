class CustomNavbar extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        nav {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          z-index: 10;
        }
        .logo-container {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .logo {
          color: white;
          font-weight: 700;
          font-size: 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .logo-img {
          height: 2rem;
          width: auto;
          border-radius: 0.375rem;
        }
        .nav-links {
          display: flex;
          gap: 1.5rem;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .nav-link {
          color: rgba(255, 255, 255, 0.9);
          text-decoration: none;
          font-weight: 500;
          font-size: 0.95rem;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }
        .nav-link:hover {
          color: white;
          transform: translateY(-1px);
        }
        .nav-link i {
          width: 1rem;
          height: 1rem;
        }
      </style>
      <nav>
        <div class="logo-container">
          <img src="http://static.photos/technology/320x240/42" alt="Logo" class="logo-img">
          <span class="logo">PR Visionary</span>
        </div>
        <ul class="nav-links">
          <li>
            <a href="#" class="nav-link">
              <i data-feather="home"></i>
              <span>Dashboard</span>
            </a>
          </li>
          <li>
            <a href="#" class="nav-link">
              <i data-feather="bar-chart-2"></i>
              <span>Analytics</span>
            </a>
          </li>
          <li>
            <a href="#" class="nav-link">
              <i data-feather="settings"></i>
              <span>Settings</span>
            </a>
          </li>
        </ul>
      </nav>
    `;
    
    // Initialize feather icons after component is rendered
    this.shadowRoot.querySelectorAll('[data-feather]').forEach(el => {
      feather.replace();
    });
  }
}
customElements.define('custom-navbar', CustomNavbar);