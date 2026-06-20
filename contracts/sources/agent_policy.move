module sui_jarvis_policy::agent_policy {
    use sui::event;
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    const E_NOT_OWNER: u64 = 1;
    const E_NOT_AGENT: u64 = 2;
    const E_PAUSED: u64 = 3;
    const E_AMOUNT_LIMIT: u64 = 4;
    const E_DAILY_LIMIT: u64 = 5;

    public struct Policy has key {
        id: UID,
        owner: address,
        agent: address,
        max_per_action_mist: u64,
        daily_limit_mist: u64,
        spent_today_mist: u64,
        paused: bool
    }

    public struct PolicyCreated has copy, drop {
        owner: address,
        agent: address,
        max_per_action_mist: u64,
        daily_limit_mist: u64
    }

    public struct PolicyPaused has copy, drop {
        owner: address,
        paused: bool
    }

    public struct ActionRecorded has copy, drop {
        agent: address,
        amount_mist: u64,
        intent_hash: vector<u8>,
        receipt_hash: vector<u8>
    }

    entry fun create_policy(
        agent: address,
        max_per_action_mist: u64,
        daily_limit_mist: u64,
        ctx: &mut TxContext
    ) {
        let owner = tx_context::sender(ctx);
        let policy = Policy {
            id: object::new(ctx),
            owner,
            agent,
            max_per_action_mist,
            daily_limit_mist,
            spent_today_mist: 0,
            paused: false
        };

        event::emit(PolicyCreated {
            owner,
            agent,
            max_per_action_mist,
            daily_limit_mist
        });

        transfer::share_object(policy);
    }

    entry fun pause(policy: &mut Policy, ctx: &TxContext) {
        assert!(tx_context::sender(ctx) == policy.owner, E_NOT_OWNER);
        policy.paused = true;
        event::emit(PolicyPaused { owner: policy.owner, paused: true });
    }

    entry fun unpause(policy: &mut Policy, ctx: &TxContext) {
        assert!(tx_context::sender(ctx) == policy.owner, E_NOT_OWNER);
        policy.paused = false;
        event::emit(PolicyPaused { owner: policy.owner, paused: false });
    }

    entry fun reset_spent_today(policy: &mut Policy, ctx: &TxContext) {
        assert!(tx_context::sender(ctx) == policy.owner, E_NOT_OWNER);
        policy.spent_today_mist = 0;
    }

    entry fun record_action(
        policy: &mut Policy,
        amount_mist: u64,
        intent_hash: vector<u8>,
        receipt_hash: vector<u8>,
        ctx: &TxContext
    ) {
        assert!(tx_context::sender(ctx) == policy.agent, E_NOT_AGENT);
        assert!(!policy.paused, E_PAUSED);
        assert!(amount_mist <= policy.max_per_action_mist, E_AMOUNT_LIMIT);
        assert!(policy.spent_today_mist + amount_mist <= policy.daily_limit_mist, E_DAILY_LIMIT);

        policy.spent_today_mist = policy.spent_today_mist + amount_mist;

        event::emit(ActionRecorded {
            agent: tx_context::sender(ctx),
            amount_mist,
            intent_hash,
            receipt_hash
        });
    }
}
