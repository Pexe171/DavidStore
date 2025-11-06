const Footer = () => {
  return (
    <footer
      style={{
        background: '#0f172a',
        color: '#e2e8f0',
        padding: '2rem 0',
        marginTop: 'auto'
      }}
    >
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <h3>David Store</h3>
          <p>Experiência omnichannel inspirada nas maiores varejistas do Brasil.</p>
        </div>
        <div>
          <h4>Atendimento</h4>
          <p>0800 4004-2024</p>
          <p>contato@davidstore.com</p>
        </div>
        <div>
          <h4>Institucional</h4>
          <p>Sobre nós</p>
          <p>Política de privacidade</p>
          <p>Trabalhe conosco</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
