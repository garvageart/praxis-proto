#!/bin/sh
# Single container: backend on :8081, frontend on :8080 (Cloud Run PORT)
set -e

BACKEND_PORT=8081
FRONTEND_PORT="${PORT:-8080}"

# Start backend
cd /app/backend
PORT=$BACKEND_PORT node dist/index.js &
BACKEND_PID=$!

# Wait for backend to be ready
echo "Waiting for backend on :$BACKEND_PORT..."
for i in $(seq 1 15); do
  node -e "require('net').createConnection($BACKEND_PORT).on('connect',()=>process.exit(0)).on('error',()=>process.exit(1))" 2>/dev/null && { echo "Backend ready."; break; }
  sleep 1
done

# Start frontend (proxies /api/* to backend via hooks.server.ts)
cd /app/frontend
API_PROXY_TARGET="http://localhost:$BACKEND_PORT" PORT=$FRONTEND_PORT node build &
FRONTEND_PID=$!

echo "Praxis running: frontend on :$FRONTEND_PORT, backend on :$BACKEND_PORT"

# Forward signals
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM

# Wait for either to exit
wait
