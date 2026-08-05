import type { Metadata } from 'next';

import App from '../App';

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
};

export default function Page() {
  return <App />;
}
