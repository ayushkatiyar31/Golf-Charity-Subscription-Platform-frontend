# Deploying This Frontend to Vercel

This project is a Vite frontend located in `client/`.

## Before you deploy

You need a backend API running somewhere publicly, because in production this app calls:

- `VITE_API_URL/api`

Example:

- `VITE_API_URL=https://your-backend.example.com`

Do not include `/api` at the end. The app adds that automatically in production.

## Option 1: Deploy from the Vercel dashboard

1. Push this repository to GitHub, GitLab, or Bitbucket.
2. In Vercel, click **Add New Project**.
3. Import this repository.
4. Set **Root Directory** to `client`.
5. Confirm these build settings:

   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`

6. In **Environment Variables**, add:

   - Name: `VITE_API_URL`
   - Value: `https://your-backend.example.com`

7. Click **Deploy**.

## Option 2: Deploy with the Vercel CLI

From the `client` folder:

```powershell
cd client
npm install
npx vercel
```

When prompted:

- Link to an existing project or create a new one
- Confirm the current directory is correct
- Add the environment variable `VITE_API_URL=https://your-backend.example.com`

For production deploys:

```powershell
npx vercel --prod
```

## Routing

The file `client/vercel.json` already contains a rewrite so React Router routes load correctly on refresh:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## Notes

- Local development uses a Vite proxy for `/api`.
- Production does not use that proxy; it sends requests directly to `VITE_API_URL`.
- If your frontend loads but API calls fail, the most likely issue is an incorrect `VITE_API_URL` value or backend CORS settings.
