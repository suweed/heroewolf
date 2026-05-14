const NAV_LINKS = ['Servicios', 'Portafolio', 'Blog', 'Compañía', 'FAQ', 'Contacto']

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <a href="/" className="navbar-logo">
          <span className="navbar-logo-text">
            WOLF<span className="navbar-logo-thin">SELLERS</span>
          </span>
        </a>

        {/* Navigation links */}
        <nav className="navbar-links" aria-label="Menú principal">
          {NAV_LINKS.map((link) => (
            <a key={link} href="#" className="navbar-link">
              {link}
            </a>
          ))}
        </nav>

        {/* Right actions */}
        <div className="navbar-actions">
          <button className="navbar-lang" aria-label="Cambiar idioma">EN</button>
          <a href="#" className="navbar-cta">Hablar con un experto</a>
        </div>
      </div>
    </header>
  )
}
