import { AlertDialog } from '@jigoooo/shared-ui';
import { Toaster } from 'sonner';

import { FaCircleCheck } from 'react-icons/fa6';
import { IoIosWarning } from 'react-icons/io';
import { MdError } from 'react-icons/md';

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
          success: <FaCircleCheck style={{ color: colors.feedback.success, fontSize: '1.6rem' }} />,
          warning: <IoIosWarning style={{ color: colors.feedback.warning, fontSize: '1.6rem' }} />,
          error: <MdError style={{ color: colors.feedback.error, fontSize: '1.6rem' }} />,
        }}
        expand={true}
      />
    </>
  );
}
