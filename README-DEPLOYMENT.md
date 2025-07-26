# MetaSupply Deployment Guide

## Prerequisites

1. **Install DFX SDK**
   ```bash
   sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
   ```

2. **Install Rust and wasm32 target**
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   rustup target add wasm32-unknown-unknown
   ```

3. **Install Node.js and npm** (version 16 or higher)

4. **Get Cycles** (for mainnet deployment)
   - Get free cycles from [DFINITY Faucet](https://faucet.dfinity.org/)
   - Or purchase cycles through NNS

## Local Development Deployment

1. **Clone and setup the project**
   ```bash
   git clone <your-repo>
   cd metasupply
   ```

2. **Run the deployment script**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

3. **Access your application**
   - The script will output the local URL
   - Usually: `http://localhost:4943/?canisterId=<frontend-canister-id>`

## Mainnet Deployment

1. **Ensure you have cycles**
   ```bash
   dfx wallet --network ic balance
   ```

2. **Run the mainnet deployment script**
   ```bash
   chmod +x deploy-mainnet.sh
   ./deploy-mainnet.sh
   ```

3. **Access your live application**
   - URL: `https://<frontend-canister-id>.icp0.io`

## Manual Deployment Steps

If you prefer manual deployment:

### Local Development
```bash
# Start local replica
dfx start --background --clean

# Create canisters
dfx canister create --all

# Build Internet Identity (if using submodule)
cd internet-identity
cargo build --release --target wasm32-unknown-unknown
cd ..

# Deploy Internet Identity
dfx deploy internet_identity --network local

# Build and deploy backend
dfx build metasupply_backend
dfx generate metasupply_backend
dfx deploy metasupply_backend --network local

# Build and deploy frontend
cd src/metasupply_frontend
npm install
npm run build
cd ../..
dfx deploy metasupply_frontend --network local
```

### Mainnet Deployment
```bash
# Create canisters with cycles
dfx canister create --all --network ic --with-cycles 1000000000000

# Build and deploy backend
dfx build metasupply_backend
dfx generate metasupply_backend
dfx deploy metasupply_backend --network ic

# Build and deploy frontend
cd src/metasupply_frontend
npm install
npm run build
cd ../..
dfx deploy metasupply_frontend --network ic
```

## Environment Configuration

### Local Development (.env)
```
VITE_II_CANISTER_ID=rdmx6-jaaaa-aaaaa-aaadq-cai
VITE_DFX_NETWORK=local
VITE_CANISTER_ID_METASUPPLY_BACKEND=<generated-after-deployment>
```

### Production (.env)
```
VITE_II_CANISTER_ID=rdmx6-jaaaa-aaaaa-aaadq-cai
VITE_DFX_NETWORK=ic
VITE_CANISTER_ID_METASUPPLY_BACKEND=<generated-after-deployment>
```

## Troubleshooting

### Common Issues

1. **"Failed to resolve import declarations"**
   - Run `dfx generate metasupply_backend` to generate declaration files

2. **"Insufficient cycles"**
   - Get more cycles from the faucet or purchase them
   - Each canister needs ~1T cycles for deployment

3. **"Internet Identity not working"**
   - Ensure II canister is deployed locally: `dfx deploy internet_identity`
   - Check the II canister ID in your environment variables

4. **"Build failed"**
   - Ensure Rust and wasm32 target are installed
   - Run `cargo clean` in the backend directory if needed

### Useful Commands

```bash
# Check canister status
dfx canister status --all

# View canister logs
dfx canister logs metasupply_backend

# Stop local replica
dfx stop

# Clean build artifacts
dfx canister uninstall-code --all
```

## Cost Estimation (Mainnet)

- **Canister Creation**: ~1T cycles each
- **Code Installation**: ~1T cycles each
- **Storage**: ~127K cycles per MB per year
- **Compute**: Variable based on usage

Total initial cost: ~3T cycles (~$4 USD at current rates)

## Security Considerations

1. **Update CSP headers** in `.ic-assets.json5`
2. **Review Internet Identity integration**
3. **Implement proper access controls** in backend
4. **Regular security audits** before mainnet deployment

## Support

- [DFINITY Developer Docs](https://internetcomputer.org/docs)
- [IC Developer Discord](https://discord.gg/cA7y6ezyE2)
- [DFINITY Forum](https://forum.dfinity.org/)