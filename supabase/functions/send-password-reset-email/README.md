# Send Password Reset Email - Edge Function

Cette Edge Function envoie un email de réinitialisation de mot de passe aux utilisateurs.

## Configuration requise

### Variables d'environnement

Vous devez configurer les variables d'environnement suivantes dans Supabase :

1. **SUPABASE_URL** - L'URL de votre projet Supabase (automatiquement disponible)
2. **SUPABASE_SERVICE_ROLE_KEY** - La clé de rôle de service Supabase (pour accéder aux données admin)
3. **RESEND_API_KEY** - Votre clé API Resend pour l'envoi d'emails
4. **APP_BASE_URL** - L'URL de base de votre application (ex: `https://votredomaine.com` ou `http://localhost:5173`)

### Configuration de Resend

1. Créez un compte sur [Resend](https://resend.com/)
2. Obtenez votre clé API depuis le dashboard
3. Vérifiez votre domaine d'envoi (ou utilisez l'email par défaut fourni par Resend)
4. Mettez à jour le champ `from` dans le code avec votre email vérifié

## Déploiement

### Via Supabase CLI

```bash
# Se connecter à Supabase
supabase login

# Déployer la fonction
supabase functions deploy send-password-reset-email --project-ref <votre-project-ref>
```

### Via le Dashboard Supabase

1. Allez dans votre projet Supabase
2. Naviguez vers "Edge Functions"
3. Cliquez sur "New Function"
4. Copiez le contenu de `index.ts`
5. Configurez les variables d'environnement dans l'onglet "Settings"

## Configuration des variables d'environnement

Dans le dashboard Supabase :

1. Allez dans Settings > Edge Functions
2. Ajoutez les variables suivantes :
   - `SUPABASE_SERVICE_ROLE_KEY` : Trouvez-la dans Settings > API > Service Role Key
   - `RESEND_API_KEY` : Votre clé API Resend
   - `APP_BASE_URL` : L'URL de votre application (ex: `https://zorodateur.com`)

## Test local

```bash
# Démarrer Supabase localement
supabase start

# Déployer la fonction localement
supabase functions serve send-password-reset-email --env-file .env.local
```

## Utilisation

L'Edge Function est appelée automatiquement par le frontend lorsque l'utilisateur demande une réinitialisation de mot de passe.

### Payload attendu

```json
{
  "email": "utilisateur@example.com",
  "resetToken": "token-généré-par-le-frontend"
}
```

### Réponse

```json
{
  "success": true,
  "message": "Password reset email sent successfully"
}
```

## Sécurité

- La fonction utilise la clé de rôle de service pour accéder aux données utilisateur
- Le token de réinitialisation expire après 24 heures
- L'email contient un lien sécurisé vers la page de réinitialisation
- Les erreurs ne révèlent pas si un email existe dans la base de données
