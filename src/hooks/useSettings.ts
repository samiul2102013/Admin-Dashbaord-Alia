'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import {
  changePassword,
  getSettings,
  updatePrivacy,
  updateProfile,
  updateTerms,
} from '@/lib/services/settings';

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => getSettings(),
    retry: false,
  });
}

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (payload: { username?: string; email?: string; contact_number?: string }) =>
      updateProfile(payload),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: {
      current_password: string;
      new_password: string;
      confirm_password: string;
    }) => changePassword(payload),
  });
}

export function useUpdatePrivacy() {
  return useMutation({
    mutationFn: (content: string) => updatePrivacy(content),
  });
}

export function useUpdateTerms() {
  return useMutation({
    mutationFn: (content: string) => updateTerms(content),
  });
}