import { createFileRoute } from '@tanstack/react-router';

import { ApiSettingsModal } from '@/features/api-tester';

export const Route = createFileRoute('/api-docs/settings')({
  component: ApiSettingsModal,
});
