#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, token,
    Address, Env, Symbol, Vec, Map, String
};

const VOTE_COUNT: Symbol = symbol_short!("vote_cnt");
const TOTAL_FUNDS: Symbol = symbol_short!("tot_fund");
const VOTER_RECORD: Symbol = symbol_short!("voter");

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct VotingOption {
    pub id: u32,
    pub name: String,
    pub recipient: Address,
    pub vote_count: u64,
    pub total_funds: i128,
}

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct VoteRecord {
    pub voter: Address,
    pub option_id: u32,
    pub amount: i128,
    pub timestamp: u64,
}

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub enum DataKey {
    VotingOption(u32),
    VoteRecord(u32), // vote record index
    VoteCount(u32),  // vote count for each option
    TotalFunds(u32), // total funds for each option
    VoterRecord(Address), // to track if user has voted
    Admin,
    TotalVotes,
    IsActive,
}

#[contract]
pub struct VotingContract;

#[contractimpl]
impl VotingContract {
    /// Initialize the voting contract
    pub fn initialize(
        env: Env,
        admin: Address,
        options: Vec<VotingOption>,
    ) -> Result<(), &'static str> {
        // Check if already initialized
        if env.storage().instance().has(&DataKey::Admin) {
            return Err("Already initialized");
        }

        // Set admin
        env.storage().instance().set(&DataKey::Admin, &admin);
        
        // Set contract as active
        env.storage().instance().set(&DataKey::IsActive, &true);
        
        // Initialize total votes counter
        env.storage().instance().set(&DataKey::TotalVotes, &0u32);

        // Store voting options
        for option in options.iter() {
            let option_key = DataKey::VotingOption(option.id);
            env.storage().persistent().set(&option_key, &option);
            
            // Initialize vote count and total funds for each option
            env.storage().persistent().set(&DataKey::VoteCount(option.id), &0u64);
            env.storage().persistent().set(&DataKey::TotalFunds(option.id), &0i128);
        }

