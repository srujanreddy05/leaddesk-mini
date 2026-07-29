import LeadForm from "../components/LeadForm.jsx";
import Footer from "../components/Footer.jsx";

export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-slate-900">LeadDesk Mini</h1>
            <p className="mt-2 text-slate-600">
              Tell us about your project and we'll get back to you.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <LeadForm />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
