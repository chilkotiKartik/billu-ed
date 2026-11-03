import { auth } from '@clerk/nextjs/server';
import Landing from '@/components/Landing';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const { userId } = await auth();
  return <Landing signedIn={!!userId} />;
}
