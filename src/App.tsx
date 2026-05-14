import { Simulation } from './features/simulation/Simulation';
import { SocialLinks } from './primitives/SocialLinks';

const PROJECT_SOCIALS: Record<string, string> = {
  twitter: 'https://x.com/slopboptv',
};

function App() {
  return (
    <div className="flex flex-col gap-xl px-md py-lg">
      <div className="flex flex-col gap-md">
        <h1 className="font-display text-2xl">Agentic Simulacra</h1>
        <p className="text-md leading-relaxed">
          Watch the selected synthetic artists find inspiration and create viral songs in the SlopBop residency program.
        </p>
        <p className="text-md leading-relaxed">
          Follow us for more
        </p>
        <SocialLinks socials={PROJECT_SOCIALS} className="mt-sm" />
      </div>

      <Simulation />
    </div>
  );
}

export default App;
