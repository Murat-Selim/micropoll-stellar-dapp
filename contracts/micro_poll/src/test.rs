#![no_std]

use soroban_sdk::{vec, Address, Env, String, Vec};

#[cfg(feature = "testutils")]
mod test {
    use soroban_sdk::{testutils::Address as _, vec, Address, Env, String, Vec};

    use crate::{MicroPoll, PollError};

    #[test]
    fn test_initialize() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(MicroPoll, ());
        let client = crate::Client::new(&env, &contract_id);

        let admin = Address::generate(&env);
        client.initialize(&admin).unwrap();

        let result = client.initialize(&admin);
        assert!(result.is_err());
    }

    #[test]
    fn test_create_poll() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(MicroPoll, ());
        let client = crate::Client::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let creator = Address::generate(&env);

        client.initialize(&admin).unwrap();

        let question = String::from_slice(&env, "Test poll?");
        let options = vec![
            &env,
            String::from_slice(&env, "Yes"),
            String::from_slice(&env, "No"),
        ];

        let poll_id = client
            .create_poll(&creator, &question, &options, &100_000_000i128, &3600)
            .unwrap();

        assert_eq!(poll_id, 0);
        assert_eq!(client.get_poll_count(), 1);
    }

    #[test]
    fn test_create_poll_invalid_options() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(MicroPoll, ());
        let client = crate::Client::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let creator = Address::generate(&env);

        client.initialize(&admin).unwrap();

        let question = String::from_slice(&env, "Test?");

        // Tek seçenek - hata
        let options = vec![&env, String::from_slice(&env, "Only one")];
        let result = client.create_poll(&creator, &question, &options, &100_000_000i128, &3600);
        assert!(result.is_err());

        // 5 seçenek - hata
        let options = vec![
            &env,
            String::from_slice(&env, "A"),
            String::from_slice(&env, "B"),
            String::from_slice(&env, "C"),
            String::from_slice(&env, "D"),
            String::from_slice(&env, "E"),
        ];
        let result = client.create_poll(&creator, &question, &options, &100_000_000i128, &3600);
        assert!(result.is_err());
    }

    #[test]
    fn test_vote() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(MicroPoll, ());
        let client = crate::Client::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let creator = Address::generate(&env);
        let voter = Address::generate(&env);

        client.initialize(&admin).unwrap();

        let question = String::from_slice(&env, "Test?");
        let options = vec![
            &env,
            String::from_slice(&env, "Yes"),
            String::from_slice(&env, "No"),
        ];

        let poll_id = client
            .create_poll(&creator, &question, &options, &100_000_000i128, &3600)
            .unwrap();

        client.vote(&voter, &poll_id, &0).unwrap();

        assert!(client.has_voted(&voter, &poll_id));
    }

    #[test]
    fn test_double_vote_fails() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(MicroPoll, ());
        let client = crate::Client::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let creator = Address::generate(&env);
        let voter = Address::generate(&env);

        client.initialize(&admin).unwrap();

        let question = String::from_slice(&env, "Test?");
        let options = vec![
            &env,
            String::from_slice(&env, "Yes"),
            String::from_slice(&env, "No"),
        ];

        let poll_id = client
            .create_poll(&creator, &question, &options, &100_000_000i128, &3600)
            .unwrap();

        client.vote(&voter, &poll_id, &0).unwrap();

        let result = client.vote(&voter, &poll_id, &1);
        assert!(result.is_err());
    }

    #[test]
    fn test_vote_after_deadline_fails() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(MicroPoll, ());
        let client = crate::Client::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let creator = Address::generate(&env);
        let voter = Address::generate(&env);

        client.initialize(&admin).unwrap();

        let question = String::from_slice(&env, "Test?");
        let options = vec![
            &env,
            String::from_slice(&env, "Yes"),
            String::from_slice(&env, "No"),
        ];

        let poll_id = client
            .create_poll(&creator, &question, &options, &100_000_000i128, &1)
            .unwrap();

        env.ledger().set_timestamp(2);

        let result = client.vote(&voter, &poll_id, &0);
        assert!(result.is_err());
    }

    #[test]
    fn test_close_poll() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(MicroPoll, ());
        let client = crate::Client::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let creator = Address::generate(&env);

        client.initialize(&admin).unwrap();

        let question = String::from_slice(&env, "Test?");
        let options = vec![
            &env,
            String::from_slice(&env, "Yes"),
            String::from_slice(&env, "No"),
        ];

        let poll_id = client
            .create_poll(&creator, &question, &options, &100_000_000i128, &3600)
            .unwrap();

        client.close_poll(&creator, &poll_id).unwrap();

        let poll = client.get_poll(&poll_id).unwrap();
        assert!(poll.is_closed);
    }

    #[test]
    fn test_claim_reward() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(MicroPoll, ());
        let client = crate::Client::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let creator = Address::generate(&env);
        let voter = Address::generate(&env);

        client.initialize(&admin).unwrap();

        let question = String::from_slice(&env, "Test?");
        let options = vec![
            &env,
            String::from_slice(&env, "Yes"),
            String::from_slice(&env, "No"),
        ];

        // 100 XLM = 1_000_000_000 stroops
        let poll_id = client
            .create_poll(&creator, &question, &options, &1_000_000_000i128, &3600)
            .unwrap();

        client.vote(&voter, &poll_id, &0).unwrap();

        let voter2 = Address::generate(&env);
        client.vote(&voter2, &poll_id, &1).unwrap();

        client.close_poll(&creator, &poll_id).unwrap();

        // Her biri 50 XLM = 500_000_000 stroops
        let reward = client.claim_reward(&voter, &poll_id).unwrap();
        assert_eq!(reward, 500_000_000i128);
    }
}
