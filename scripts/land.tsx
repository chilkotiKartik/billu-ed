import { createRoot } from 'react-dom/client';
import Landing from '../src/components/Landing';
createRoot(document.getElementById('r')!).render(<Landing signedIn={false} />);
