import { ethers } from "ethers";
import contractABI from "../abi/EthosLog.json";

const CONTRACT_ADDRESS = "0x789670067677764B532007e0682ba7D4a066264f";
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

// Función privada interna para la subida
const _uploadToIPFS = async (content) => {
    const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${PINATA_JWT.trim()}`
        },
        body: JSON.stringify({
            pinataContent: { text: content, date: new Date().toISOString() },
            pinataMetadata: { name: "EthosLogPost" }
        })
    });
    if (!response.ok) throw new Error("Fallo al subir al Oráculo (Pinata)");
    const resData = await response.json();
    return resData.IpfsHash;
};

export const publishPost = async (content) => {
    if (!window.ethereum) throw new Error("Wallet no detectada");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
    const fee = ethers.parseEther("0.0004");

    try {
        // --- PASO 1: SIMULACIÓN DE SEGURIDAD ---
        // Esto le pide a MetaMask que verifique saldo y conexión.
        // Si el usuario cancela AQUÍ, el proceso se corta y NADA sube a Pinata.
        await contract.publishEntry.estimateGas("placeholder", { value: fee });

        // --- PASO 2: SUBIDA A IPFS ---
        // Solo llegamos aquí si el paso 1 fue aceptado por el usuario
        const ipfsHash = await _uploadToIPFS(content);

        // --- PASO 3: TRANSACCIÓN FINAL ---
        const tx = await contract.publishEntry(ipfsHash, { value: fee });
        await tx.wait();
        return ipfsHash;

    } catch (error) {
        if (error.code === 'ACTION_REJECTED') {
            throw new Error("Transacción cancelada. El pergamino permanece limpio.");
        }
        if (error.message.includes("insufficient funds")) {
            throw new Error("Tributo insuficiente en tu bolsa de ETH.");
        }
        throw new Error(error.reason || error.message);
    }
};

export const fetchSinglePost = async (cid) => {
    const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
    if (!response.ok) throw new Error("No recuperado");
    const data = await response.json();
    return { text: data.text, date: data.date };
};