import { ethers } from "ethers";
import contractABI from "../abi/EthosLog.json";

// 1. CONFIGURACIÓN
const CONTRACT_ADDRESS = "0xFBB2650584557ABA32c7239A10b6439E27287FEe"; 
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;
const BASE_CHAIN_ID = "0x2105"; // 8453 en hexadecimal (Base Mainnet)

// Función interna para subir a IPFS
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
    // 🔍 SEGURO DE VERSIÓN: Si ves este alert, el código es el correcto.
    alert("INICIANDO CONEXIÓN MANUAL CON BASE... (V. FINAL)");

    if (!window.ethereum) throw new Error("Wallet no detectada");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    // Verificación de Red
    const network = await provider.getNetwork();
    if (network.chainId !== 8453n) {
        try {
            await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: BASE_CHAIN_ID }],
            });
        } catch (e) {
            throw new Error("Por favor, cambia tu billetera a la red BASE MAINNET.");
        }
    }

    const fee = ethers.parseEther("0.0004"); 

    try {
        // --- PASO 1: SUBIDA A IPFS ---
        const ipfsHash = await _uploadToIPFS(content);

        // --- PASO 2: GENERACIÓN MANUAL DE DATOS (Anti-Caché) ---
        // Esto garantiza que el campo "data" de la transacción NO vaya vacío
        const iface = new ethers.Interface(contractABI);
        const encodedData = iface.encodeFunctionData("publishEntry", [ipfsHash]);

        // --- PASO 3: TRANSACCIÓN DIRECTA ---
        const tx = await signer.sendTransaction({
            to: CONTRACT_ADDRESS,
            data: encodedData,  // Inyectamos el hash de la función manualmente
            value: fee,
            gasLimit: 150000    // Margen de seguridad para Base
        });
        
        console.log("Transacción enviada:", tx.hash);
        await tx.wait();
        return ipfsHash;

    } catch (error) {
        console.error("Detalle del error:", error);
        if (error.code === 'ACTION_REJECTED') {
            throw new Error("Transacción cancelada por el usuario.");
        }
        throw new Error(error.reason || error.message || "Error desconocido en la blockchain");
    }
};

export const fetchSinglePost = async (cid) => {
    try {
        const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
        if (!response.ok) throw new Error("No se pudo obtener el pergamino.");
        return await response.json();
    } catch (error) {
        throw new Error("Error al consultar el Oráculo IPFS.");
    }
};