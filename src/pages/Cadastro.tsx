import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';
import api from '../lib/api';
import { type ApiError } from '../types/api';

interface RegisterResponse {
  token: string;
}

export default function Cadastro() {
  const navigate = useNavigate();
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (senha !== confirmarSenha) {
      setError('As senhas não coincidem');
      return;
    }

    if (senha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post<RegisterResponse>('/auth/register', {
        nomeCompleto,
        email,
        senha
      });
      
      if (data.token) {
        localStorage.setItem('token', data.token);
        void navigate('/dashboard');
      }
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError.response?.data?.error;
      setError(typeof errorMessage === 'string' ? errorMessage : 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex',
      position: 'relative',
      overflow: 'hidden',
      background: '#0a0e1a'
    }}>
      {/* Background com estrelas e montanhas */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `
          radial-gradient(ellipse at 20% 30%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 70%, rgba(168, 85, 247, 0.1) 0%, transparent 50%),
          linear-gradient(135deg, #0a0e1a 0%, #1a1f2e 25%, #0f1419 50%, #1a1f2e 75%, #0a0e1a 100%)
        `,
        backgroundAttachment: 'fixed'
      }}>
        {/* Estrelas */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            radial-gradient(2px 2px at 20% 30%, white, transparent),
            radial-gradient(2px 2px at 60% 70%, white, transparent),
            radial-gradient(1px 1px at 50% 50%, white, transparent),
            radial-gradient(1px 1px at 80% 10%, white, transparent),
            radial-gradient(2px 2px at 90% 40%, white, transparent),
            radial-gradient(1px 1px at 33% 60%, white, transparent),
            radial-gradient(1px 1px at 10% 80%, white, transparent),
            radial-gradient(2px 2px at 40% 20%, white, transparent),
            radial-gradient(1px 1px at 70% 50%, white, transparent),
            radial-gradient(1px 1px at 15% 40%, white, transparent)
          `,
          backgroundRepeat: 'repeat',
          backgroundSize: '200% 200%',
          opacity: 0.6,
          animation: 'twinkle 8s ease-in-out infinite alternate'
        }} />
        {/* Montanhas */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '40%',
          background: `
            linear-gradient(to top, 
              #1a1f2e 0%, 
              #0f1419 30%, 
              #0a0e1a 60%,
              transparent 100%
            )
          `,
          clipPath: 'polygon(0% 100%, 0% 60%, 20% 50%, 40% 55%, 60% 45%, 80% 50%, 100% 55%, 100% 100%)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '35%',
          background: `
            linear-gradient(to top, 
              #0f1419 0%, 
              #0a0e1a 40%,
              transparent 100%
            )
          `,
          clipPath: 'polygon(0% 100%, 0% 70%, 15% 65%, 35% 70%, 55% 60%, 75% 65%, 100% 70%, 100% 100%)',
          opacity: 0.8
        }} />
      </div>

      {/* Conteúdo do Cadastro */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '520px',
        padding: '32px 32px 40px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        margin: '0 auto'
      }}>
      {/* Logo e Título */}
      <div style={{ marginBottom: '28px', textAlign: 'center' }}>
        <h1 style={{ 
          margin: '0 0 10px', 
          fontSize: '2.2rem', 
          fontWeight: 700,
          color: 'var(--color-text-white-dark)',
          fontFamily: 'Inter, system-ui, sans-serif',
          letterSpacing: '-0.02em'
        }}>
          Real Comando
          <span style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'conic-gradient(from 180deg, #22d3ee, #6366f1, #ec4899, #22d3ee)',
            marginLeft: '8px',
            boxShadow: '0 0 16px rgba(129, 140, 248, 0.8)'
          }} />
        </h1>
        <p style={{ 
          margin: 0, 
          color: 'rgba(248, 250, 252, 0.7)',
          fontSize: '1rem'
        }}>
          Crie sua conta para acessar o dashboard
        </p>
      </div>

      {/* Card do Formulário */}
      <div style={{
        width: '100%',
        maxWidth: '520px',
        padding: '24px 22px 26px',
        position: 'relative',
        marginTop: '-4px',
        marginBottom: '-4px'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at top, rgba(56,189,248,0.1), transparent 55%), rgba(15,23,42,0.9)',
          backdropFilter: 'blur(26px) saturate(200%)',
          WebkitBackdropFilter: 'blur(26px) saturate(200%)',
          borderRadius: '26px',
          border: '1px solid rgba(148, 163, 184, 0.45)',
          boxShadow: '0 24px 80px rgba(15, 23, 42, 0.95), 0 0 0 1px rgba(15,23,42,0.8)',
          zIndex: -1
        }} />
        <h2 style={{ 
          margin: '0 0 8px', 
          fontSize: '1.75rem', 
          fontWeight: 700,
          color: 'var(--color-text-white-dark)',
          textAlign: 'center'
        }}>
          Criar Conta
        </h2>
        <p style={{ 
          margin: '0 0 24px', 
          color: 'var(--color-text-muted-light)',
          fontSize: '0.9rem',
          textAlign: 'center'
        }}>
          Preencha os dados para criar sua conta
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ 
              fontSize: '0.9rem', 
              fontWeight: 600,
              color: 'var(--color-text-white-dark)'
            }}>
              Apelido
            </label>
            <div style={{ position: 'relative' }}>
              <User 
                size={20} 
                style={{ 
                  position: 'absolute', 
                  left: '14px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-disabled)',
                  pointerEvents: 'none'
                }} 
              />
              <input
                type="text"
                value={nomeCompleto}
                onChange={(e) => setNomeCompleto(e.target.value)}
                placeholder="Seu apelido"
                required
                autoComplete="name"
                style={{
                  width: '100%',
                  padding: '13px 13px 13px 46px',
                  border: '1px solid rgba(148, 163, 184, 0.5)',
                  borderRadius: '12px',
                  fontSize: '0.95rem',
                  background: 'rgba(15, 23, 42, 0.92)',
                  color: '#e5e7eb',
                  outline: 'none',
                  transition: 'all 0.25s ease',
                  boxShadow: '0 0 0 0 rgba(129, 140, 248, 0)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#8b5cf6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(129, 140, 248, 0.35)';
                  e.target.style.background = '#020617';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(148, 163, 184, 0.5)';
                  e.target.style.boxShadow = '0 0 0 0 rgba(129, 140, 248, 0)';
                  e.target.style.background = 'rgba(15, 23, 42, 0.92)';
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ 
              fontSize: '0.9rem', 
              fontWeight: 600,
              color: 'var(--color-text-white-dark)'
            }}>
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail 
                size={20} 
                style={{ 
                  position: 'absolute', 
                  left: '14px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-disabled)',
                  pointerEvents: 'none'
                }} 
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                autoComplete="email"
                style={{
                  width: '100%',
                  padding: '13px 13px 13px 44px',
                  border: '1px solid rgba(148, 163, 184, 0.5)',
                  borderRadius: '12px',
                  fontSize: '0.95rem',
                  background: 'rgba(15, 23, 42, 0.92)',
                  color: '#e5e7eb',
                  outline: 'none',
                  transition: 'all 0.25s ease',
                  boxShadow: '0 0 0 0 rgba(129, 140, 248, 0)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#8b5cf6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(129, 140, 248, 0.35)';
                  e.target.style.background = '#020617';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(148, 163, 184, 0.5)';
                  e.target.style.boxShadow = '0 0 0 0 rgba(129, 140, 248, 0)';
                  e.target.style.background = 'rgba(15, 23, 42, 0.92)';
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ 
              fontSize: '0.9rem', 
              fontWeight: 600,
              color: 'var(--color-text-white-dark)'
            }}>
              Senha
            </label>
            <div style={{ position: 'relative' }}>
              <Lock 
                size={20} 
                style={{ 
                  position: 'absolute', 
                  left: '14px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-disabled)',
                  pointerEvents: 'none'
                }} 
              />
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                style={{
                  width: '100%',
                  padding: '13px 13px 13px 44px',
                  border: '1px solid rgba(148, 163, 184, 0.5)',
                  borderRadius: '12px',
                  fontSize: '0.95rem',
                  background: 'rgba(15, 23, 42, 0.92)',
                  color: '#e5e7eb',
                  outline: 'none',
                  transition: 'all 0.25s ease',
                  boxShadow: '0 0 0 0 rgba(129, 140, 248, 0)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#8b5cf6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(129, 140, 248, 0.35)';
                  e.target.style.background = '#020617';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(148, 163, 184, 0.5)';
                  e.target.style.boxShadow = '0 0 0 0 rgba(129, 140, 248, 0)';
                  e.target.style.background = 'rgba(15, 23, 42, 0.92)';
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ 
              fontSize: '0.9rem', 
              fontWeight: 600,
              color: 'var(--color-text-white-dark)'
            }}>
              Confirmar Senha
            </label>
            <div style={{ position: 'relative' }}>
              <Lock 
                size={20} 
                style={{ 
                  position: 'absolute', 
                  left: '14px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-disabled)',
                  pointerEvents: 'none'
                }} 
              />
              <input
                type="password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                style={{
                  width: '100%',
                  padding: '13px 13px 13px 44px',
                  border: '1px solid rgba(148, 163, 184, 0.5)',
                  borderRadius: '12px',
                  fontSize: '0.95rem',
                  background: 'rgba(15, 23, 42, 0.92)',
                  color: '#e5e7eb',
                  outline: 'none',
                  transition: 'all 0.25s ease',
                  boxShadow: '0 0 0 0 rgba(129, 140, 248, 0)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#8b5cf6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(129, 140, 248, 0.35)';
                  e.target.style.background = '#020617';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(148, 163, 184, 0.5)';
                  e.target.style.boxShadow = '0 0 0 0 rgba(129, 140, 248, 0)';
                  e.target.style.background = 'rgba(15, 23, 42, 0.92)';
                }}
              />
            </div>
          </div>

          {error && (
            <div style={{
              padding: '12px 16px',
              background: 'rgba(248, 113, 113, 0.14)',
              border: '1px solid rgba(248, 113, 113, 0.6)',
              borderRadius: '12px',
              color: '#fecaca',
              fontSize: '0.9rem'
            }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading} 
            style={{ 
              width: '100%', 
              padding: '15px',
              background: loading 
                ? 'rgba(15, 23, 42, 0.8)' 
                : 'linear-gradient(135deg, #22d3ee 0%, #6366f1 40%, #ec4899 80%)',
              backgroundSize: '180% 100%',
              color: 'var(--color-text-white-dark)',
              border: 'none',
              borderRadius: '999px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.25s ease',
              marginTop: '8px',
              boxShadow: loading 
                ? 'none' 
                : '0 12px 35px rgba(37, 99, 235, 0.55)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundPosition = '100% 0';
                e.currentTarget.style.transform = 'translateY(-1px) scale(1.01)';
                e.currentTarget.style.boxShadow = '0 18px 40px rgba(37, 99, 235, 0.7)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundPosition = '0% 0';
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 12px 35px rgba(37, 99, 235, 0.55)';
              }
            }}
          >
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </button>
        </form>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: '1px solid rgba(30, 64, 175, 0.7)'
        }}>
          <p style={{ 
            margin: 0, 
            color: 'rgba(226, 232, 240, 0.95)',
            fontSize: '0.9rem'
          }}>
            Já tem uma conta?{' '}
            <Link 
              to="/login" 
              style={{ 
                color: '#60a5fa',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#93c5fd'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#60a5fa'}
            >
              Faça login
            </Link>
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}

