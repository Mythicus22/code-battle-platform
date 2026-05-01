import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

export interface AptosAccount {
  address: string;
  publicKey: string;
}

export function useAptos() {
  const [account, setAccount] = useState<AptosAccount | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkConnection = useCallback(async () => {
    try {
      const aptos = (window as any).petra || (window as any).aptos;
      if (!aptos) {
        setLoading(false);
        return;
      }

      const currentAccount = await aptos.account();
      if (currentAccount) {
        setAccount(currentAccount);
        setConnected(true);
      }
    } catch (err) {
      console.error('Check connection error', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkConnection();
    
    // Listen for events if Petra supports them
    const aptos = (window as any).petra || (window as any).aptos;
    if (aptos) {
      aptos.onAccountChange?.((newAccount: AptosAccount) => {
        if (newAccount) {
          setAccount(newAccount);
          setConnected(true);
        } else {
          setAccount(null);
          setConnected(false);
        }
      });
      aptos.onNetworkChange?.(() => {
        // Handle network change
      });
    }
  }, [checkConnection]);

  const connect = async () => {
    const aptos = (window as any).petra || (window as any).aptos;
    if (!aptos) {
      toast.error('Petra Wallet is not installed!');
      window.open('https://petra.app/', '_blank');
      return null;
    }

    try {
      setLoading(true);
      const response = await aptos.connect();
      setAccount(response);
      setConnected(true);
      toast.success('Wallet connected successfully!');
      return response.address;
    } catch (err: any) {
      console.error('Connection error', err);
      toast.error(err.message || 'Failed to connect wallet');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const disconnect = async () => {
    const aptos = (window as any).petra || (window as any).aptos;
    if (aptos) {
      try {
        await aptos.disconnect();
        setAccount(null);
        setConnected(false);
        toast.success('Wallet disconnected');
      } catch (err: any) {
        console.error('Disconnect error', err);
      }
    }
  };

  return { account, connected, loading, connect, disconnect };
}
