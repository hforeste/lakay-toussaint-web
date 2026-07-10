import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section">
      <article className="card">
        <h1>Page not found</h1>
        <p>The page or event you are looking for is not available.</p>
        <Link className="button primary" href="/">
          Return home
        </Link>
      </article>
    </section>
  );
}
