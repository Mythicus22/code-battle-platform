module code_battle::betting {
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use std::signer;

    // Platform fee basis points (10 = 0.1%)
    const FEE_BPS: u64 = 10;
    const MAX_BPS: u64 = 10000;

    struct Match has key {
        player1: address,
        player2: address,
        bet_amount: u64,
        pot: u64,
        active: bool,
    }

    public entry function init_match(
        player1: &signer,
        player2_addr: address,
        bet_amount: u64
    ) {
        let player1_addr = signer::address_of(player1);
        
        // Player 1 deposits bet amount
        let coins = coin::withdraw<AptosCoin>(player1, bet_amount);
        // We'd typically store this in a resource account or a pool, 
        // but for simplicity in this demo we assume the platform handles escrows via multisig
        // or a shared pool. Here we just burn it or transfer to a platform hold address.
        // For a true escrow, we'd use a resource account.
        
        // This is a simplified scaffold
        // A production contract would use `aptos_framework::resource_account` 
        // to hold funds securely until `settle_match` is called.
    }

    public entry function settle_match(
        platform: &signer,
        winner: address,
        pot_amount: u64
    ) {
        // Platform takes 0.1% fee
        let fee = (pot_amount * FEE_BPS) / MAX_BPS;
        let payout = pot_amount - fee;

        // Transfer payout to winner, fee to platform
        // (Requires the platform to be holding the pot in its wallet)
        coin::transfer<AptosCoin>(platform, winner, payout);
    }
}
