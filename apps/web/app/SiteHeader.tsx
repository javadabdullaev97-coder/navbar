import Link from "next/link";

// Шапка сайта — как на нормальном десктопном сайте: логотип слева, навигация справа.
export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="brand">
          nav<span>bar</span>
        </Link>
        <nav className="site-nav">
          <Link href="/">Каталог</Link>
          <Link href="/me">Мои записи</Link>
          <Link href="/login" className="nav-cta">Кабинет мастера</Link>
        </nav>
      </div>
    </header>
  );
}
