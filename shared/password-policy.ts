import { z } from 'zod';

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
export const passwordRules = [
  { id: 'length', label: 'En az 8 karakter', message: 'Şifren en az 8 karakter olmalı.', test: (value: string) => value.length >= PASSWORD_MIN_LENGTH },
  { id: 'digit', label: 'En az 1 rakam', message: 'Şifren en az 1 rakam içermeli.', test: (value: string) => /[0-9]/.test(value) },
  { id: 'symbol', label: 'En az 1 özel karakter (boşluk hariç)', message: 'Şifren en az 1 özel karakter içermeli; boşluk özel karakter sayılmaz.', test: (value: string) => /[\p{P}\p{S}]/u.test(value) },
] as const;

// Only new passwords use this policy. Login keeps accepting existing passwords.
export const newPasswordSchema = z.string()
  .max(PASSWORD_MAX_LENGTH, 'Şifren en fazla 128 karakter olabilir.')
  .superRefine((value, context) => {
    for (const rule of passwordRules) {
      if (!rule.test(value)) context.addIssue({ code: 'custom', message: rule.message });
    }
  });
