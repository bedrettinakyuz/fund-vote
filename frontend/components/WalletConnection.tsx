"use client";
import React from "react";
import freighterApi from "@stellar/freighter-api";

interface WalletConnectionProps {
  publicKey: string | null;
  setPublicKey: (key: string | null) => void;
}

export default function WalletConnection({ publicKey, setPublicKey }: WalletConnectionProps) {
  const handleConnectWallet = async () => {
    try {
      await freighterApi.setAllowed();
      const { address } = await freighterApi.getAddress();
      setPublicKey(address);
    } catch (error) {
      console.error("Error connecting to Freighter:", error);
      alert("Freighter cüzdanını bağlarken hata oluştu. Lütfen Freighter eklentisinin yüklü olduğundan emin olun.");
    }
  };

  const handleDisconnect = () => {
    setPublicKey(null);
  };

  const formatPublicKey = (key: string) => {
    return `${key.slice(0, 6)}...${key.slice(-6)}`;
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 min-w-[300px]">
      <h2 className="text-2xl font-bold mb-4 text-white text-center">Cüzdan Durumu</h2>
      
      {publicKey ? (
        <div className="text-center space-y-4">
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
            <p className="text-green-400 font-semibold mb-2">✅ Bağlandı</p>
            <p className="text-white font-mono text-sm">
              {formatPublicKey(publicKey)}
            </p>
          </div>
          <button
            onClick={handleDisconnect}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200"
          >
            Bağlantıyı Kes
          </button>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
            <p className="text-yellow-400 font-semibold">⚠️ Cüzdan Bağlı Değil</p>
          </div>
          <button
            onClick={handleConnectWallet}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Freighter Cüzdanını Bağla
          </button>
        </div>
      )}
    </div>
  );
}