#!/bin/bash

# Create certificates directory if it doesn't exist
mkdir -p certificates

# Generate private key
openssl genrsa -out certificates/private-key.pem 2048

# Generate certificate signing request
openssl req -new -key certificates/private-key.pem -out certificates/csr.pem -subj "/C=VN/ST=HoChiMinh/L=HoChiMinh/O=YourCompany/OU=IT/CN=localhost"

# Generate self-signed certificate
openssl x509 -req -days 365 -in certificates/csr.pem -signkey certificates/private-key.pem -out certificates/certificate.pem

# Clean up CSR file
rm certificates/csr.pem

echo "SSL certificates generated successfully!"
echo "Files created:"
echo "- certificates/private-key.pem"
echo "- certificates/certificate.pem"
echo ""
echo "Note: These are self-signed certificates for development only."
echo "For production, use certificates from a trusted Certificate Authority." 