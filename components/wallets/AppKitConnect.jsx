// components/wallets/AppKitConnect.jsx
import { AppKitButton } from "@reown/appkit-react";

export default function AppKitConnect({ className }) {
  // Le bouton ouvre le modal (Rabby, Farcaster Wallet, WC, etc.)
  return <AppKitButton className={className} label="Connect Wallet" />;
}
