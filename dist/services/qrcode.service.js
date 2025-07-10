"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEquipmentQRCode = generateEquipmentQRCode;
const qrcode_1 = __importDefault(require("qrcode"));
async function generateEquipmentQRCode(equipmentId) {
    // Pode ser só o ID, ou um link para o frontend
    const data = `https://seusistema.com/equipamentos/${equipmentId}`;
    return await qrcode_1.default.toDataURL(data); // retorna uma imagem base64
}
