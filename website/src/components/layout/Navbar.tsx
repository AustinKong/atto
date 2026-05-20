import './Navbar.css';

const githubHref = 'https://github.com/AustinKong/atto';
const getStartedHref = '/download';

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-left">
        <a className="navbar-brand atto-button atto-button-ghost" href="/" aria-label="Atto home">
          <span className="navbar-mark" aria-hidden="true">
            <img src="/light-mode.svg" alt="" />
          </span>
          <span>Atto</span>
        </a>
        <a className="atto-button atto-button-ghost" href="/blog">
          Blog
        </a>
      </div>

      <nav className="navbar-right" aria-label="Primary navigation">
        <a className="atto-button atto-button-ghost" href={githubHref} target="_blank" rel="noreferrer">
          GitHub
        </a>
        <a className="atto-button atto-button-primary" href={getStartedHref} target="_blank" rel="noreferrer">
          Get Started
        </a>
      </nav>
    </header>
  );
}
