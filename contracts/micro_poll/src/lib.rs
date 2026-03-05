#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, vec, Address, Env, String, Vec,
};

#[contract]
pub struct MicroPoll;

#[contracttype]
pub enum DataKey {
    Poll(u64),
    UserVote(Address, u64),
    PollCount,
    Admin,
    Claimed(Address, u64),
}

#[contracttype]
#[derive(Clone)]
pub struct Poll {
    pub id: u64,
    pub creator: Address,
    pub question: String,
    pub options: Vec<String>,
    pub votes: Vec<u64>,
    pub reward_pool: i128,
    pub deadline: u64,
    pub is_closed: bool,
    pub voter_count: u64,
}

#[contracterror]
#[derive(Clone, Copy, PartialEq, Eq)]
pub enum PollError {
    NotInitialized = 1,
    PollNotFound = 2,
    PollClosed = 3,
    DeadlinePassed = 4,
    AlreadyVoted = 5,
    InvalidOption = 6,
    InvalidOptions = 7,
    Unauthorized = 8,
    RewardAlreadyClaimed = 9,
}

#[contractimpl]
impl MicroPoll {
    pub fn initialize(env: Env, admin: Address) -> Result<(), PollError> {
        if env
            .storage()
            .instance()
            .get::<_, Address>(&DataKey::Admin)
            .is_some()
        {
            return Err(PollError::NotInitialized);
        }

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::PollCount, &0u64);

        Ok(())
    }

    pub fn create_poll(
        env: Env,
        creator: Address,
        question: String,
        options: Vec<String>,
        reward_pool: i128,
        duration_seconds: u64,
    ) -> Result<u64, PollError> {
        creator.require_auth();

        let option_count = options.len();
        if option_count < 2 || option_count > 4 {
            return Err(PollError::InvalidOptions);
        }

        if reward_pool <= 0 {
            return Err(PollError::InvalidOptions);
        }

        let poll_count: u64 = env
            .storage()
            .instance()
            .get(&DataKey::PollCount)
            .unwrap_or(0);

        let mut votes: Vec<u64> = Vec::new(&env);
        for _ in 0..option_count {
            votes.push_back(0);
        }

        let deadline = env.ledger().timestamp() + duration_seconds;

        let poll = Poll {
            id: poll_count,
            creator: creator.clone(),
            question: question.clone(),
            options: options.clone(),
            votes,
            reward_pool,
            deadline,
            is_closed: false,
            voter_count: 0,
        };

        let key = DataKey::Poll(poll_count);
        env.storage().persistent().set(&key, &poll);
        env.storage().persistent().extend_ttl(&key, 100, 100);

        env.storage()
            .instance()
            .set(&DataKey::PollCount, &(poll_count + 1));

        Ok(poll_count)
    }

    pub fn vote(env: Env, user: Address, poll_id: u64, option_index: u32) -> Result<(), PollError> {
        user.require_auth();

        let key = DataKey::Poll(poll_id);
        let mut poll = env
            .storage()
            .persistent()
            .get::<_, Poll>(&key)
            .ok_or(PollError::PollNotFound)?;

        if poll.is_closed {
            return Err(PollError::PollClosed);
        }

        if env.ledger().timestamp() >= poll.deadline {
            return Err(PollError::DeadlinePassed);
        }

        let vote_key = DataKey::UserVote(user.clone(), poll_id);
        if env
            .storage()
            .persistent()
            .get::<_, bool>(&vote_key)
            .is_some()
        {
            return Err(PollError::AlreadyVoted);
        }

        let option_count = poll.options.len() as u32;
        if option_index >= option_count {
            return Err(PollError::InvalidOption);
        }

        let current_votes = poll.votes.get(option_index).unwrap_or(0);
        poll.votes.set(option_index, current_votes + 1);
        poll.voter_count += 1;

        env.storage().persistent().set(&key, &poll);
        env.storage().persistent().extend_ttl(&key, 100, 100);

        env.storage().persistent().set(&vote_key, &true);
        env.storage().persistent().extend_ttl(&vote_key, 100, 100);

        Ok(())
    }

    pub fn close_poll(env: Env, caller: Address, poll_id: u64) -> Result<(), PollError> {
        caller.require_auth();

        let key = DataKey::Poll(poll_id);
        let mut poll = env
            .storage()
            .persistent()
            .get::<_, Poll>(&key)
            .ok_or(PollError::PollNotFound)?;

        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(PollError::NotInitialized)?;

        if caller != poll.creator && caller != admin {
            return Err(PollError::Unauthorized);
        }

        poll.is_closed = true;

        env.storage().persistent().set(&key, &poll);
        env.storage().persistent().extend_ttl(&key, 100, 100);

        Ok(())
    }

    pub fn claim_reward(env: Env, user: Address, poll_id: u64) -> Result<i128, PollError> {
        user.require_auth();

        let key = DataKey::Poll(poll_id);
        let poll = env
            .storage()
            .persistent()
            .get::<_, Poll>(&key)
            .ok_or(PollError::PollNotFound)?;

        if !poll.is_closed {
            return Err(PollError::PollClosed);
        }

        let vote_key = DataKey::UserVote(user.clone(), poll_id);
        if env
            .storage()
            .persistent()
            .get::<_, bool>(&vote_key)
            .is_none()
        {
            return Err(PollError::Unauthorized);
        }

        let claimed_key = DataKey::Claimed(user.clone(), poll_id);
        if env
            .storage()
            .persistent()
            .get::<_, bool>(&claimed_key)
            .is_some()
        {
            return Err(PollError::RewardAlreadyClaimed);
        }

        let share = poll.reward_pool / poll.voter_count as i128;

        env.storage().persistent().set(&claimed_key, &true);
        env.storage()
            .persistent()
            .extend_ttl(&claimed_key, 100, 100);

        Ok(share)
    }

    pub fn get_poll(env: Env, poll_id: u64) -> Result<Poll, PollError> {
        let key = DataKey::Poll(poll_id);
        env.storage()
            .persistent()
            .get::<_, Poll>(&key)
            .ok_or(PollError::PollNotFound)
    }

    pub fn get_poll_count(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::PollCount)
            .unwrap_or(0)
    }

    pub fn has_voted(env: Env, user: Address, poll_id: u64) -> bool {
        let key = DataKey::UserVote(user, poll_id);
        env.storage().persistent().get::<_, bool>(&key).is_some()
    }
}
