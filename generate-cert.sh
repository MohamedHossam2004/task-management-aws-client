#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Generating SSL certificate for Vite development server..."

# Directory to save the certificates
CERT_DIR="./certificates"
mkdir -p $CERT_DIR

# Generate a private key
openssl genrsa -out $CERT_DIR/privatekey.pem 2048

# Generate a certificate signing request
openssl req -new -key $CERT_DIR/privatekey.pem -out $CERT_DIR/csr.pem -subj "/CN=54.161.40.157/O=Dev Cert/C=US"

# Generate a self-signed certificate (valid for 365 days)
openssl x509 -req -days 365 -in $CERT_DIR/csr.pem -signkey $CERT_DIR/privatekey.pem -out $CERT_DIR/certificate.pem

# Create PEM files
cat $CERT_DIR/certificate.pem > $CERT_DIR/fullchain.pem
cat $CERT_DIR/privatekey.pem > $CERT_DIR/privkey.pem

echo "Certificate generated successfully!"
echo "Certificate: $CERT_DIR/certificate.pem"
echo "Private Key: $CERT_DIR/privatekey.pem"
echo "Full Chain: $CERT_DIR/fullchain.pem"
echo "Private Key: $CERT_DIR/privkey.pem"

echo "To use these certificates with Vite, update your vite.config.js file."