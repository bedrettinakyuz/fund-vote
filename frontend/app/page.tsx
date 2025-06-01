"use client";
import React, { useEffect, useState } from "react";
import freighterApi from "@stellar/freighter-api";
import VotingInterface from "../components/VotingInterface";
import WalletConnection from "../components/WalletConnection";

export default function Home() {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkFreighter = async () => {
      try {
        const connected = await freighterApi.isConnected();
        if (connected) {
          const { address } = await freighterApi.getAddress();
          setPublicKey(address);
        }
      } catch (error) {
        console.error("Error checking Freighter connection:", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkFreighter();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Stellar Voting DApp
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Oyunuzu verin ve favori seçeneğinize finansal destek sağlayın
          </p>
        </div>

        {/* Wallet Connection */}
        <div className="flex justify-center mb-8">
          <WalletConnection 
            publicKey={publicKey} 
            setPublicKey={setPublicKey} 
          />
        </div>

        {/* Voting Interface */}
        {publicKey && (
          <VotingInterface publicKey={publicKey} />
        )}

        {/* Info Section */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="text-blue-400 text-3xl mb-4">🗳️</div>
            <h3 className="text-xl font-semibold text-white mb-2">Oy Verin</h3>
            <p className="text-gray-300">
              3 farklı seçenek arasından birini seçerek oyunuzu kullanın
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="text-green-400 text-3xl mb-4">💰</div>
            <h3 className="text-xl font-semibold text-white mb-2">Destek Olun</h3>
            <p className="text-gray-300">
              Oyunuzla birlikte seçtiğiniz seçeneğe finansal destek sağlayın
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="text-purple-400 text-3xl mb-4">🌟</div>
            <h3 className="text-xl font-semibold text-white mb-2">Blockchain</h3>
            <p className="text-gray-300">
              Stellar ağında güvenli ve şeffaf işlemler gerçekleştirin
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}