        Ok(())
    }

    /// Cast a vote and send funds to the selected option
    pub fn vote(
        env: Env,
        voter: Address,
        option_id: u32,
        amount: i128,
        token_address: Address,
    ) -> Result<(), &'static str> {
        // Verify the voter
        voter.require_auth();

        // Check if voting is active
        let is_active: bool = env.storage()
            .instance()
            .get(&DataKey::IsActive)
            .unwrap_or(false);
        
        if !is_active {
            return Err("Voting is not active");
        }

        // Check if voter has already voted
        if env.storage().persistent().has(&DataKey::VoterRecord(voter.clone())) {
            return Err("Already voted");
        }

        // Validate amount
        if amount <= 0 {
            return Err("Amount must be positive");
        }

        // Get voting option
        let option_key = DataKey::VotingOption(option_id);
        let mut option: VotingOption = env.storage()
            .persistent()
            .get(&option_key)
            .ok_or("Invalid option ID")?;

        // Transfer tokens to the option recipient
        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(&voter, &option.recipient, &amount);

        // Update vote count
        let vote_count_key = DataKey::VoteCount(option_id);
        let current_votes: u64 = env.storage()
            .persistent()
            .get(&vote_count_key)
            .unwrap_or(0);
        env.storage().persistent().set(&vote_count_key, &(current_votes + 1));

        // Update total funds
        let total_funds_key = DataKey::TotalFunds(option_id);
        let current_funds: i128 = env.storage()
            .persistent()
            .get(&total_funds_key)
            .unwrap_or(0);
        env.storage().persistent().set(&total_funds_key, &(current_funds + amount));

        // Update option data
        option.vote_count = current_votes + 1;
        option.total_funds = current_funds + amount;
        env.storage().persistent().set(&option_key, &option);

        // Record the vote
        let total_votes: u32 = env.storage()
            .instance()
            .get(&DataKey::TotalVotes)
            .unwrap_or(0);
        
        let vote_record = VoteRecord {
            voter: voter.clone(),
            option_id,
            amount,
            timestamp: env.ledger().timestamp(),
        };

        env.storage().persistent().set(&DataKey::VoteRecord(total_votes), &vote_record);
        env.storage().persistent().set(&DataKey::VoterRecord(voter), &option_id);
        env.storage().instance().set(&DataKey::TotalVotes, &(total_votes + 1));

        // Emit event
        env.events().publish(
            (symbol_short!("vote"), voter),
            (option_id, amount)
        );

        Ok(())
    }

    /// Get voting results for a specific option
    pub fn get_option_results(env: Env, option_id: u32) -> Option<VotingOption> {
        let option_key = DataKey::VotingOption(option_id);
        let mut option: VotingOption = env.storage().persistent().get(&option_key)?;
        
        // Update with current vote count and funds
        let vote_count: u64 = env.storage()
            .persistent()
            .get(&DataKey::VoteCount(option_id))
            .unwrap_or(0);
        let total_funds: i128 = env.storage()
            .persistent()
            .get(&DataKey::TotalFunds(option_id))
            .unwrap_or(0);
            
        option.vote_count = vote_count;
        option.total_funds = total_funds;
        
        Some(option)
    }

    /// Get all voting options with current results
    pub fn get_all_results(env: Env) -> Vec<VotingOption> {
        let mut results = Vec::new(&env);
        
        // In a real implementation, you'd iterate through stored option IDs
        // For this example, we'll check options 1, 2, 3
        for option_id in 1..=3u32 {
            if let Some(option) = Self::get_option_results(env.clone(), option_id) {
                results.push_back(option);
            }
        }
        
        results
    }

    /// Check if a user has voted
    pub fn has_voted(env: Env, voter: Address) -> bool {
        env.storage().persistent().has(&DataKey::VoterRecord(voter))
    }

    /// Get user's vote (returns option_id if voted)
    pub fn get_user_vote(env: Env, voter: Address) -> Option<u32> {
        env.storage().persistent().get(&DataKey::VoterRecord(voter))
    }

    /// Get total number of votes cast
    pub fn get_total_votes(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::TotalVotes).unwrap_or(0)
    }

    /// Admin function to toggle voting status
    pub fn toggle_voting(env: Env, admin: Address) -> Result<bool, &'static str> {
        admin.require_auth();
        
        let stored_admin: Address = env.storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or("Contract not initialized")?;
            
        if admin != stored_admin {
            return Err("Unauthorized");
        }

        let current_status: bool = env.storage()
            .instance()
            .get(&DataKey::IsActive)
            .unwrap_or(false);
            
        let new_status = !current_status;
        env.storage().instance().set(&DataKey::IsActive, &new_status);
        
        Ok(new_status)
    }

    /// Get voting status
    pub fn is_active(env: Env) -> bool {
        env.storage().instance().get(&DataKey::IsActive).unwrap_or(false)
    }

    /// Get vote record by index
    pub fn get_vote_record(env: Env, index: u32) -> Option<VoteRecord> {
        env.storage().persistent().get(&DataKey::VoteRecord(index))
    }

    /// Admin function to add a new voting option
    pub fn add_option(
        env: Env,
        admin: Address,
        option: VotingOption,
    ) -> Result<(), &'static str> {
        admin.require_auth();
        
        let stored_admin: Address = env.storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or("Contract not initialized")?;
            
        if admin != stored_admin {
            return Err("Unauthorized");
        }

        let option_key = DataKey::VotingOption(option.id);
        
        // Check if option already exists
        if env.storage().persistent().has(&option_key) {
            return Err("Option already exists");
        }

        // Store the new option
        env.storage().persistent().set(&option_key, &option);
        env.storage().persistent().set(&DataKey::VoteCount(option.id), &0u64);
        env.storage().persistent().set(&DataKey::TotalFunds(option.id), &0i128);

        Ok(())
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{
        testutils::{Address as _, Ledger, LedgerInfo},
        Address, Env, String,
    };

    #[test]
    fn test_voting_contract() {
        let env = Env::default();
        let contract_id = env.register_contract(None, VotingContract);
        let client = VotingContractClient::new(&env, &contract_id);

        // Create test addresses
        let admin = Address::generate(&env);
        let voter1 = Address::generate(&env);
        let recipient1 = Address::generate(&env);
        let recipient2 = Address::generate(&env);

        // Create voting options
        let mut options = Vec::new(&env);
        
        let option1 = VotingOption {
            id: 1,
            name: String::from_str(&env, "Option A"),
            recipient: recipient1.clone(),
            vote_count: 0,
            total_funds: 0,
        };
        
        let option2 = VotingOption {
            id: 2,
            name: String::from_str(&env, "Option B"),
            recipient: recipient2.clone(),
            vote_count: 0,
            total_funds: 0,
        };

        options.push_back(option1);
        options.push_back(option2);

        // Initialize contract
        client.initialize(&admin, &options);

        // Verify initialization
        assert!(client.is_active());
        assert_eq!(client.get_total_votes(), 0);

        // Test voting (Note: In real scenario, you'd need to set up token contract)
        // This is just to show the contract structure
        assert!(!client.has_voted(&voter1));
        
        // Get results
        let results = client.get_all_results();
        assert_eq!(results.len(), 2);
    }
}