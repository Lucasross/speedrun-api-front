import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get('token'); // si tu stockes le token en cookie HTTPOnly

  if (event.url.pathname.startsWith('/dashboard') && !token) {
    return Response.redirect(new URL('/login', event.url));
  }

  return resolve(event);
};