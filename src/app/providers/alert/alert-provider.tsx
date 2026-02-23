import { AlertDialog } from '@jigoooo/shared-ui';
import { Toaster } from 'sonner';

import { AlertTriangle, CircleCheck, CircleX } from 'lucide-react';

import { useColors } from '@/shared/theme';

export function AlertProvider() {
  const colors = useColors();

  return (
    <>
      <AlertDialog />
      <Toaster
        toastOptions={{
          style: {
            background: '#ffffff',
            color: '#000000',
            border: '1px solid #cccccc',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            fontSize: '1.4rem',
          },
          duration: 1800,
        }}
        icons={{
          success: <CircleCheck size={16} style={{ color: colors.feedback.success }} />,
          warning: <AlertTriangle size={16} style={{ color: colors.feedback.warning }} />,
          error: <CircleX size={16} style={{ color: colors.feedback.error }} />,
        }}
        expand={true}
      />
    </>
  );
}
