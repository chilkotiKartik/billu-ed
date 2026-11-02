import { SignIn } from '@clerk/nextjs';
import { AuthShell } from '@/components/AuthShell';
import { clerkLook } from '@/lib/clerkLook';

export default function Page() {
  return <AuthShell mode="in"><SignIn appearance={clerkLook} forceRedirectUrl="/app" signUpUrl="/sign-up" /></AuthShell>;
}
