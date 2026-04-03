'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      console.log('signup result', { data, error });

      if (error) {
        setError(error.message);
        return;
      }

      setSuccess(true);
    } catch (err) {
      console.error('signup crashed', err);
      setError('Something went wrong while creating your account.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center px-4">
        <div className="text-center animate-fade-in">
          <div className="text-5xl mb-4">✓</div>
          <h2 className="font-display text-2xl font-bold text-acid mb-3">Check your inbox</h2>
          <p className="text-dim text-sm max-w-xs mx-auto">
            We sent a confirmation link to <strong className="text-text">{email}</strong>.
            Verify your email to access the library.
          </p>
          <Link href="/auth/login" className="inline-block mt-8 text-acid text-sm hover:underline">
            Back to login →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-slide-in">
        <Link href="/" className="flex items-center gap-2 mb-10">
          <div className="flex items-end gap-[3px] h-5">
            {[40, 70, 100, 60, 85].map((h, i) => (
              <div key={i} className="eq-bar" style={{ height: `${h}%`, animationDelay: `${i * 0.12}s` }} />
            ))}
          </div>
          <span className="font-display text-lg font-bold text-bright">
            DJ<span className="text-acid">POOL</span>
          </span>
        </Link>

        <h1 className="font-display text-2xl font-bold text-bright mb-1">Create account</h1>
        <p className="text-dim text-sm mb-8">Get access to the full track library.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'Email', type: 'email', value: email, onChange: setEmail, placeholder: 'you@domain.com' },
            { label: 'Password', type: 'password', value: password, onChange: setPassword, placeholder: 'Min. 8 characters' },
            { label: 'Confirm Password', type: 'password', value: confirm, onChange: setConfirm, placeholder: '••••••••' },
          ].map(({ label, type, value, onChange, placeholder }) => (
            <div key={label}>
              <label className="block text-xs font-mono text-dim uppercase tracking-widest mb-2">
                {label}
              </label>
              <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required
                className="w-full bg-panel border border-border rounded-sm px-4 py-3 text-text text-sm focus:border-acid focus:outline-none transition-colors placeholder:text-muted"
                placeholder={placeholder}
              />
            </div>
          ))}

          {error && (
            <div className="bg-warn/10 border border-warn/30 text-warn text-xs px-4 py-3 rounded-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-acid text-void font-display font-bold text-sm tracking-wider py-3.5 rounded-sm hover:bg-acid/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <p className="text-center text-dim text-sm mt-6">
          Already a member?{' '}
          <Link href="/auth/login" className="text-acid hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}