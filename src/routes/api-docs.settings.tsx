import { createFileRoute } from '@tanstack/react-router';

import { GlobalAuthModal } from '@/features/api-tester';

export const Route = createFileRoute('/api-docs/settings')({
  component: GlobalAuthModal,
});
