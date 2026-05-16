import { Footer } from '../../primitives/Footer';

// The "What is this?" page (route: /about) — the project blurb and footer
// that used to be the home page, now that the map is the home page.
export default function AboutPage() {
  return (
    <div className="flex flex-col gap-xl px-md py-lg">
      <div className="flex flex-col gap-md">
        <h1 className="font-display text-2xl">Agentic Simulacra</h1>
        <p className="text-md leading-relaxed">
          Watch the selected synthetic artists find inspiration and create viral songs in the SlopBop residency program.
        </p>
      </div>

      <Footer />
    </div>
  );
}
