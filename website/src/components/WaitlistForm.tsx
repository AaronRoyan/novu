'use client';

import { useActionState } from 'react';

import { joinWaitlist, type WaitlistState } from '@/app/actions';

import styles from './AppSection.module.css';

const initialState: WaitlistState = { status: 'idle' };

export function WaitlistForm() {
  const [state, formAction, pending] = useActionState(joinWaitlist, initialState);

  if (state.status === 'success') {
    return (
      <p className={styles.success} role="status">
        <span className={styles.check} aria-hidden="true">
          ✓
        </span>
        {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} className={styles.form}>
      <label htmlFor="waitlist-email" className="sr-only">
        Email address
      </label>
      <div className={styles.field}>
        <input
          id="waitlist-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className={styles.input}
          aria-describedby="waitlist-note"
          aria-invalid={state.status === 'error' || undefined}
          aria-errormessage={state.status === 'error' ? 'waitlist-note' : undefined}
        />
        <button type="submit" className="btn btn--accent" disabled={pending}>
          {pending ? 'Joining…' : 'Join the waitlist'}
        </button>
      </div>
      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="waitlist-company">Company</label>
        <input id="waitlist-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <p id="waitlist-note" className={styles.note} aria-live="polite" data-error={state.status === 'error' || undefined}>
        {state.status === 'error' ? state.message : 'Be first to know when it lands on iOS and Android.'}
      </p>
    </form>
  );
}
