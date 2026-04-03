import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-void flex flex-col items-center justify-center relative overflow-hidden">
      {/* Grid texture */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(#C8FF00 1px, transparent 1px), linear-gradient(90deg, #C8FF00 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-acid/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 text-center max-w-2xl px-6 animate-fade-in">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex items-end gap-[3px] h-7">
            {[40, 70, 100, 60, 85].map((h, i) => (
              <div
                key={i}
                className="eq-bar"
                style={{ height: `${h}%`, animationDelay: `${i * 0.12}s` }}
              />
            ))}
          </div>
          <span className="font-display text-2xl font-bold text-bright tracking-tight">
            DJ<span className="text-acid">POOL</span>
          </span>
        </div>

        <h1 className="font-display text-5xl md:text-7xl font-bold text-bright leading-[0.95] tracking-tight mb-6">
          YOUR MUSIC.<br />
          <span className="text-acid">YOUR EDGE.</span>
        </h1>

        <p className="text-dim text-lg mb-10 font-body font-light leading-relaxed max-w-md mx-auto">
          Exclusive WAV / 320k MP3 record pool for professional DJs.
          New drops every week. Stream previews, download full tracks.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link
            href="/auth/signup"
            className="px-8 py-3.5 bg-acid text-void font-display font-bold text-sm tracking-wider rounded-sm hover:bg-acid/90 transition-colors"
          >
            JOIN NOW
          </Link>
          <Link
            href="/auth/login"
            className="px-8 py-3.5 border border-border text-text font-display font-bold text-sm tracking-wider rounded-sm hover:border-acid hover:text-acid transition-colors"
          >
            LOG IN
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-3 gap-6 text-center">
          {[
            { label: 'New Tracks / Week', value: '50+' },
            { label: 'Genres', value: '15+' },
            { label: 'WAV Quality', value: '24-bit' },
          ].map(({ label, value }) => (
            <div key={label} className="border border-border rounded-sm p-4">
              <p className="font-display text-2xl font-bold text-acid">{value}</p>
              <p className="text-dim text-xs mt-1 tracking-wide uppercase">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
