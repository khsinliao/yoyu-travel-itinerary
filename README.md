# 悠遊 YOYU - Travel Planner

A comprehensive travel itinerary and expense tracker app.

## Project Setup

### 1. Install Dependencies
Run the following command to install all required packages:
```bash
npm install
```

### 2. Development
Start the local development server:
```bash
npm run dev
```

## Deployment to GitHub Pages

This project is configured to deploy automatically to GitHub Pages using the `gh-pages` package.

### Prerequisites
1. Ensure this project is a git repository linked to GitHub.
2. The `package.json` includes the necessary `deploy` scripts.

### Deploy Steps
1. Run the deploy command:
   ```bash
   npm run deploy
   ```
   This script will:
   - Build the project (`npm run build`)
   - Push the contents of the `dist` folder to a `gh-pages` branch on your GitHub repository.

2. **Configure GitHub Settings**:
   - Go to your repository on GitHub.
   - Navigate to **Settings** > **Pages**.
   - Under **Build and deployment** > **Source**, select **Deploy from a branch**.
   - Select the `gh-pages` branch and `/ (root)` folder.
   - Click **Save**.

Your app should be live shortly after!
