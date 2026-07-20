export default function Footer() {
  return (
    <footer className="border-t border-line mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row justify-between gap-4 text-sm text-muted">
        <p className="font-display font-semibold text-ink">Store<span className="text-cobalt">.</span></p>
        <p>Cash on delivery, everywhere. No card required.</p>
        <p>&copy; {new Date().getFullYear()} Store. Built for learning, not for sale.</p>
      </div>
    </footer>
  );
}
