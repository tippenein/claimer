import { create } from 'zustand';
import { UIntCV, cvToTrueValue, uintCV } from 'micro-stacks/clarity';
import { fetchTransaction } from 'micro-stacks/api';
import type {
  ContractCallTransaction,
  MempoolContractCallTransaction
} from '@stacks/stacks-blockchain-api-types';

import { callContract, network, readOnlyRequest } from '../data/stacks';

type ClaimTx = ContractCallTransaction | MempoolContractCallTransaction;

export interface Claim {
  id: bigint;
  value: string;
  score: bigint;
}

interface ClaimStore {
  claimId: UIntCV | null;
  claim: Claim | null;
  fetchClaim: () => Promise<void>;
  resetAll: () => void;
}

export const useClaim = create<ClaimStore>((set, get) => ({
  claimId: null,
  claim: null,

  async fetchClaim() {
    const rawClaimId = await readOnlyRequest('get-claims');
    if (!rawClaimId) return;

    const claimId = cvToTrueValue<UIntCV>(rawClaimId);
    const rawClaim = await readOnlyRequest('get-claim', [rawClaimId]);
    if (!rawClaim) return;
    const claim = cvToTrueValue<Claim>(rawClaim);
    set({ claimId: claimId, claim: claim });
  },

  resetAll() {
    set({
      claimId: null,
      claim: null
    });
  }
}));
