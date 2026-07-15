import { SocialLinks } from './SocialLinks';

interface FooterProps {
  socials?: Record<string, string>;
}

export function Footer({ socials }: FooterProps) {
  return (
    <footer className="flex flex-col gap-md">
      <hr className="border-white/15" />
      {socials && <SocialLinks socials={socials} className="justify-center" />}
      <p className="text-center text-sm text-white/60">SlopBop © 2026</p>
    </footer>
  );
}
