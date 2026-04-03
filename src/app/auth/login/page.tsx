'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

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

        <h1 className="font-display text-2xl font-bold text-bright mb-1">Welcome back</h1>
        <p className="text-dim text-sm mb-8">Sign in to access your track library.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-dim uppercase tracking-widest mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-panel border border-border rounded-sm px-4 py-3 text-text text-sm focus:border-acid focus:outline-none transition-colors placeholder:text-muted"
              placeholder="you@domain.com"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-dim uppercase tracking-widest mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-panel border border-border rounded-sm px-4 py-3 text-text text-sm focus:border-acid focus:outline-none transition-colors placeholder:text-muted"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-warn/10 border border-warn/30 text-warn text-xs px-4 py-3 rounded-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-acid text-void font-display font-bold text-sm tracking-wider py-3.5 rounded-sm hover:bg-acid/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'SIGNING IN...' : 'SIGN IN'}
          </button>
        </form>

        <p className="text-center text-dim text-sm mt-6">
          No account?{' '}
          <Link href="/auth/signup" className="text-acid hover:underline">
            Join DJ Pool
          </Link>
        </p>
      </div>
    </div>
  );
}
