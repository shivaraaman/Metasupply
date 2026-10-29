#!/usr/bin/env bash
# Guided setup for deploying MetaSupply to the IC mainnet:
# creates the "metasupply" identity (if needed), redeems a cycles coupon and shows the balance.
# Run it in Ubuntu (WSL):  bash /mnt/d/PROJECTS/Metasupply/scripts/setup-mainnet.sh
set -u
source "$HOME/.local/share/dfx/env"
export DFX_TELEMETRY=off
cd "$(dirname "$0")/.."

step() { printf '\n\033[1;34m== %s ==\033[0m\n' "$1"; }
fail() { printf '\n\033[1;31m%s\033[0m\n' "$1"; exit 1; }

if ! dfx identity list 2>/dev/null | grep -qx 'metasupply'; then
  step "Step 1: create your identity"
  cat <<'EOF'
Choose a passphrase and WRITE IT DOWN first. You will type it twice.
Nothing appears on screen while you type; that is normal. Press Enter after typing it.
Then 24 words are shown: WRITE THEM DOWN too, and never share them.
EOF
  dfx identity new metasupply || fail "Creating the identity failed. Copy the red/yellow message above into the chat."
  echo
  read -r -p "Press Enter only AFTER you have written down the 24 words above... "
  clear
fi

dfx identity use metasupply >/dev/null 2>&1 || fail "Could not switch to the metasupply identity."

step "Your account ID (type your passphrase when asked)"
dfx identity get-principal || fail "Wrong passphrase? Run this script again and try once more."

step "Step 2: redeem a cycles coupon"
read -r -p "Type or paste your coupon code (or just press Enter to skip): " code
if [ -n "$code" ]; then
  echo "Type your passphrase when asked."
  # `script` keeps the passphrase prompt working while saving the faucet's answer to a log.
  script -q -e -c "dfx cycles redeem-faucet-coupon '$code' --network ic" /tmp/metasupply-coupon.log \
    || echo "The coupon was not accepted. The message above says why; it is also saved for Claude."
fi

step "Your cycles balance (type your passphrase when asked)"
dfx cycles balance --network ic

echo
echo "Finished. Go back to the chat and tell Claude what it said."
