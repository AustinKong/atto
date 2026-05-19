import './Navbar.css';

const githubHref = 'https://github.com/AustinKong/atto';
const getStartedHref = 'https://github.com/AustinKong/atto/releases';

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-left">
        <a className="navbar-brand" href="/" aria-label="Atto home">
          <span className="navbar-mark" aria-hidden="true">
            <img src="/light-mode.svg" alt="" />
          </span>
          <span>Atto</span>
        </a>
        <a className="navbar-link" href="/blog">
          Blog
        </a>
      </div>

      <nav className="navbar-right" aria-label="Primary navigation">
        <a className="navbar-link" href={githubHref} target="_blank" rel="noreferrer">
          GitHub
        </a>
        <a className="navbar-cta" href={getStartedHref} target="_blank" rel="noreferrer">
          Get Started
        </a>
      </nav>
    </header>
  );
}
