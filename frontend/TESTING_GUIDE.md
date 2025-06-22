# 🧪 Guide de test des améliorations de performance

## Avant de commencer

1. **Démarrer l'application complète** :
   ```bash
   cd /home/matioku/Documents/Cours/Sinuzoid/sinuzoid
   docker compose up -d
   ```

2. **S'assurer que le frontend est accessible** : http://localhost:3000

## Tests de performance

### 🚀 Test 1 : Navigation sans rechargement

**Objectif** : Vérifier que la navigation entre pages ne recharge plus les données

**Étapes** :
1. Se connecter à l'application
2. Aller sur "Bibliothèque" 
3. Attendre le chargement complet (noter le temps)
4. Cliquer sur un album pour voir sa page
5. Revenir à "Bibliothèque" avec le bouton retour
6. **Résultat attendu** : Retour instantané (< 100ms)

### 📊 Test 2 : Indicateur de performance

**Objectif** : Visualiser les métriques de performance

**Étapes** :
1. Aller sur "Bibliothèque"
2. Observer l'indicateur de performance (coin supérieur droit)
3. **Résultat attendu** :
   - Badge vert si < 100ms (Excellent)
   - Badge jaune si < 500ms (Bon)
   - Affichage du nombre de morceaux/albums

### 🔧 Test 3 : Debug store (développement)

**Objectif** : Vérifier l'état du store

**Étapes** :
1. Aller sur "Bibliothèque"
2. Observer le debugger (coin inférieur droit)
3. **Vérifications** :
   - Tracks > 0
   - Albums > 0
   - Loading: ✗
   - Error: ✓
   - Thumbnails > 0 (après quelques secondes)

### 🖼️ Test 4 : Cache d'images

**Objectif** : Vérifier le préchargement intelligent

**Étapes** :
1. Aller sur "Bibliothèque"
2. Attendre 5 secondes pour le préchargement
3. Défiler dans la liste des albums
4. **Résultat attendu** : Images apparaissent instantanément

### 🔄 Test 5 : Synchronisation automatique

**Objectif** : Tester la sync en arrière-plan

**Étapes** :
1. Rester sur "Bibliothèque" pendant 5+ minutes
2. Observer les logs du navigateur (F12 > Console)
3. **Résultat attendu** : Message "🔄 Synchronisation en arrière-plan..."

### 🌐 Test 6 : Sync réseau

**Objectif** : Tester la synchronisation après reconnexion

**Étapes** :
1. Désactiver la connexion réseau (mode avion ou débrancher)
2. Attendre 10 secondes
3. Réactiver la connexion
4. Observer les logs
5. **Résultat attendu** : Message "🌐 Connexion réseau rétablie, synchronisation..."

### 👁️ Test 7 : Sync au focus

**Objectif** : Tester la sync au retour sur l'onglet

**Étapes** :
1. Aller sur "Bibliothèque"
2. Changer d'onglet pendant 30 secondes
3. Revenir sur l'onglet Sinuzoid
4. **Résultat attendu** : Synchronisation automatique après 500ms

## Comparaison performance

### Mesures à prendre

| Action | Avant (ancien système) | Après (Zustand) | Amélioration |
|--------|------------------------|------------------|-------------|
| Premier chargement Library | ⏱️ ___ secondes | ⏱️ ___ secondes | ___ % |
| Navigation Library → Album | ⏱️ ___ secondes | ⏱️ ___ millisecondes | ___ % |
| Retour Album → Library | ⏱️ ___ secondes | ⏱️ ___ millisecondes | ___ % |
| Affichage images album | ⏱️ ___ secondes | ⏱️ ___ millisecondes | ___ % |

### Comment mesurer
1. Ouvrir DevTools (F12)
2. Onglet "Network" 
3. Noter les temps de chargement
4. Observer la différence avec/sans cache

## Tests de régression

### ✅ Fonctionnalités à vérifier

- [ ] Connexion/déconnexion fonctionne
- [ ] Upload de fichiers fonctionne
- [ ] Lecture de morceaux fonctionne
- [ ] Recherche dans la bibliothèque fonctionne
- [ ] Tri par nom/date/album fonctionne
- [ ] Navigation Album → Track fonctionne
- [ ] Affichage des métadonnées correct
- [ ] Responsive design intact

## Problèmes connus

### Cache persistant
- Le cache peut persister entre les sessions
- **Solution** : Utiliser le bouton "Clear Cache" du debugger

### Images non mises à jour
- Si les images ne se mettent pas à jour après upload
- **Solution** : Rafraîchir ou vider le cache

### Sync trop fréquente
- En cas de problème de performance
- **Solution** : Ajuster `CACHE_DURATION` dans `musicStore.ts`

## Optimisations supplémentaires

### Pour tester les limites
1. **Gros dataset** : Tester avec 1000+ morceaux
2. **Connexion lente** : Simuler 3G dans DevTools
3. **Mémoire limitée** : Réduire la RAM dans DevTools
4. **Cache plein** : Laisser tourner longtemps

---

**Objectif** : Une navigation **ultra-fluide** avec des temps de réponse < 100ms ! 🚀
