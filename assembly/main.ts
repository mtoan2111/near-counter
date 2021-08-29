import { logging, PersistentMap, Context, PersistentVector } from "near-sdk-as";
import { UserHistory, CounterMode } from "./model";

// --- contract code goes below
let accountCounterMapped = new PersistentMap<String, i32>("c");
let accountCounterHistory = new PersistentMap<String, PersistentVector<UserHistory>>("h");

export function incrementCounter(value: i32): void {
    let oldCounter = value;
    logging.log("AccountId: " + Context.sender);
    if (accountCounterMapped.contains(Context.sender)) {
        oldCounter = accountCounterMapped.getSome(Context.sender);
        oldCounter = oldCounter + value;
        accountCounterMapped.set(Context.sender, oldCounter);
    } else {
        accountCounterMapped.set(Context.sender, oldCounter);
    }

    let history: PersistentVector<UserHistory> | null = accountCounterHistory.get(Context.sender);
    if (history == null) {
        history = new PersistentVector<UserHistory>("hs");
    }

    history.push(new UserHistory(CounterMode.INCREASE, value));

    accountCounterHistory.set(Context.sender, history);
    logging.log("Counter is now: " + oldCounter.toString());
}

export function decrementCounter(value: i32): void {
    let oldCounter = -value;
    if (accountCounterMapped.contains(Context.sender)) {
        oldCounter = accountCounterMapped.getSome(Context.sender);
        oldCounter = oldCounter - value;
        accountCounterMapped.set(Context.sender, oldCounter);
    } else {
        accountCounterMapped.set(Context.sender, oldCounter);
    }

    let history: PersistentVector<UserHistory> | null = accountCounterHistory.get(Context.sender);
    if (history == null) {
        history = new PersistentVector<UserHistory>("hs");
    }

    history.push(new UserHistory(CounterMode.DECREASE, value));
    accountCounterHistory.set(Context.sender, history);

    // const newCounter = storage.getPrimitive<i32>("counter", 0) - value;
    // storage.set<i32>("counter", newCounter);
    logging.log("Counter is now: " + oldCounter.toString());
}

export function getCounter(accountId: string): i32 {
    logging.log("accountId: " + accountId);
    if (accountCounterMapped.contains(accountId)) {
        return accountCounterMapped.getSome(accountId);
    }
    return 0;
}

export function getHistory(accountId: string): UserHistory[] {
    const histories = accountCounterHistory.get(accountId);
    if (histories == null) {
        return new Array<UserHistory>(0);
    }
    const results = new Array<UserHistory>(histories.length);
    for (let i = 0; i < histories.length; i++) {
        results[i] = histories[i];
    }
    return results;
}

export function resetCounter(): void {
    // if (accountCounterHistory)
    // storage.set<i32>("counter", 0);
    accountCounterMapped.set(Context.sender, 0);
    let histories = accountCounterHistory.get(Context.sender);
    if (histories == null) {
        histories = new PersistentVector<UserHistory>("hs");
    }
    histories.push(new UserHistory(CounterMode.RESET, 0));
    logging.log("Counter is reset!");
}
