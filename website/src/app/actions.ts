'use server';

import { createClient } from '@supabase/supabase-js';

export type WaitlistState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UNIQUE_VIOLATION = '23505';
const SUCCESS: WaitlistState = {
  status: 'success',
  message: 'You’re on the list. We’ll email you when the app lands.',
};

export async function joinWaitlist(_prev: WaitlistState, formData: FormData): Promise<WaitlistState> {
  // Hidden field: people never see it, bots fill it in. Pretend it worked.
  if (formData.get('company')) return SUCCESS;

  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return { status: 'error', message: 'Enter a valid email address.' };
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.error('Waitlist: SUPABASE_URL and SUPABASE_ANON_KEY must be set.');
    return { status: 'error', message: 'The waitlist isn’t open yet. Please try again soon.' };
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { error } = await supabase.from('app_waitlist').insert({ email, source: 'website' });

  // An address that is already on the list gets the same answer as a new one,
  // so the form can't be used to check who has signed up.
  if (error && error.code !== UNIQUE_VIOLATION) {
    console.error('Waitlist insert failed:', error.message);
    return { status: 'error', message: 'Something went wrong. Please try again.' };
  }

  return SUCCESS;
}
