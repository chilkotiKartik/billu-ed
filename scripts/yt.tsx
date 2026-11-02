import { createRoot } from 'react-dom/client';
import { YtCard } from '../src/components/YtCard';
import { ALL } from '../src/lib/catalog';
const q = ALL.find((x) => x.id === 's2-1-q1')!;
createRoot(document.getElementById('r')!).render(<div className="app"><main className="body"><YtCard q={q} /></main></div>);
