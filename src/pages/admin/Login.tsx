
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    console.log('🔐 Login: Tentando login com:', email);

    try {
      console.log('🔐 Login: Chamando função signIn...');
      await signIn(email, password);
      console.log('🔐 Login: Login bem-sucedido!');
      navigate('/admin');
    } catch (err: any) {
      console.error('🔐 Login: Erro no login:', err);
      
      // Handle specific error messages
      if (err.message === 'Invalid login credentials') {
        setError('Credenciais inválidas. Verifique seu email e senha.');
      } else if (err.message === 'Usuário não possui permissão de acesso.') {
        setError('Este usuário não possui permissão para acessar a área administrativa.');
      } else {
        setError(err.message || 'Ocorreu um erro ao realizar o login.');
      }
    } finally {
      console.log('🔐 Login: Processo de login finalizado');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary">Flor & Cia</h1>
          <p className="text-gray-500 mt-2">Área Administrativa</p>
        </div>

        {error && (
          <Alert variant="destructive" className="animate-fade-in">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoComplete="email"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Senha
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete="current-password"
              className="w-full"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Entrando...</span>
              </>
            ) : (
              'Entrar'
            )}
          </Button>
        </form>
        
        <div className="text-center text-sm text-gray-500">
          <p>Somente usuários administrativos têm acesso a esta área.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
