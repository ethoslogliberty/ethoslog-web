import { ethers } from "ethers";
import contractABI from "../abi/EthosLog.json";

// 1. CONFIGURACIÓN DE BASE MAINNET
const CONTRACT_ADDRESS = "0xFBB2650584557ABA32c7239A10b6439E27287FEe"; 
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;
const BASE_CHAIN_ID_HEX = "0x2105"; // 8453 en hex para MetaMask
const BASE_CHAIN_ID_DECIMAL = 8453n; // 8453 como BigInt para Ethers v6

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
    // 🔍 SEGURO DE VERSIÓN
    alert("SISTEMA ORÁCULO V.FINAL - BASE MAINNET ACTIVADO");

    if (!window.ethereum) throw new Error("Instala MetaMask para continuar");

    const provider = new ethers.BrowserProvider(window.ethereum);
    
    // VERIFICACIÓN Y CAMBIO DE RED
    const network = await provider.getNetwork();
    if (network.chainId !== BASE_CHAIN_ID_DECIMAL) {
        try {
            await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: BASE_CHAIN_ID_HEX }],
            });
            // Forzamos recarga para limpiar el estado de la red y evitar NETWORK_ERROR
            window.location.reload();
            return;
        } catch (switchError) {
            // Si la red no está agregada en MetaMask, podrías intentar agregarla aquí
            throw new Error("Por favor, cambia a la red BASE MAINNET en tu billetera.");
        }
    }

    const signer = await provider.getSigner();
    const fee = ethers.parseEther("0.0004"); 

    try {
        // --- PASO 1: IPFS ---
        const ipfsHash = await _uploadToIPFS(content);

        // --- PASO 2: CODIFICACIÓN MANUAL (Evita el error data: "") ---
        const iface = new ethers.Interface(contractABI);
        const encodedData = iface.encodeFunctionData("publishEntry", [ipfsHash]);

        // --- PASO 3: ENVÍO DIRECTO ---
        const tx = await signer.sendTransaction({
            to: CONTRACT_ADDRESS,
            data: encodedData,  // Instrucciones explícitas para el contrato
            value: fee,
            gasLimit: 120000    // Suficiente para una escritura en Base
        });
        
        console.log("Transacción enviada:", tx.hash);
        await tx.wait();
        return ipfsHash;

    } catch (error) {
        console.error("Error técnico:", error);
        if (error.code === 'ACTION_REJECTED') throw new Error("Transacción cancelada.");
        throw new Error(error.reason || error.message || "Error en la red Base");
    }
};

export const fetchSinglePost = async (cid) => {
    try {
        const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
        if (!response.ok) throw new Error("Cid no encontrado en IPFS.");
        return await response.json();
    } catch (error) {
        throw new Error("Error al consultar el Oráculo.");
    }
};