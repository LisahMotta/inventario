import QRCode from "qrcode";

export async function generateEquipmentQRCode(equipmentId: string) {
  // Pode ser só o ID, ou um link para o frontend
  const data = `https://seusistema.com/equipamentos/${equipmentId}`;
  return await QRCode.toDataURL(data); // retorna uma imagem base64
} 