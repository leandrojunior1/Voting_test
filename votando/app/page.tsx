'use client';

import { useState, useEffect } from 'react';

export default function VotacaoPage() {
  const [votosLula, setVotosLula] = useState(14230);
  const [votosFlavio, setVotosFlavio] = useState(13980);
  const [modalAberto, setModalAberto] = useState(false);
  const [candidatoEscolhido, setCandidatoEscolhido] = useState<'lula' | 'flavio' | null>(null);
  const [email, setEmail] = useState('');
  
  // Estados para o Pix
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
  const [pixCopiaECola, setPixCopiaECola] = useState<string | null>(null);
  const [carregandoPix, setCarregandoPix] = useState(false);
  const [copiado, setCopiado] = useState(false);

  // Simulação de atualização em tempo real para gerar o efeito de disputa acirrada
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.5) {
        setVotosLula((v) => v + Math.floor(Math.random() * 3));
      } else {
        setVotosFlavio((v) => v + Math.floor(Math.random() * 3));
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const totalVotos = votosLula + votosFlavio;
  const pctLula = ((votosLula / totalVotos) * 100).toFixed(1);
  const pctFlavio = ((votosFlavio / totalVotos) * 100).toFixed(1);

  const iniciarVoto = (candidato: 'lula' | 'flavio') => {
    setCandidatoEscolhido(candidato);
    setModalAberto(true);
  };

  const gerarPix = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregandoPix(true);
    setQrCodeBase64(null);
    setPixCopiaECola(null);

    try {
      const response = await fetch('/api/pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, candidato: candidatoEscolhido })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setQrCodeBase64(data.qrCodeBase64);
        setPixCopiaECola(data.qrCodeCopyPaste);
      } else {
        alert(data.error || 'Erro ao gerar Pix. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro de conexão:', error);
      alert('Erro de conexão ao gerar o pagamento.');
    } finally {
      setCarregandoPix(false);
    }
  };

  const copiarChavePix = () => {
    if (pixCopiaECola) {
      navigator.clipboard.writeText(pixCopiaECola);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-between p-4 selection:bg-red-500">
      {/* Header com tom de urgência/viral */}
      <header className="text-center mt-6">
        <span className="bg-red-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full animate-pulse">
          🔴 Votação Oficial ao Vivo
        </span>
        <h1 className="text-3xl md:text-5xl font-black mt-3 tracking-tight">
          QUEM GANHA ESSA BATALHA?
        </h1>
        <p className="text-slate-400 text-sm mt-1">Cada R$ 1,00 vale 1 voto. Vote quantas vezes quiser!</p>
      </header>

      {/* Placar / Duelo */}
      <div className="w-full max-w-2xl grid grid-cols-2 gap-4 my-8">
        {/* Card Lula */}
        <div className="bg-slate-900 border-2 border-red-900/50 rounded-2xl p-6 flex flex-col items-center text-center shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-red-600" />
          <div className="w-24 h-24 rounded-full bg-red-950 border-2 border-red-600 flex items-center justify-center text-3xl font-bold mb-4 shadow-inner">
            🔴
          </div>
          <h2 className="text-xl font-bold">Lula</h2>
          <span className="text-3xl font-black text-red-500 mt-2">{pctLula}%</span>
          <p className="text-xs text-slate-400 mt-1">{votosLula.toLocaleString()} votos</p>
          <button
            onClick={() => iniciarVoto('lula')}
            className="mt-6 w-full bg-red-600 hover:bg-red-500 active:scale-95 transition font-bold py-3 px-4 rounded-xl shadow-lg cursor-pointer"
          >
            Votar no Lula (R$ 1)
          </button>
        </div>

        {/* Card Flávio */}
        <div className="bg-slate-900 border-2 border-blue-900/50 rounded-2xl p-6 flex flex-col items-center text-center shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-blue-600" />
          <div className="w-24 h-24 rounded-full bg-blue-950 border-2 border-blue-600 flex items-center justify-center text-3xl font-bold mb-4 shadow-inner">
            🔵
          </div>
          <h2 className="text-xl font-bold">Flávio</h2>
          <span className="text-3xl font-black text-blue-500 mt-2">{pctFlavio}%</span>
          <p className="text-xs text-slate-400 mt-1">{votosFlavio.toLocaleString()} votos</p>
          <button
            onClick={() => iniciarVoto('flavio')}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-500 active:scale-95 transition font-bold py-3 px-4 rounded-xl shadow-lg cursor-pointer"
          >
            Votar no Flávio (R$ 1)
          </button>
        </div>
      </div>

      {/* Barra de Progresso Geral */}
      <div className="w-full max-w-2xl bg-slate-900 rounded-full h-4 overflow-hidden p-0.5 border border-slate-800">
        <div className="flex h-full rounded-full overflow-hidden">
          <div style={{ width: `${pctLula}%` }} className="bg-red-600 transition-all duration-500" />
          <div style={{ width: `${pctFlavio}%` }} className="bg-blue-600 transition-all duration-500" />
        </div>
      </div>

      <footer className="text-slate-600 text-xs my-6 text-center">
        Site de entretenimento e paródia político-social focado em engajamento digital.
      </footer>

      {/* Modal de Pagamento Pix */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => { 
                setModalAberto(false); 
                setQrCodeBase64(null); 
                setPixCopiaECola(null); 
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <h3 className="text-xl font-bold mb-2">
              Votar em <span className="uppercase text-amber-400">{candidatoEscolhido}</span>
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              Cada voto custa <strong>R$ 1,00</strong>. Insira seu e-mail para liberar o pagamento:
            </p>

            {!qrCodeBase64 ? (
              <form onSubmit={gerarPix} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Seu E-mail</label>
                  <input
                    type="email"
                    required
                    placeholder="seu.email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={carregandoPix}
                  className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold py-3 rounded-xl transition cursor-pointer"
                >
                  {carregandoPix ? 'Gerando Pix...' : 'Gerar QR Code PIX (R$ 1,00)'}
                </button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="bg-white p-3 rounded-xl inline-block shadow-md">
                  <img 
                    src={`data:image/jpeg;base64,${qrCodeBase64}`} 
                    alt="QR Code Pix" 
                    className="w-48 h-48 mx-auto object-contain"
                  />
                </div>
                <p className="text-xs text-slate-400">
                  Escaneie o QR Code acima com o aplicativo do seu banco ou use o Pix Copia e Cola.
                </p>

                <div 
                  onClick={copiarChavePix}
                  className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono text-amber-400 truncate cursor-pointer hover:border-amber-500 transition"
                  title="Clique para copiar"
                >
                  {pixCopiaECola}
                </div>

                <button
                  onClick={copiarChavePix}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 rounded-xl text-sm transition cursor-pointer"
                >
                  {copiado ? '✅ Chave Pix Copiada!' : '📋 Copiar Código Pix'}
                </button>

                <div className="animate-pulse text-xs text-emerald-400 font-semibold pt-1">
                  ⚡ Assim que o pagamento for aprovado, seu voto entra no ar automaticamente!
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}