import { useQuery } from '@tanstack/react-query';
import { getContactContent, contactKeys } from '@/lib/services/contact';

export function useContactContent() {
  return useQuery({
    queryKey: contactKeys.content(),
    queryFn: getContactContent,
  });
}
