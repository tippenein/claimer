import { describe, expect, it } from 'vitest';
import { initSimnet } from '@hirosystems/clarinet-sdk';
import { Cl, ClarityType } from '@stacks/transactions';

const simnet = await initSimnet();
const accounts = simnet.getAccounts();
const address1 = accounts.get('wallet_1')!;
const address2 = accounts.get('wallet_2')!;
const arbiterAddress = accounts.get('wallet_3')!;

// https://docs.hiro.so/clarinet/feature-guides/test-contract-with-clarinet-sdk

describe('Case', () => {
  it('ensures simnet is well initalised', () => {
    expect(simnet.blockHeight).toBeDefined();
  });

  it('can call create-claim', () => {
    const { result } = simnet.callPublicFn(
      'case',
      'create-claim',
      [Cl.stringAscii('new claim'), Cl.stringAscii('something@example.com')],
      address1
    );
    expect(result).toStrictEqual(Cl.ok(Cl.uint(1)));
  });
  it('fails if create-claim is called with respondent as contract owner', () => {
    simnet.callPublicFn(
      'case',
      'create-claim',
      [Cl.stringAscii('bad claim'), Cl.stringAscii('whatever@whatever.com')],
      address1
    );
    const { result } = simnet.callPublicFn(
      'case',
      'alter-respondent',
      [Cl.uint(1)],
      address1
    );
    expect(result).toStrictEqual(Cl.error(Cl.uint(6002)));
  });
  it('checks the invalid respondent for create-case', () => {
    simnet.callPublicFn(
      'case',
      'create-claim',
      [Cl.stringAscii('claim 2'), Cl.stringAscii('whatever@whatever.com')],
      address1
    );
    const { result } = simnet.callPublicFn(
      'case',
      'create-case',
      [Cl.uint(2), Cl.standardPrincipal(address2)],
      address1
    );
    expect(result).toStrictEqual(Cl.error(Cl.uint(6005)));
  });
  it('checks the invalid arbiter for create-case', () => {
    simnet.callPublicFn('case', 'alter-respondent', [Cl.uint(1)], address2);
    const { result } = simnet.callPublicFn(
      'case',
      'create-case',
      [Cl.uint(1), Cl.standardPrincipal(address2)],
      address1
    );
    expect(result).toStrictEqual(Cl.error(Cl.uint(6003)));
  });
  it('checks the success case for create-case', () => {
    const { result } = simnet.callPublicFn(
      'case',
      'create-case',
      [Cl.uint(1), Cl.standardPrincipal(arbiterAddress)],
      address1
    );
    expect(result).toStrictEqual(Cl.ok(Cl.bool(true)));

    const { result: isActive } = simnet.callReadOnlyFn(
      'case',
      'is-claim-active',
      [Cl.uint(1)],
      address1
    );
    expect(isActive).toStrictEqual(Cl.ok(Cl.bool(true)));
  });
});
