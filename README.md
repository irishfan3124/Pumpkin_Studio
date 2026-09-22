# Pumpkin Studio

Design custom 3D-printable jack-o’-lanterns with SVG/image faces, hollow shells, a removable lid and stem, live 3D previews, and binary STL downloads. Designed for public GitHub Pages hosting and sharing with the MakerWorld community.

## Preview locally

```sh
cd pumpkin-studio
npm install
npm run build
npm run dev
```

Open http://127.0.0.1:5173. See [application details](pumpkin-studio/README.md) for geometry limitations and print guidance.

## Publish on GitHub Pages

1. Create a GitHub repository and push the contents of **this entire project folder**, keeping `.github/workflows/pages.yml` at the repository root and the app in `pumpkin-studio/`.
2. In the repository, go to **Settings → Pages → Build and deployment → Source**, then select **GitHub Actions**.
3. Push to `main` or `master`, or run **Publish Pumpkin Studio** manually in the Actions tab.
4. After the workflow succeeds, use the URL shown in its `github-pages` deployment to share the app with MakerWorld users.

The workflow tests and builds the app before publishing only `pumpkin-studio/dist`. Relative asset and worker URLs support both repository Pages URLs and a custom domain. No API keys, login system, server, or paid backend is required. Users' uploaded face designs remain on their device.

Official instructions: [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

This project is prepared for deployment but has not been pushed or published. Choose a repository and configure Pages before running the workflow.

**Use LED lights only. Never put a flame inside a plastic print.** No physical test print has been performed.
