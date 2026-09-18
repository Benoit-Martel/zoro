# Guide de déploiement - Réinitialisation de mot de passe

## Problème actuel

Lorsqu'un utilisateur demande une réinitialisation de mot de passe, le lien est seulement affiché dans la console au lieu d'être envoyé par email.

## Solution implémentée

Une Edge Function Supabase a été créée pour envoyer automatiquement les emails de réinitialisation.

## Étapes de déploiement

### 1. Configurer Resend (service d'email)

1. Créez un compte sur [Resend.com](https://resend.com/)
2. Obtenez votre clé API depuis le dashboard
3. Vérifiez un domaine d'envoi ou utilisez l'email par défaut fourni

### 2. Déployer l'Edge Function

```bash
# Installer Supabase CLI si ce n'est pas déjà fait
npm install -g supabase

# Se connecter à Supabase
supabase login

# Déployer la fonction
cd e:\WEB\zorro\workspace
supabase functions deploy send-password-reset-email --project-ref <votre-project-ref>
```

Remplacez `<votre-project-ref>` par l'ID de votre projet Supabase (trouvable dans Settings > General > Project ID)

### 3. Configurer les variables d'environnement

Dans le dashboard Supabase :

1. Allez dans **Settings** > **Edge Functions**
2. Ajoutez ces variables :

| Variable                    | Valeur                          | Où la trouver                              |
| --------------------------- | ------------------------------- | ------------------------------------------ |
| `SUPABASE_SERVICE_ROLE_KEY` | Votre clé service role          | Settings > API > Service Role Key (secret) |
| `RESEND_API_KEY`            | Votre clé Resend                | Dashboard Resend > API Keys                |
| `APP_BASE_URL`              | `https://votredomaine.com/zoro` | L'URL de votre application en production   |

**Important** : Pour le développement local, utilisez `http://localhost:5173/zoro`

### 4. Tester

1. Allez sur la page de connexion
2. Cliquez sur "Mot de passe oublié"
3. Entrez votre email
4. Vous devriez recevoir un email avec le lien de réinitialisation

## Vérification

Pour vérifier que tout fonctionne :

1. Ouvrez la console du navigateur (F12)
2. Demandez une réinitialisation de mot de passe
3. Vérifiez qu'il n'y a pas d'erreur dans la console
4. Consultez vos emails (y compris le dossier spam)

## Dépannage

### Je ne reçois toujours pas l'email

1. Vérifiez le dossier spam/courrier indésirable
2. Vérifiez les logs de l'Edge Function dans Supabase Dashboard > Edge Functions > Logs
3. Assurez-vous que les variables d'environnement sont correctement configurées
4. Vérifiez que votre domaine d'envoi est vérifié sur Resend

### Erreur "Email service not configured"

La variable `RESEND_API_KEY` n'est pas configurée. Ajoutez-la dans les paramètres de l'Edge Function.

### Erreur "User not found"

Vérifiez que l'email existe bien dans la table `zoro_users`.

## Coûts

- **Resend** : 3000 emails gratuits par mois, puis $0.002 par email
- **Supabase Edge Functions** : Inclus dans votre plan Supabase
