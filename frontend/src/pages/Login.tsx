import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input, PasswordInput, Alert, Card, Logo, ThemeToggle } from '../components/ui';

interface LoginForm {
  email: string;
  password: string;
}

const Login = () => {
  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login(formData.email, formData.password);
      navigate('/'); // Redirect to home after successful login
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Theme Toggle */}
        <div className="flex justify-end">
          <ThemeToggle size="sm" />
        </div>
        
        {/* Header with Logo */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Logo size="lg" linkTo="" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Connexion à Sinuzoid
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Ou{' '}
            <Link
              to="/register"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              créez un nouveau compte
            </Link>
          </p>
        </div>

        {/* Login Form */}
        <Card padding="lg" shadow="lg">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              name="email"
              type="email"
              label="Adresse email"
              placeholder="votre@email.com"
              value={formData.email}
              onChange={handleInputChange}
              disabled={isLoading}
              autoComplete="email"
              required
            />

            <PasswordInput
              name="password"
              label="Mot de passe"
              placeholder="Votre mot de passe"
              value={formData.password}
              onChange={handleInputChange}
              disabled={isLoading}
              autoComplete="current-password"
              required
            />

            {error && (
              <Alert type="error">
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
