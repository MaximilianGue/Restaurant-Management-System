
import '../styles/globals.css';
import '../styles/calendar-custom.css'; // Optionale eigene Styles (siehe unten)
import Footer from '../components/Footer';
import { useRouter } from 'next/router';

import type { AppProps } from 'next/app';
import Navbar from '../components/Navbar';

export default function App({ Component, pageProps }: AppProps) {

  const router = useRouter();
  const hideNavbar = router.pathname === '/access'; // oder weitere Seiten wie /login etc.

  return (
    <>
      <div className="min-h-screen flex flex-col justify-between">
        {!hideNavbar && <Navbar />}
        <main className = "flex-grow">
          <Component {...pageProps} />
        </main>
        <Footer />
      </div>
    
    </>
  );
}
