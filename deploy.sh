#!/bin/bash
# Praxis Prototype Deployment Script for Google Cloud Run
# Ensure you are authenticated via 'gcloud auth login' and have set your project via 'gcloud config set project [PROJECT_ID]'

PROJECT_ID=$(gcloud config get-value project)
REGION="europe-west1" # Closest European region to South Africa
REPO_NAME="praxis-repo"

echo "🚀 Starting deployment to Google Cloud Run (Region: $REGION)..."

# 1. Ensure Artifact Registry repository exists
echo "📦 Setting up Artifact Registry..."
gcloud artifacts repositories create $REPO_NAME \
    --repository-format=docker \
    --location=$REGION \
    --description="Docker repository for Praxis services" || true

# 2. Build and Deploy Backend (Fastify)
echo "⚙️ Building and deploying Backend..."
BACKEND_IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/praxis-backend:latest"

gcloud builds submit ./backend --tag $BACKEND_IMAGE

gcloud run deploy praxis-backend \
    --image $BACKEND_IMAGE \
    --region $REGION \
    --platform managed \
    --allow-unauthenticated \
    --set-env-vars="NODE_ENV=production" \
    --format="value(status.url)" > backend_url.txt

BACKEND_URL=$(cat backend_url.txt)
echo "✅ Backend deployed at: $BACKEND_URL"

# 3. Build and Deploy Frontend (SvelteKit)
echo "🎨 Building and deploying Frontend..."
FRONTEND_IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/praxis-frontend:latest"

gcloud builds submit ./frontend --tag $FRONTEND_IMAGE

gcloud run deploy praxis-frontend \
    --image $FRONTEND_IMAGE \
    --region $REGION \
    --platform managed \
    --allow-unauthenticated \
    --set-env-vars="PUBLIC_API_URL=$BACKEND_URL,NODE_ENV=production" \
    --format="value(status.url)" > frontend_url.txt

FRONTEND_URL=$(cat frontend_url.txt)
echo "✅ Frontend deployed at: $FRONTEND_URL"

echo "🎉 Praxis deployment complete!"
echo "➡️ Frontend Live: $FRONTEND_URL"
echo "➡️ Backend Live: $BACKEND_URL"

# Cleanup temporary files
rm backend_url.txt frontend_url.txt