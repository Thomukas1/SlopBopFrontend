import { Buffer } from 'buffer';
window.Buffer = Buffer;

import { StrictMode, ReactNode, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';

import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';

import {
  registerMwa,
  createDefaultAuthorizationCache,
  createDefaultChainSelector,
  createDefaultWalletNotFoundHandler,
} from '@solana-mobile/wallet-standard-mobile';

// Desktop wallet adapters (optional enhancers)
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';

import ArtistProfile from './features/artist_profile/ArtistProfile';
import { NavBar } from './components/NavBar';
import AlbumPage from './features/album/AlbumPage';
import MapPage from './features/map/MapPage';
import AboutPage from './features/about/AboutPage';
import RosterPage from './features/roster/RosterPage';
import BootcampPage from './features/bootcamp/BootcampPage';
import ApplicationForm from './features/apply/ApplicationForm';
import { SOLANA_CHAIN, HELIUS_RPC_URL } from './config/network';
import { ToastProvider } from './context/ToastContext';
import { MusicPlayerProvider } from './context/MusicPlayerContext';
import MusicPlayer from './features/music_player/MusicPlayer';
import MiniPlayer from './features/music_player/MiniPlayer';

import './styles/index.css';
import '@solana/wallet-adapter-react-ui/styles.css';

/**
 * ---------------------------------------------------------
 * MWA + Wallet Standard registration
 * ---------------------------------------------------------
 * This MUST run once, before React renders.
 */
registerMwa({
  appIdentity: {
    name: 'Slop Bop',
    uri: window.location.origin,
    icon: '/Branding/logo-full.png', // must exist in /public
  },
  authorizationCache: createDefaultAuthorizationCache(),
  chains: [SOLANA_CHAIN],
  chainSelector: createDefaultChainSelector(),
  onWalletNotFound: createDefaultWalletNotFoundHandler(),
});

interface WalletContextProviderProps {
  children: ReactNode;
}

function WalletContextProvider({ children }: WalletContextProviderProps) {
  const endpoint = HELIUS_RPC_URL;

  /**
   * Desktop adapters only.
   * Wallet Standard + MWA wallets are injected automatically.
   */
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={true}>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

/**
 * ---------------------------------------------------------
 * App bootstrap
 * ---------------------------------------------------------
 */

/**
 * Reset scroll to the top on every route change. The scroll container is the
 * <html> element (see index.css), so React Router leaves it wherever the last
 * page was — without this, navigating lands you mid-page.
 */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    document.documentElement.scrollTo({ top: 0, left: 0 });
  }, [pathname]);
  return null;
}

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root container missing in index.html');
}

createRoot(container).render(
  <StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <WalletContextProvider>
        <ToastProvider>
          <MusicPlayerProvider>
            <Routes>
              <Route path="/" element={<AboutPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/roster" element={<RosterPage />} />
              <Route path="/bootcamp" element={<BootcampPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/apply" element={<ApplicationForm />} />
              <Route path="/artists/:id" element={<ArtistProfile />} />
              <Route path="/albums/:id" element={<AlbumPage />} />
            </Routes>
            <NavBar />
            <MiniPlayer />
            <MusicPlayer />
          </MusicPlayerProvider>
        </ToastProvider>
      </WalletContextProvider>
    </BrowserRouter>
  </StrictMode>
);
