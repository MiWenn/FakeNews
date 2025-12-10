import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <h1>🔍 FakeNews Analyzer</h1>
          <p className="header-subtitle">
            Prüfen Sie Webseiten und Artikel auf Seriosität und Fake News
          </p>
        </div>
      </div>
    </header>
  );
}

export default Header;
