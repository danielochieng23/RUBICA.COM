import React, { createContext, useState, useContext, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';

const Web3Context = createContext();

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (window.ethereum) {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(web3Provider);

      // Check if already connected
      checkConnection(web3Provider);

      // Listen for account changes
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const checkConnection = async (web3Provider) => {
    try {
      const accounts = await web3Provider.listAccounts();
      if (accounts.length > 0) {
        const web3Signer = web3Provider.getSigner();
        setSigner(web3Signer);
        setAccount(accounts[0]);
        setConnected(true);
        
        const network = await web3Provider.getNetwork();
        setChainId(network.chainId);
        
        const bal = await web3Provider.getBalance(accounts[0]);
        setBalance(ethers.utils.formatEther(bal));
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error('Please install MetaMask to use this application');
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length > 0) {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        const web3Signer = web3Provider.getSigner();
        
        setProvider(web3Provider);
        setSigner(web3Signer);
        setAccount(accounts[0]);
        setConnected(true);
        
        const network = await web3Provider.getNetwork();
        setChainId(network.chainId);
        
        const bal = await web3Provider.getBalance(accounts[0]);
        setBalance(ethers.utils.formatEther(bal));
        
        toast.success('Wallet connected successfully!');
      }
    } catch (error) {
      toast.error('Failed to connect wallet');
      console.error('Error connecting wallet:', error);
    }
  };

  const disconnectWallet = () => {
    setSigner(null);
    setAccount(null);
    setChainId(null);
    setBalance(null);
    setConnected(false);
    toast.info('Wallet disconnected');
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      setAccount(accounts[0]);
      updateBalance(accounts[0]);
    }
  };

  const handleChainChanged = (chainId) => {
    window.location.reload();
  };

  const updateBalance = async (address) => {
    if (provider) {
      const bal = await provider.getBalance(address);
      setBalance(ethers.utils.formatEther(bal));
    }
  };

  const signMessage = async (message) => {
    if (!signer) {
      throw new Error('No signer available');
    }
    return await signer.signMessage(message);
  };

  const value = {
    provider,
    signer,
    account,
    chainId,
    balance,
    connected,
    connectWallet,
    disconnectWallet,
    signMessage,
    updateBalance
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};