import { auth } from '@clerk/nextjs/server';
import Landing from '@/components/Landing';

export const dynamic = 'force-dynamic';

export default function Page() {
  const { userId } = auth();
  return <Landing signedIn={!!userId} />;
}
