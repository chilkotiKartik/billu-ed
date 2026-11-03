import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Public: landing, auth pages, the PWA files and the health check. Everything else needs a signed-in student.
const isPublic = createRouteMatcher(['/', '/sign-in(.*)', '/sign-up(.*)', '/api/health', '/api/videos(.*)', '/privacy', '/terms']);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublic(req)) await auth.protect();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
