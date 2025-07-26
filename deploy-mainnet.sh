#!/bin/bash

# MetaSupply Mainnet Deployment Script
echo "🚀 Starting MetaSupply MAINNET deployment..."

# Check if dfx is installed
if ! command -v dfx &> /dev/null; then
    echo "❌ DFX is not installed. Please install it first:"
    echo "sh -ci \"\$(curl -fsSL https://internetcomputer.org/install.sh)\""
    exit 1
fi

# Check if user has cycles
echo "💰 Checking cycles balance..."
dfx wallet --network ic balance

# Create canisters on mainnet
echo "🏗️  Creating canisters on IC mainnet..."
dfx canister create --all --network ic --with-cycles 1000000000000

# Build backend
echo "🦀 Building Rust backend..."
dfx build metasupply_backend

# Generate declarations
echo "📝 Generating declarations..."
dfx generate metasupply_backend

# Update environment for production
echo "🔧 Updating environment for production..."
cd src/metasupply_frontend
cp .env.example .env
sed -i 's/VITE_DFX_NETWORK=local/VITE_DFX_NETWORK=ic/' .env

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Build frontend for production
echo "🎨 Building frontend for production..."
npm run build

# Go back to root
cd ../..

# Deploy backend to mainnet
echo "🚀 Deploying backend to IC mainnet..."
dfx deploy metasupply_backend --network ic

# Deploy frontend to mainnet
echo "🌐 Deploying frontend to IC mainnet..."
dfx deploy metasupply_frontend --network ic

echo "✅ MAINNET Deployment complete!"
echo ""
echo "🌐 Your application is live at:"
echo "https://$(dfx canister id metasupply_frontend --network ic).icp0.io"
echo ""
echo "📋 Mainnet Canister IDs:"
echo "Backend: $(dfx canister id metasupply_backend --network ic)"
echo "Frontend: $(dfx canister id metasupply_frontend --network ic)"