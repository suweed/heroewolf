const CLIENT_LOGOS = [
  'xxx', 'xxxxx', 'xxxxx', 'xxxx', 'xxxxx', 'xxxx xxxx',
]

export default function ClientsSection() {
  return (
    <section className="clients-section">
      <div className="clients-inner">
        <p className="clients-eyebrow">Marcas que confían en Wolfsellers</p>
        <h2 className="clients-heading">Nuestros clientes</h2>
        <p className="clients-description">
          Marcas líderes en México y LATAM que confiaron en nosotros para sus
          proyectos de Adobe Experience Cloud.
        </p>

        {/* Logo grid placeholder */}
        <div className="clients-logos">
          {CLIENT_LOGOS.map((name) => (
            <div key={name} className="clients-logo-slot">
              <span className="clients-logo-label">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
