export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-6">
      <div className="mx-auto max-w-4xl px-4 text-center text-sm text-slate-500">
        <p>
          Built for{" "}
          <a
            href="https://digitalheroesco.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-brand-600 hover:text-brand-700 hover:underline"
          >
            Digital Heroes Training Task
          </a>
        </p>
      </div>
    </footer>
  );
}
