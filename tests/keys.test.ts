import { describe, expect, it } from 'vitest';
import { initSimnet } from '@hirosystems/clarinet-sdk';
import { Cl, ClarityType } from '@stacks/transactions';

const simnet = await initSimnet();
const accounts = simnet.getAccounts();
const address1 = accounts.get('wallet_1')!;

// https://docs.hiro.so/clarinet/feature-guides/test-contract-with-clarinet-sdk

describe('Keys', () => {
  it('ensures simnet is well initalised', () => {
    expect(simnet.blockHeight).toBeDefined();
  });

  it('get-key-supply', () => {
    const { result } = simnet.callReadOnlyFn(
      'keys',
      'get-keys-supply',
      [Cl.contractPrincipal(address1, 'something')],
      address1
    );
    // expect(result).toHaveClarityType(ClarityType.UInt);
    expect(result).toStrictEqual(Cl.uint(0));
  });
});
