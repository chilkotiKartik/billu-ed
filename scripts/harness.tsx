import { createRoot } from 'react-dom/client';
import { Player } from '../src/components/Player';
import { Challenge } from '../src/components/Challenge';
import { Quiz } from '../src/components/Quiz';
import { Sidebar } from '../src/components/Sidebar';
import { ALL } from '../src/lib/catalog';
const u = new URLSearchParams(location.search);
const id = u.get('q') || 's3-q2', m = u.get('m') || 'play';
const q = ALL.find((x) => x.id === id)!;
const sol = q.build();
const noop = () => {};
createRoot(document.getElementById('r')!).render(
  <div className="shell"><Sidebar open={false} onClose={noop} done={['s1']} qid={id} screen="steps" flowAt={2} level={3} onNav={noop} onOpenQ={noop} />
    <div className="app"><main className="body">
      {m === 'play' && <Player sol={sol} question={q.statement} />}
      {m === 'turn' && <Challenge sol={sol} award={noop} />}
      {m === 'quiz' && <Quiz sol={sol} award={noop} />}
    </main></div></div>);
