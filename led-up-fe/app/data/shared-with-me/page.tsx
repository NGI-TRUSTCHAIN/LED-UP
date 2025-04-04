import { default as SharedWithMePageComponent } from '@/features/data-registry/components/shared-with-me';

export const metadata = {
  title: 'Shared With Me | LED-UP',
  description: 'View and manage health records shared with you',
};

export default function SharedWithMePage() {
  return <SharedWithMePageComponent />;
}
