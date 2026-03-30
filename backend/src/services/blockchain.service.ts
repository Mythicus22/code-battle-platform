import { ethers } from 'ethers';

const CONTRACT_ABI = [
  'function placeBet(uint256 matchId) external payable',
  'function settleBet(uint256 matchId, address payable winner, address payable loser) external',
  'function refund(uint256 matchId) external',
  'function getMatch(uint256 matchId) external view returns (tuple(address player1, address player2, uint256 amount1, uint256 amount2, uint256 betTime, bool settled))',
  'function commissionWallet() external view returns (address)',
  'event BetPlaced(uint256 indexed matchId, address indexed player, uint256 amount)',
  'event BetSettled(uint256 indexed matchId, address indexed winner, address indexed loser, uint256 pot, uint256 winnerPayout, uint256 commission)',
  'event Refunded(uint256 indexed matchId, address indexed player, uint256 amount)',
];

// Convert MongoDB ObjectId string to uint256
function matchIdToUint256(matchId: string): bigint {
  const hex = matchId.replace(/[^0-9a-fA-F]/g, '').padEnd(64, '0').slice(0, 64);
  return BigInt('0x' + hex);
}

export class BlockchainService {
  private provider: ethers.JsonRpcProvider | null = null;
  private contract: ethers.Contract | null = null;
  private wallet: ethers.Wallet | null = null;
  private initialized = false;

  private init(): void {
    if (this.initialized) return;

    const privateKey = process.env.COMMISSION_WALLET_PRIVATE_KEY;
    if (!privateKey) throw new Error('COMMISSION_WALLET_PRIVATE_KEY not set');

    const contractAddress = process.env.CONTRACT_ADDRESS;
    if (!contractAddress) throw new Error('CONTRACT_ADDRESS not set');

    // Use configured RPC URL; fall back to public Sepolia RPC
    const rpcUrl = process.env.SEPOLIA_RPC_URL || 'https://rpc.sepolia.org';

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    this.contract = new ethers.Contract(contractAddress, CONTRACT_ABI, this.wallet);
    this.initialized = true;
  }

  async settleBet(matchId: string, winnerAddress: string, loserAddress: string): Promise<string> {
    this.init();
    if (!ethers.isAddress(winnerAddress) || !ethers.isAddress(loserAddress)) {
      throw new Error('Invalid wallet addresses');
    }

    const numericMatchId = matchIdToUint256(matchId);
    const matchData = await this.contract!.getMatch(numericMatchId);

    if (matchData.settled) throw new Error('Bet already settled');
    if (matchData.player1 === ethers.ZeroAddress || matchData.player2 === ethers.ZeroAddress) {
      throw new Error('Both players must have placed bets on-chain first');
    }

    const p1 = matchData.player1.toLowerCase();
    const p2 = matchData.player2.toLowerCase();
    const w = winnerAddress.toLowerCase();
    const l = loserAddress.toLowerCase();

    if (!((w === p1 && l === p2) || (w === p2 && l === p1))) {
      throw new Error('Winner/loser addresses do not match contract players');
    }

    const tx = await this.contract!.settleBet(numericMatchId, winnerAddress, loserAddress);
    const receipt = await tx.wait();
    console.log(`Bet settled in block ${receipt.blockNumber}, tx: ${tx.hash}`);
    return tx.hash;
  }

  async getMatchData(matchId: string) {
    this.init();
    const numericMatchId = matchIdToUint256(matchId);
    const matchData = await this.contract!.getMatch(numericMatchId);
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
      const data = await this.getMatchData(matchId);
      return parseFloat(data.amount1) > 0 && parseFloat(data.amount2) > 0;
    } catch {
      return false;
    }
  }

  getCommissionWallet(): string {
    this.init();
    return this.wallet!.address;
  }
}

export const blockchainService = new BlockchainService();
