import { PnlTickInterval } from '../constants';
import { Data } from '../types';
import RestClient from './rest';
/**
 * @description REST endpoints for data unrelated to a particular address.
 */
export default class VaultClient extends RestClient {
    getMegavaultHistoricalPnl(resolution?: PnlTickInterval | null): Promise<Data>;
    getVaultsHistoricalPnl(resolution?: PnlTickInterval | null): Promise<Data>;
    getMegavaultPositions(): Promise<Data>;
}
