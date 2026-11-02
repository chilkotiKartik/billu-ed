import { SignUp } from '@clerk/nextjs';
import { AuthShell } from '@/components/AuthShell';
import { clerkLook } from '@/lib/clerkLook';

export default function Page() {
  return <AuthShell mode="up"><SignUp appearance={clerkLook} forceRedirectUrl="/app" signInUrl="/sign-in" /></AuthShell>;
}
