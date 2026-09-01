import { useQuery } from '@tanstack/react-query';
import { getAboutContent, aboutKeys } from '@/lib/services/about';

export function useAboutContent() {
  return useQuery({
    queryKey: aboutKeys.content(),
    queryFn: getAboutContent,
  });
}
