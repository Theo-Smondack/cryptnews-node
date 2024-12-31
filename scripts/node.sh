#!/bin/sh

# Exit gracefully
trap "exit" SIGINT
trap "exit" SIGTERM

echo "Installing dependencies"

npm install

echo "Starting dev server"

npm run dev
