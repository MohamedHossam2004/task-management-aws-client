#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Starting secure Vite development server..."

# Check if certificates exist
CERT_DIR="./certificates"
CERT_FILE="$CERT_DIR/certificate.pem"
KEY_FILE="$CERT_DIR/privkey.pem"

if [ ! -f "$CERT_FILE" ] || [ ! -f "$KEY_FILE" ]; then
  echo "SSL certificates not found. Generating..."
  chmod +x ./generate-cert.sh
  ./generate-cert.sh
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Start Vite development server
echo "Starting Vite server with HTTPS..."
echo "Access your app at https://54.161.40.157:5173"
echo "You may need to accept the self-signed certificate warning in your browser."

# Export NODE_TLS_REJECT_UNAUTHORIZED to allow self-signed certificates in development
export NODE_TLS_REJECT_UNAUTHORIZED=0

# Start the Vite development server
npm run dev -- --host 0.0.0.0 --https