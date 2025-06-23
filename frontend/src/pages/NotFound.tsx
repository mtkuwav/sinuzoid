import React from 'react';
import { Link, useNavigate } from 'react-router';
import { FiHome, FiClock, FiMusic, FiArrowLeft } from 'react-icons/fi';
import { Button, Logo } from '../components/ui';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  const suggestions = [
    {
      icon: <FiHome className="w-5 h-5" />,
      title: 'Retour à l\'accueil',
      description: 'Découvrez votre tableau de bord musical',
      path: '/',
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      icon: <FiClock className="w-5 h-5" />,
      title: 'Voir les morceaux récemment ajoutés',
      description: 'Débarassez vous des contraintes de stockage',
      path: '/recently-added',
      color: 'text-green-600 dark:text-green-400'
    },
    {
      icon: <FiMusic className="w-5 h-5" />,
      title: 'Votre bibliothèque',
      description: 'Accédez à votre collection musicale',
      path: '/library',
      color: 'text-purple-600 dark:text-purple-400'
    }
  ];

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          {/* Logo et animation */}
          <div className="mb-8">
            <div className="relative inline-block">
              <Logo size="lg" variant="icon" className="animate-pulse" />
              <div className="absolute -inset-4 bg-blue-500/20 rounded-full blur-xl animate-ping"></div>
            </div>
          </div>

          {/* Message d'erreur principal */}
          <div className="mb-8">
            <h1 className="text-8xl font-bold font-display text-gray-800 dark:text-white mb-4 tracking-tight">
              404
            </h1>
            <h2 className="text-3xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
              Page introuvable
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
              Oops ! Il semble que cette page n'existe plus ou a été déplacée. 
              Mais ne vous inquiétez pas, votre musique vous attend ailleurs !
            </p>
          </div>

          {/* Bouton retour */}
          <div className="mb-12">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate(-1)}
              className="mr-4 mb-4 md:mb-0"
            >
              <FiArrowLeft className="w-5 h-5 mr-2" />
              Retour
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/')}
            >
              <FiHome className="w-5 h-5 mr-2" />
              Accueil
            </Button>
          </div>

          {/* Suggestions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {suggestions.map((suggestion, index) => (
              <Link
                key={index}
                to={suggestion.path}
                className="group bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-xl border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:scale-105"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 mb-4 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors duration-200`}>
                  <span className={suggestion.color}>
                    {suggestion.icon}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {suggestion.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {suggestion.description}
                </p>
              </Link>
            ))}
          </div>

          {/* Citation musicale */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <blockquote className="text-gray-500 dark:text-gray-400 italic">
              "La musique commence là où s'arrête le pouvoir des mots." 
              <footer className="mt-2 text-sm font-medium">— Heinrich Heine</footer>
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
