#!/bin/bash
# Praxis Prototype — Single Cloud Run Service
# Deploys both frontend (SvelteKit) and backend (Fastify) in one container.

PROJECT_ID=$(gcloud config get-value project)
REGION="europe-west1"
REPO_NAME="praxis-repo"

echo "Starting deployment to Cloud Run ($REGION)..."

# Ensure Artifact Registry exists
gcloud artifacts repositories create $REPO_NAME \
    --repository-format=docker \
    --location=$REGION \
    --description="Docker repository for Praxis" 2>/dev/null || true

IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/praxis:latest"

# Build and deploy
gcloud builds submit . --tag $IMAGE --timeout=15m

gcloud run deploy praxis \
    --image $IMAGE \
    --region $REGION \
    --platform managed \
    --allow-unauthenticated \
    --port=8080 \
    --set-env-vars="NODE_ENV=production,GEMINI_API_KEY=AIzaSyAY5g7NcnmSZ2ziSJ2ORX-ySZooRBfSSxY" \
    --format="value(status.url)"

echo "Deployment complete."
