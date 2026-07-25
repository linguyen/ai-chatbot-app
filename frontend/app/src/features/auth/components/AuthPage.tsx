import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

type SigninResponse = {
    access_token: string;
    refresh_token?: string;
    token_type?: string;
    user?: { id: string; email: string };
};

export const AuthPage: React.FC = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!email || !password) {
            setError(t('emailPasswordRequired'));
            return;
        }
        setLoading(true);
        try {
            const resp = await fetch('http://localhost:8888/auth/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            if (!resp.ok) {
                const text = await resp.text();
                throw new Error(text || resp.statusText);
            }
            const data: SigninResponse = await resp.json();
            if (data.access_token) {
                localStorage.setItem('access_token', data.access_token);
            }
            // Optionally redirect to dashboard
            window.location.href = '/dashboard';
        } catch (err: any) {
            setError(err?.message ?? t('signinFailed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-base-200 flex items-center justify-center p-4">
            <section className="w-full max-w-md rounded-box border border-base-300 bg-base-100 p-6 shadow-md">
                <h2 className="text-2xl font-bold mb-4">{t('signIn')}</h2>
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="label">
                            <span className="label-text">{t('email')}</span>
                        </label>
                        <input
                            type="email"
                            className="input input-bordered w-full"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="label">
                            <span className="label-text">{t('password')}</span>
                        </label>
                        <input
                            type="password"
                            className="input input-bordered w-full"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && <div className="text-error text-sm">{error}</div>}

                    <div className="flex items-center justify-between">
                        <button type="submit" className={`btn btn-primary ${loading ? 'loading' : ''}`} disabled={loading}>
                            {loading ? t('signingIn') : t('signIn')}
                        </button>
                        <a href="/auth/register" className="link">{t('createAccount')}</a>
                    </div>
                </form>
            </section>
        </main>
    );
};