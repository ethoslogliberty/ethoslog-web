import { ethers } from "ethers";
import contractABI from "../abi/EthosLog.json";

// 1. CONFIGURACIÓN DE BASE MAINNET
const CONTRACT_ADDRESS = "0xFBB2650584557ABA32c7239A10b6439E27287FEe"; 
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;
const BASE_CHAIN_ID_HEX = "0x2105"; 
const BASE_CHAIN_ID_DECIMAL = 8453n; 

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
    if (!response.ok) throw new Error("Fallo al subir a Pinata");
    const resData = await response.json();
    return resData.IpfsHash;
};

export const publishPost = async (content) => {
    // 🔍 SEGURO DE VERSIÓN V1000
    console.log("--- INICIANDO PROTOCOLO ORÁCULO V1000 ---");

    if (!window.ethereum) throw new Error("Wallet no detectada");

    const provider = new ethers.BrowserProvider(window.ethereum);
    
    // VERIFICACIÓN DE RED
    const network = await provider.getNetwork();
    if (network.chainId !== BASE_CHAIN_ID_DECIMAL) {
        await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: BASE_CHAIN_ID_HEX }],
        });
        window.location.reload();
        return;
    }

    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress(); // Dirección explícita

    try {
        // --- PASO 1: IPFS ---
        const ipfsHash = await _uploadToIPFS(content);
        console.log("IPFS Exitoso. CID:", ipfsHash);

        // --- PASO 2: CODIFICACIÓN DE DATOS ---
        // Usamos la interfaz para generar los bytes que el contrato espera recibir
        const iface = new ethers.Interface(contractABI);
        const encodedData = iface.encodeFunctionData("publishEntry", [ipfsHash]);
        
        console.log("BYTES GENERADOS PARA BASE:", encodedData);

        // CAMBIO EN PASO 3: ENVÍO MANUAL
const txParams = {
    to: CONTRACT_ADDRESS,
    from: userAddress,
    data: encodedData,
    // Usamos parseUnits para ser ultra precisos con los 18 decimales de ETH
    value: ethers.parseUnits("0.0004", "ether"), 
    // Bajamos un poco el gasLimit para que Base no se confunda, 100k es suficiente
    gasLimit: 100000 
};

        const tx = await signer.sendTransaction(txParams);
        
        console.log("Transacción enviada. Hash:", tx.hash);
        await tx.wait();
        return ipfsHash;

    } catch (error) {
        console.error("Detalle técnico del error:", error);
        if (error.code === 'ACTION_REJECTED') throw new Error("Cancelado por el usuario.");
        throw new Error(error.reason || error.message || "Fallo en la red Base");
    }
};

export const fetchSinglePost = async (cid) => {
    try {
        const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
        if (!response.ok) throw new Error("Cid no encontrado.");
        return await response.json();
    } catch (error) {
        throw new Error("Error al consultar el Oráculo.");
    }
};