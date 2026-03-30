import { ethers } from 'ethers';

export const CONTRACT_CONFIG = {
  address: '0x146F85AAa295663335933eE03d96D0d290C9eEab',
  abi: [
    'function placeBet(uint256 matchId) external payable',
    'function settleBet(uint256 matchId, address payable winner, address payable loser) external',
    'function refund(uint256 matchId) external',
    'function getMatch(uint256 matchId) external view returns (tuple(address player1, address player2, uint256 amount1, uint256 amount2, uint256 betTime, bool settled))',
    'function commissionWallet() external view returns (address)',
    'event BetPlaced(uint256 indexed matchId, address indexed player, uint256 amount)',
    'event BetSettled(uint256 indexed matchId, address indexed winner, address indexed loser, uint256 pot, uint256 winnerPayout, uint256 commission)',
    'event Refunded(uint256 indexed matchId, address indexed player, uint256 amount)',
  ],
  network: {
    chainId: '0xaa36a7',
    chainName: 'Sepolia Test Network',
    rpcUrls: ['https://rpc.sepolia.org'],
    nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
    blockExplorerUrls: ['https://sepolia.etherscan.io/'],
  },
};

// Convert MongoDB ObjectId string to uint256
function matchIdToUint256(matchId: string): bigint {
  const hex = matchId.replace(/[^0-9a-fA-F]/g, '').padEnd(64, '0').slice(0, 64);
  return BigInt('0x' + hex);
}

export class ContractService {
  private contract: ethers.Contract | null = null;

  private getEthereum() {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask is not installed');
    }
    return window.ethereum;
  }

  async ensureSepoliaNetwork(): Promise<void> {
    const ethereum = this.getEthereum();
    const provider = new ethers.BrowserProvider(ethereum);
    const network = await provider.getNetwork();
    const sepoliaChainId = BigInt(parseInt(CONTRACT_CONFIG.network.chainId, 16));
    if (network.chainId !== sepoliaChainId) {
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: CONTRACT_CONFIG.network.chainId }],
        });
      } catch (error: any) {
        if (error.code === 4902) {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [CONTRACT_CONFIG.network],
          });
        } else {
          throw error;
        }
      }
    }
  }

  private async getContract(): Promise<ethers.Contract> {
    await this.ensureSepoliaNetwork();
    const provider = new ethers.BrowserProvider(this.getEthereum());
    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACT_CONFIG.address, CONTRACT_CONFIG.abi, signer);
  }

  async placeBet(matchId: string, amount: string): Promise<string> {
    const contract = await this.getContract();
    const numericId = matchIdToUint256(matchId);
    const tx = await contract.placeBet(numericId, { value: ethers.parseEther(amount) });
    await tx.wait();
    return tx.hash;
  }

  async getMatch(matchId: string): Promise<{
    player1: string;
    player2: string;
    amount1: bigint;
    amount2: bigint;
    betTime: bigint;
    settled: boolean;
  }> {
    const contract = await this.getContract();
    return await contract.getMatch(matchIdToUint256(matchId));
  }

  async settleBet(matchId: string, winner: string, loser: string): Promise<string> {
    const contract = await this.getContract();
    const tx = await contract.settleBet(matchIdToUint256(matchId), winner, loser);
    await tx.wait();
    return tx.hash;
  }

  async refund(matchId: string): Promise<string> {
    const contract = await this.getContract();
    const tx = await contract.refund(matchIdToUint256(matchId));
    await tx.wait();
    return tx.hash;
  }

  async getBalance(address: string): Promise<string> {
    const provider = new ethers.BrowserProvider(this.getEthereum());
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  onBetPlaced(callback: (matchId: string, player: string, amount: string) => void): void {
    if (!this.contract) return;
    this.contract.on('BetPlaced', (matchId, player, amount) => {
      callback(matchId.toString(), player, ethers.formatEther(amount));
    });
  }

  onBetSettled(callback: (matchId: string, winner: string, loser: string, pot: string, winnerPayout: string, commission: string) => void): void {
    if (!this.contract) return;
    this.contract.on('BetSettled', (matchId, winner, loser, pot, winnerPayout, commission) => {
      callback(matchId.toString(), winner, loser, ethers.formatEther(pot), ethers.formatEther(winnerPayout), ethers.formatEther(commission));
    });
  }

  removeAllListeners(): void {
    this.contract?.removeAllListeners();
  }
}

export const contractService = new ContractService();
