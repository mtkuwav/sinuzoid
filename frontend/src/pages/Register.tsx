import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input, PasswordInput, Alert, Card, Logo, ThemeToggle } from '../components/ui';

interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Register = () => {
  const [formData, setFormData] = useState<RegisterForm>({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const { register } = useAuth();
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

  const validateForm = (): boolean => {
    if (!formData.username.trim()) {
      setError('Le nom d\'utilisateur est requis');
      return false;
    }
    if (!formData.email.trim()) {
      setError('L\'adresse email est requise');
      return false;
    }
    if (!formData.password) {
      setError('Le mot de passe est requis');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return false;
    }
    // Vérification des exigences de sécurité du backend
    if (!/[A-Z]/.test(formData.password)) {
      setError('Le mot de passe doit contenir au moins une lettre majuscule');
      return false;
    }
    if (!/[a-z]/.test(formData.password)) {
      setError('Le mot de passe doit contenir au moins une lettre minuscule');
      return false;
    }
    if (!/[0-9]/.test(formData.password)) {
      setError('Le mot de passe doit contenir au moins un chiffre');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      await register(formData.username, formData.email, formData.password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Theme Toggle */}
          <div className="flex justify-end mb-8">
            <ThemeToggle size="sm" />
          </div>
          
          <Card padding="lg" shadow="lg" className="text-center">
            <div className="mx-auto h-12 w-12 text-green-600 dark:text-green-400 mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Inscription réussie !
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Votre compte a été créé avec succès. Vous allez être redirigé vers la page de connexion...
            </p>
          </Card>
        </div>
      </div>
    );
  }

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
            Créer un compte Sinuzoid
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Ou{' '}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              connectez-vous à votre compte existant
            </Link>
          </p>
        </div>

        {/* Register Form */}
        <Card padding="lg" shadow="lg">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              name="username"
              type="text"
              label="Nom d'utilisateur"
              placeholder="Votre nom d'utilisateur"
              value={formData.username}
              onChange={handleInputChange}
              disabled={isLoading}
              required
            />

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
              placeholder="Au moins 8 caractères avec majuscule, minuscule et chiffre"
              value={formData.password}
              onChange={handleInputChange}
              disabled={isLoading}
              autoComplete="new-password"
              helperText="Au moins 8 caractères avec majuscule, minuscule et chiffre"
              required
            />

            <PasswordInput
              name="confirmPassword"
              label="Confirmer le mot de passe"
              placeholder="Confirmez votre mot de passe"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              disabled={isLoading}
              autoComplete="new-password"
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
              {isLoading ? 'Création du compte...' : 'Créer mon compte'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Register;
