#!/bin/bash
# Purple Haze Workspace Single-Stack Orchestrator
echo "--- Starting Purple Haze Workspace ---"
# Start backend
pnpm start:backend > backend.log 2>&1 &
BACKEND_PID=$!
# Start frontend
pnpm dev > frontend.log 2>&1 &
FRONTEND_PID=$!
# Cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM
wait
