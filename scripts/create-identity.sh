#!/usr/bin/env bash
# Creates the password-protected dfx identity that will own the mainnet canister.
set -e
source "$HOME/.local/share/dfx/env"
export DFX_TELEMETRY=off
cd "$(dirname "$0")/.."

cat <<'EOF'

Creating your MetaSupply identity.

1. Choose a passphrase and WRITE IT DOWN before typing it.
   You will type it twice. Nothing appears while you type; that is normal.
2. Then 24 words (the seed phrase) are shown. WRITE THEM DOWN too.
   Keep both on paper or in a password manager. Never share them.

EOF
dfx identity new metasupply

echo
read -r -p "Press Enter only AFTER you have written down the 24 words above... "
clear

dfx identity use metasupply
echo
echo "Checking that you remember the passphrase: type it once more."
echo "Your public account ID (safe to share):"
dfx identity get-principal
echo
echo "Done. You can close this tab and go back to the chat."
