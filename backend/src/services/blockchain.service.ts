import { ethers } from 'ethers';

const CONTRACT_CONFIG = {
  address: '0x146F85AAa295663335933eE03d96D0d290C9eEab',
  abi: [
    'function settleBet(uint256 matchId, address payable winner, address payable loser) external',
    'function getMatch(uint256 matchId) external view returns (tuple(address player1, address player2, uint256 amount1, uint256 amount2, uint256 betTime, bool settled))',
    'event BetSettled(uint256 indexed matchId, address indexed winner, address indexed loser, uint256 pot, uint256 winnerPayout, uint256 commission)',
  ],
  network: {
    chainId: 11155111,
    rpcUrl: process.env.SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/',
  },
};

export class BlockchainService {
  private provider: ethers.JsonRpcProvider | null = null;
  private contract: ethers.Contract | null = null;
  private wallet: ethers.Wallet | null = null;
  private initialized = false;

  private init(): void {
    if (this.initialized) return;
    const privateKey = process.env.COMMISSION_WALLET_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('COMMISSION_WALLET_PRIVATE_KEY not set in environment variables');
    }
    this.provider = new ethers.JsonRpcProvider(CONTRACT_CONFIG.network.rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    this.contract = new ethers.Contract(CONTRACT_CONFIG.address, CONTRACT_CONFIG.abi, this.wallet);
    this.initialized = true;
  }

  async settleBet(matchId: string, winnerAddress: string, loserAddress: string): Promise<string> {
    this.init();
    if (!ethers.isAddress(winnerAddress) || !ethers.isAddress(loserAddress)) {
      throw new Error('Invalid wallet addresses');
    }
    const matchData = await this.contract!.getMatch(matchId);
    if (matchData.settled) throw new Error('Bet already settled');
    if (
      matchData.player1 === '0x0000000000000000000000000000000000000000' ||
      matchData.player2 === '0x0000000000000000000000000000000000000000'
    ) {
      throw new Error('Both players must have placed bets');
    }
    const p1 = matchData.player1.toLowerCase();
    const p2 = matchData.player2.toLowerCase();
    const w = winnerAddress.toLowerCase();
    const l = loserAddress.toLowerCase();
    if (!((w === p1 && l === p2) || (w === p2 && l === p1))) {
      throw new Error('Winner and loser must be the actual players in the match');
    }
    const tx = await this.contract!.settleBet(matchId, winnerAddress, loserAddress);
    const receipt = await tx.wait();
    console.log(`Settlement confirmed in block: ${receipt.blockNumber}`);
    return tx.hash;
  }

  async getMatchData(matchId: string) {
    this.init();
    const matchData = await this.contract!.getMatch(matchId);
    return {
      player1: matchData.player1,
      player2: matchData.player2,
      amount1: ethers.formatEther(matchData.amount1),
      amount2: ethers.formatEther(matchData.amount2),
      betTime: Number(matchData.betTime),
      settled: matchData.settled,
    };
  }

  async hasCryptoBets(matchId: string): Promise<boolean> {
    try {
      const matchData = await this.getMatchData(matchId);
      return parseFloat(matchData.amount1) > 0 && parseFloat(matchData.amount2) > 0;
    } catch {
      return false;
    }
  }

  getCommissionWallet(): string {
    this.init();
    return this.wallet!.address;
  }

  onBetSettled(
    callback: (
      matchId: string,
      winner: string,
      loser: string,
      pot: string,
      winnerPayout: string,
      commission: string
    ) => void
  ) {
    this.init();
    this.contract!.on('BetSettled', (matchId: any, winner: any, loser: any, pot: any, winnerPayout: any, commission: any) => {
      callback(
        matchId.toString(),
        winner,
        loser,
        ethers.formatEther(pot),
        ethers.formatEther(winnerPayout),
        ethers.formatEther(commission)
      );
    });
  }

  removeAllListeners() {
    this.contract?.removeAllListeners();
  }
}

export const blockchainService = new BlockchainService();
