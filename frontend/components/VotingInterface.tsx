"use client";
import React, { useState, useEffect } from "react";
import { TransactionBuilder, Networks, Asset, Operation, Memo, Horizon, Keypair, BASE_FEE, Transaction } from "@stellar/stellar-sdk";
import freighterApi from "@stellar/freighter-api";

// Stellar SDK'yi import et
const StellarSdk = require('@stellar/stellar-sdk');

// Sunucu bağlantısı
const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');

// VotingOption interface
interface VotingOption {
  id: number;
  name: string;
  description: string;
  address: string;
  icon: string;
  color: string;
}

// VotingInterface component props
interface VotingInterfaceProps {
  publicKey: string;
}

// Oylama seçeneklerini tanımla
const votingOptions: VotingOption[] = [
  {
    id: 1,
    name: "Seçenek A",
    description: "Yenilikçi teknoloji projeleri için destek",
    address: "GAVL36HP7MNDIOCQABGSNLC7NUSYSUD7GU3AOSAQNOMHWM66YZFAFLHV", // Örnek adres
    icon: "🚀",
    color: "from-blue-500 to-cyan-500"
  },
  {
    id: 2,
    name: "Seçenek B",
    description: "Çevre dostu sürdürülebilir projeler",
    address: "GAVL36HP7MNDIOCQABGSNLC7NUSYSUD7GU3AOSAQNOMHWM66YZFAFLHV", // Örnek adres
    icon: "🌱",
    color: "from-green-500 to-emerald-500"
  },
  {
    id: 3,
    name: "Seçenek C",
    description: "Eğitim ve sosyal fayda projeleri",
    address: "GAVL36HP7MNDIOCQABGSNLC7NUSYSUD7GU3AOSAQNOMHWM66YZFAFLHV", // Örnek adres
    icon: "📚",
    color: "from-purple-500 to-pink-500"
  }
];

export default function VotingInterface({ publicKey }: VotingInterfaceProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [amount, setAmount] = useState<number>(1);
  const [isVoting, setIsVoting] = useState(false);
  const [votingResults, setVotingResults] = useState<{ [key: number]: number }>({});

  // Oylama sonuçlarını yükle (gerçek uygulamada akıllı sözleşmeden gelecek)
  useEffect(() => {
    // Örnek veri - gerçek uygulamada akıllı sözleşmeden çekilecek
    setVotingResults({
      1: 45,
      2: 32,
      3: 23
    });
  }, []);

  const handleVote = async () => {
    if (!selectedOption || !amount || amount <= 0) {
      alert("Lütfen bir seçenek seçin ve geçerli bir miktar belirtin.");
      return;
    }

    setIsVoting(true);

    try {
      // Kaynak hesabı yükle
      const sourceAccount = await server.loadAccount(publicKey);

      const selectedVotingOption = votingOptions.find(opt => opt.id === selectedOption);
      if (!selectedVotingOption) throw new Error("Geçersiz seçenek");

      // İşlem oluştur



        // Create the payment operation
      const paymentOperation = Operation.payment({
        destination: selectedVotingOption.address,
        asset: Asset.native(),
        amount: amount.toString(),
        source: publicKey
      });

      // Build the transaction
      const transaction = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET
      })
        .addOperation(paymentOperation)
        .addMemo(Memo.text(`Vote for option ${selectedOption}`))
        .setTimeout(300)
        .build();

      // Sign the transaction with Freighter
      const { signedTxXdr } = await freighterApi.signTransaction(transaction.toXDR(), {
        networkPassphrase: Networks.TESTNET
      });

      if (!signedTxXdr) {
        throw new Error("Transaction signing failed");
      }

      // Submit the transaction to the network
      const transactionToSubmit = new Transaction(signedTxXdr, Networks.TESTNET);
      const transactionResult = await server.submitTransaction(transactionToSubmit);

      console.log("İşlem başarılı:", transactionResult);
      alert(`Oyunuz başarıyla kaydedildi! ${amount} XLM ${selectedVotingOption.name} seçeneğine gönderildi.`);
      
      // Formu sıfırla
      setSelectedOption(null);
      setAmount(1);

    } catch (error) {
      console.error("Oylama hatası:", error);
      alert("Oylama sırasında bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">
          Oylama ve Destek Sistemi
        </h2>

        {/* Oylama Seçenekleri */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {votingOptions.map((option) => (
            <div
              key={option.id}
              onClick={() => setSelectedOption(option.id)}
              className={`cursor-pointer rounded-xl p-6 border-2 transition-all duration-300 transform hover:scale-105 ${
                selectedOption === option.id
                  ? "border-white bg-white/20 shadow-2xl scale-105"
                  : "border-white/30 bg-white/5 hover:bg-white/10"
              }`}
            >
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${option.color} flex items-center justify-center text-2xl`}>
                {option.icon}
              </div>
              <h3 className="text-xl font-semibold text-white text-center mb-2">
                {option.name}
              </h3>
              <p className="text-gray-300 text-center text-sm mb-4">
                {option.description}
              </p>
              
              {/* Oy Yüzdesi */}
              <div className="bg-gray-700 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full bg-gradient-to-r ${option.color}`}
                  style={{ width: `${votingResults[option.id] || 0}%` }}
                ></div>
              </div>
              <p className="text-center text-sm text-gray-400">
                %{votingResults[option.id] || 0} oy
              </p>
            </div>
          ))}
        </div>

        {/* Miktar ve Oylama Butonu */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-white font-semibold mb-2">
                Gönderilecek Miktar (XLM)
              </label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="1.0"
              />
            </div>
            
            <button
              onClick={handleVote}
              disabled={!selectedOption || isVoting}
              className={`px-8 py-3 rounded-lg font-bold text-white transition-all duration-200 ${
                selectedOption && !isVoting
                  ? "bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl"
                  : "bg-gray-600 cursor-not-allowed"
              }`}
            >
              {isVoting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>İşleniyor...</span>
                </div>
              ) : (
                "Oy Ver ve Destek Ol"
              )}
            </button>
          </div>
          
          {selectedOption && (
            <div className="mt-4 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
              <p className="text-blue-300">
                <strong>{votingOptions.find(opt => opt.id === selectedOption)?.name}</strong> seçeneğine 
                <strong> {amount} XLM</strong> göndereceksiniz.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
