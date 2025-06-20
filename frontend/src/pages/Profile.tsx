import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FiUser, FiMail, FiShield, FiEdit3, FiLock } from 'react-icons/fi';
import { Button, PasswordInput, Alert, Card } from '../components/ui';
import { StorageInfo } from '../components/common';

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const Profile = () => {
  const { user, changePassword } = useAuth();
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const validatePasswordForm = (): boolean => {
    if (!passwordForm.currentPassword) {
      setError('Le mot de passe actuel est requis');
      return false;
    }
    if (!passwordForm.newPassword) {
      setError('Le nouveau mot de passe est requis');
      return false;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Les nouveaux mots de passe ne correspondent pas');
      return false;
    }
    if (passwordForm.newPassword.length < 8) {
      setError('Le nouveau mot de passe doit contenir au moins 8 caractères');
      return false;
    }
    if (!/[A-Z]/.test(passwordForm.newPassword)) {
      setError('Le nouveau mot de passe doit contenir au moins une majuscule');
      return false;
    }
    if (!/[a-z]/.test(passwordForm.newPassword)) {
      setError('Le nouveau mot de passe doit contenir au moins une minuscule');
      return false;
    }
    if (!/[0-9]/.test(passwordForm.newPassword)) {
      setError('Le nouveau mot de passe doit contenir au moins un chiffre');
      return false;
    }
    return true;
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!validatePasswordForm()) {
      setIsLoading(false);
      return;
    }

    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setSuccess('Mot de passe modifié avec succès !');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setIsEditingPassword(false);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la modification du mot de passe');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelPasswordEdit = () => {
    setIsEditingPassword(false);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setError(null);
    setSuccess(null);
  };

  const ProfileInfoCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div className="w-5 h-5 text-gray-500 mr-3">
        {icon}
      </div>
      <div className="flex-grow">
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
          {label}
        </label>
        <p className="text-lg text-gray-800 dark:text-white">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-xl p-6 text-white">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <FiUser className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user.username}</h1>
              <p className="text-blue-100">Membre depuis {new Date().getFullYear()}</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Card padding="lg" shadow="lg" className="rounded-t-none">
          {/* Success/Error Messages */}
          {success && (
            <Alert type="success" className="mb-6">
              {success}
            </Alert>
          )}
          {error && (
            <Alert type="error" className="mb-6">
              {error}
            </Alert>
          )}

          {/* Profile Information */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">
              Informations du profil
            </h2>
            
            <div className="space-y-4">
              <ProfileInfoCard 
                icon={<FiUser />}
                label="Nom d'utilisateur"
                value={user.username}
              />
              <ProfileInfoCard 
                icon={<FiMail />}
                label="Adresse email"
                value={user.email}
              />
              <ProfileInfoCard 
                icon={<FiShield />}
                label="Rôle"
                value={user.role}
              />
            </div>
          </div>

          {/* Storage Information */}
          <div className="mb-8">
            <StorageInfo />
          </div>

          {/* Password Section */}
          <div className="border-t border-gray-200 dark:border-gray-600 pt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Sécurité du compte
              </h2>
              {!isEditingPassword && (
                <Button
                  onClick={() => setIsEditingPassword(true)}
                  variant="primary"
                  size="sm"
                >
                  <FiEdit3 className="w-4 h-4 mr-2" />
                  Modifier le mot de passe
                </Button>
              )}
            </div>

            {isEditingPassword ? (
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <PasswordInput
                  name="currentPassword"
                  label="Mot de passe actuel"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  disabled={isLoading}
                  required
                />

                <PasswordInput
                  name="newPassword"
                  label="Nouveau mot de passe"
                  placeholder="Au moins 8 caractères avec majuscule, minuscule et chiffre"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  disabled={isLoading}
                  helperText="Au moins 8 caractères avec majuscule, minuscule et chiffre"
                  required
                />

                <PasswordInput
                  name="confirmPassword"
                  label="Confirmer le nouveau mot de passe"
                  placeholder="Confirmez votre nouveau mot de passe"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  disabled={isLoading}
                  required
                />

                <div className="flex space-x-3">
                  <Button
                    type="submit"
                    isLoading={isLoading}
                    disabled={isLoading}
                    variant="primary"
                    className="flex-1"
                  >
                    {isLoading ? 'Modification...' : 'Modifier le mot de passe'}
                  </Button>
                  <Button
                    type="button"
                    onClick={cancelPasswordEdit}
                    disabled={isLoading}
                    variant="secondary"
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            ) : (
              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <FiLock className="w-5 h-5 text-gray-500 mr-3" />
                <div className="flex-grow">
                  <p className="text-gray-600 dark:text-gray-300">
                    Votre mot de passe est sécurisé et chiffré
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Dernière modification : Non disponible
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
