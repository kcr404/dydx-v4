/** VaultStatus represents the status of a vault. */
export declare enum VaultStatus {
    /** VAULT_STATUS_UNSPECIFIED - Default value, invalid and unused. */
    VAULT_STATUS_UNSPECIFIED = 0,
    /** VAULT_STATUS_DEACTIVATED - Don’t place orders. Does not count toward global vault balances. */
    VAULT_STATUS_DEACTIVATED = 1,
    /** VAULT_STATUS_STAND_BY - Don’t place orders. Does count towards global vault balances. */
    VAULT_STATUS_STAND_BY = 2,
    /** VAULT_STATUS_QUOTING - Places orders on both sides of the book. */
    VAULT_STATUS_QUOTING = 3,
    /** VAULT_STATUS_CLOSE_ONLY - Only place orders that close the position. */
    VAULT_STATUS_CLOSE_ONLY = 4,
    UNRECOGNIZED = -1
}
export declare const VaultStatusSDKType: typeof VaultStatus;
export declare function vaultStatusFromJSON(object: any): VaultStatus;
export declare function vaultStatusToJSON(object: VaultStatus): string;
