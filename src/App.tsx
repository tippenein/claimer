import React, { ReactElement, useState } from 'react';
import { StacksDevnet, StacksMainnet } from '@stacks/network';
import {
  callReadOnlyFunction,
  standardPrincipalCV,
  getAddressFromPublicKey,
  uintCV,
  cvToValue
} from '@stacks/transactions';
import {
  AppConfig,
  FinishedAuthData,
  showConnect,
  UserSession,
  openSignatureRequestPopup
} from '@stacks/connect';
import { verifyMessageSignatureRsv } from '@stacks/encryption';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { truncateAddress } from './lib/utils';

const USE_DEVNET = true;

function App(): ReactElement {
  const [address, setAddress] = useState('');
  const [isSignatureVerified, setIsSignatureVerified] = useState(false);

  // Initialize your app configuration and user session here
  const appConfig = new AppConfig(['store_write', 'publish_data']);
  const userSession = new UserSession({ appConfig });

  const message = 'Welcome!';
  const network = USE_DEVNET ? new StacksDevnet() : new StacksMainnet();

  // Define your authentication options here
  const authOptions = {
    userSession,
    appDetails: {
      name: 'Claimer',
      icon: 'src/favicon.svg'
    },
    onFinish: (data: FinishedAuthData) => {
      // Handle successful authentication here
      const userData = data.userSession.loadUserData();
      setAddress(userData.profile.stxAddress.mainnet); // or .testnet for testnet
    },
    onCancel: () => {
      // Handle authentication cancellation here
    },
    redirectTo: '/'
  };

  const connectWallet = () => {
    showConnect(authOptions);
  };

  const disconnectWallet = () => {
    if (userSession.isUserSignedIn()) {
      userSession.signUserOut('/');
      setAddress('');
    }
  };

  const fetchReadOnly = async (senderAddress: string) => {
    const contractAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';

    const functionArgs = [standardPrincipalCV(senderAddress)];

    const contractName = 'case';
    const functionName = 'create-claim';

    try {
      const result = await call({
        network,
        contractAddress,
        contractName,
        functionName,
        functionArgs,
        senderAddress
      });
      console.log(cvToValue(result));
    } catch (error) {
      console.error('Error fetching read-only function:', error);
    }
  };

  const createClaim = () => {
    if (userSession.isUserSignedIn()) {
      openSignatureRequestPopup({
        message,
        network,
        onFinish: async ({ publicKey, signature }) => {
          // Verify the message signature using the verifyMessageSignatureRsv function
          const verified = verifyMessageSignatureRsv({
            message,
            publicKey,
            signature
          });
          if (verified) {
            // The signature is verified, so now we can check if the user is a keyholder
            setIsSignatureVerified(true);
            console.log(
              'Address derived from public key',
              getAddressFromPublicKey(publicKey, network.version)
            );
          }
        }
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="mx-auto max-w-2xl px-4">
        <div className="rounded-lg border bg-background p-8">
          <h1 className="mb-2 text-lg font-semibold">Welcome</h1>

          <div className="mt-4 flex flex-col items-start space-y-2">
            {userSession.isUserSignedIn() ? (
              <div className="flex justify-between w-full">
                <Button
                  onClick={disconnectWallet}
                  variant="link"
                  className="h-auto p-0 text-base"
                >
                  Disconnect wallet
                  <ArrowRight size={15} className="ml-1" />
                </Button>
                {address && <span>{truncateAddress(address)}</span>}
              </div>
            ) : (
              <Button
                onClick={connectWallet}
                variant="link"
                className="h-auto p-0 text-base"
              >
                Connect your wallet
                <ArrowRight size={15} className="ml-1" />
              </Button>
            )}

            {userSession.isUserSignedIn() ? (
              <div className="flex justify-between w-full">
                <Button
                  onClick={() => fetchReadOnly(address)}
                  variant="link"
                  className="h-auto p-0 text-base"
                >
                  Start a claim
                  <ArrowRight size={15} className="ml-1" />
                </Button>
              </div>
            ) : (
              <div className="flex justify-between w-full">
                <Button
                  variant="link"
                  onClick={connectWallet}
                  className="disabled h-auto p-0 text-base"
                >
                  Start a claim
                  <ArrowRight size={15} className="ml-1" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // return (
  //   <div className="text-center">
  //     <h1 className="text-xl">Friend.tech</h1>
  //     <div>
  //       <button onClick={disconnectWallet}>Disconnect Wallet</button>
  //     </div>
  //     <div>
  //       <p>
  //         {address} is {isKeyHolder ? '' : 'not'} a key holder
  //       </p>
  //       <div>
  //         <input
  //           type="text"
  //           id="address"
  //           name="address"
  //           placeholder="Enter address"
  //         />
  //         <button onClick={() => checkIsKeyHolder(address)}>
  //           Check Key Holder
  //         </button>
  //         <div>
  //           <p>Key Holder Check Result: {isKeyHolder ? 'Yes' : 'No'}</p>
  //         </div>
  //       </div>
  //     </div>
  //     <div>
  //       Sign this message: <button onClick={signMessage}>Sign</button>
  //     </div>
  //   </div>
  // );
}

export default App;
