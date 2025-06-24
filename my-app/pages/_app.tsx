import { appWithTranslation } from 'next-i18next';
import type { AppProps } from 'next/app';
import '../src/app/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default appWithTranslation(MyApp);
