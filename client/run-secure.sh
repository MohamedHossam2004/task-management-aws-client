#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Create certificates directory if it doesn't exist
CERT_DIR="./certificates"
mkdir -p $CERT_DIR

# Check if certificate files exist, generate them if they don't
if [ ! -f "$CERT_DIR/certificate.pem" ] || [ ! -f "$CERT_DIR/privkey.pem" ]; then
  echo "Generating SSL certificates..."
  
  # Generate private key
  openssl genrsa -out $CERT_DIR/privkey.pem 2048
  
  # Generate self-signed certificate
  openssl req -new -x509 -key $CERT_DIR/privkey.pem -out $CERT_DIR/certificate.pem -days 365 -subj "/CN=54.161.40.157/O=Development/C=US" -nodes
  
  echo "SSL certificates generated successfully!"
fi

# Set environment variable to allow self-signed certificates
export NODE_TLS_REJECT_UNAUTHORIZED=0

# Start the development server
echo "Starting secure Vite server..."
echo "Access your app at https://54.161.40.157:5173"
echo "You may need to accept the self-signed certificate warning in your browser."

npm run dev