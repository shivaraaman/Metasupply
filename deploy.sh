#!/bin/bash

# MetaSupply Deployment Script
echo "🚀 Starting MetaSupply deployment..."

# Check if dfx is installed
if ! command -v dfx &> /dev/null; then
    echo "❌ DFX is not installed. Please install it first:"
    echo "sh -ci \"\$(curl -fsSL https://internetcomputer.org/install.sh)\""
    exit 1
fi

# Start local replica (if not already running)
echo "📡 Starting local replica..."
dfx start --background --clean

# Create canisters
echo "🏗️  Creating canisters..."
dfx canister create --all

# Build and deploy Internet Identity (if needed)
echo "🔐 Setting up Internet Identity..."
if [ -d "internet-identity" ]; then
    cd internet-identity
    cargo build --release --target wasm32-unknown-unknown
    cd ..
fi

# Deploy Internet Identity
dfx deploy internet_identity --network local

# Build backend
echo "🦀 Building Rust backend..."
dfx build metasupply_backend

# Generate declarations
echo "📝 Generating declarations..."
dfx generate metasupply_backend

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd src/metasupply_frontend
npm install

# Build frontend
echo "🎨 Building frontend..."
npm run build

# Go back to root
cd ../..

# Deploy backend
echo "🚀 Deploying backend..."
dfx deploy metasupply_backend --network local

# Deploy frontend
echo "🌐 Deploying frontend..."
dfx deploy metasupply_frontend --network local

echo "✅ Deployment complete!"
echo ""
echo "🌐 Your application is available at:"
dfx canister call metasupply_frontend http_request '(record{url="/"; method="GET"; body=vec{}; headers=vec{}})'
echo ""
echo "📋 Canister IDs:"
echo "Backend: $(dfx canister id metasupply_backend)"
echo "Frontend: $(dfx canister id metasupply_frontend)"
echo "Internet Identity: $(dfx canister id internet_identity)"