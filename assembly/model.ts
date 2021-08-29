import { context, u128 } from "near-sdk-as";

export enum CounterMode {
    INCREASE,
    DECREASE,
    RESET,
}

@nearBindgen
export class UserHistory {
    created: u64;
    constructor(public mode: CounterMode, public value: i32) {
        this.created = context.blockTimestamp;
    }
}
