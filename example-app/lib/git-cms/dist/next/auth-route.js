// Re-exports NextAuth route handlers for mounting under /admin/api/auth/[...nextauth]
import { handlers } from '../auth';
export { handlers };
export const { GET, POST } = handlers;
