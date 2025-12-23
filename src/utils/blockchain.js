import { ethers } from "ethers";
import contractABI from "../abi/EthosLog.json";

// 1. NUEVA DIRECCIÓN DEL CONTRATO (BASE MAINNET)
const CONTRACT_ADDRESS = "0xFBB2650584557ABA32c7239A10b6439E27287FEe"; 
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

// 2. CONFIGURACIÓN DE RED BASE
const BASE_CHAIN_ID = "0x2105"; // 8453 en hexadecimal

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

    // --- PASO 0: FORZAR CAMBIO A RED BASE ---
    const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (currentChainId !== BASE_CHAIN_ID) {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: BASE_CHAIN_ID }],
            });
        } catch (switchError) {
            // Si la red no está agregada en MetaMask, la agregamos automáticamente
            if (switchError.code === 4902) {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: BASE_CHAIN_ID,
                        chainName: 'Base Mainnet',
                        nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                        rpcUrls: ['https://mainnet.base.org'],
                        blockExplorerUrls: ['https://basescan.org']
                    }],
                });
            } else {
                throw new Error("Por favor, cambia a la red Base Mainnet");
            }
        }
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
    
    // Bajamos el fee a 0.0001 ETH (aprox 0.30 USD) acorde a la eficiencia de Base
    const fee = ethers.parseEther("0.0001"); 

    try {
        // --- PASO 1: SIMULACIÓN EN BASE ---
        await contract.publishEntry.estimateGas("placeholder", { value: fee });

        // --- PASO 2: SUBIDA A IPFS ---
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
            throw new Error("Tributo insuficiente en tu bolsa de ETH de BASE.");
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