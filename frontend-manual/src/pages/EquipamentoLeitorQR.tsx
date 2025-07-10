import React, { useState } from "react";
import BarcodeScanner from "react-qr-barcode-scanner";

const EquipamentoLeitorQR: React.FC<{ onEncontrar?: (id: string) => void }> = ({ onEncontrar }) => {
  const [data, setData] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const handleScan = (result: any) => {
    if (result && result.text) {
      setData(result.text);
      setErro(null);
      // Extrair o ID do equipamento do link
      const match = result.text.match(/equipamentos\/(\d+)/);
      if (match) {
        const id = match[1];
        if (onEncontrar) onEncontrar(id);
        else window.location.href = `/equipamento/${id}`;
      }
    }
  };

  const handleError = (err: any) => {
    setErro("Erro ao acessar a câmera ou ler QR Code");
  };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", textAlign: "center" }}>
      <h2>Leitor de QR Code de Equipamento</h2>
      <BarcodeScanner
        width={350}
        height={350}
        facingMode="environment"
        onUpdate={(err, result) => {
          if (result) handleScan(result);
          if (err) handleError(err);
        }}
      />
      {data && <div style={{ marginTop: 16 }}>QR lido: {data}</div>}
      {erro && <div style={{ color: "red", marginTop: 16 }}>{erro}</div>}
    </div>
  );
};

export default EquipamentoLeitorQR; 