# Deployment

CalcLine Web is a Next.js application that can be deployed on Vercel from a GitHub repository.

## Vercel via GitHub

1. Push the project to GitHub.
2. In Vercel, choose **Add New Project** and import the GitHub repository.
3. Keep the default framework preset: **Next.js**.
4. Use the default install command:
   `npm install`
5. Use the build command:
   `npm run build`
6. Use the default output settings for Next.js.
7. Deploy the project.

Before deploying, run:

```bash
npm test
npm run build
```

The `reference/` directory contains source material from the original MIT App Inventor project and is not required for the deployed application.
