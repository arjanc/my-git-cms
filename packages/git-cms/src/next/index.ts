// Default export: pre-wired admin page for app/admin/[[...cms]]/page.tsx
export { default as AdminPage } from './admin-page'

// Route handlers: unified dispatcher for app/admin/api/[[...cms]]/route.ts
export { GET, POST, DELETE } from './dispatcher'
