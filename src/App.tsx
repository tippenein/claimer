import React, { ReactElement, useState, useEffect } from 'react';
import {
  AppConfig,
  FinishedAuthData,
  showConnect,
  UserSession,
} from '@stacks/connect';
import { useAuth } from './stores/useAuth'
import { useClaim } from './stores/useClaim'
import { callContract } from './data/stacks';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { truncateAddress } from './lib/utils';
import { appDetails } from './stores/useAuth';


function App(): ReactElement {
  const [address, setAddress] = useState('');

  // Initialize your app configuration and user session here
  const appConfig = new AppConfig(['store_write', 'publish_data']);
  const userSession = new UserSession({ appConfig });
  const { session } = useAuth()
  useEffect(() => {
    const { fetchClaim } = useClaim.getState()
    fetchClaim()
  }, [])

  const authOptions = {
    userSession,
    appDetails: appDetails,
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

  const createClaim = (address) => {
    if (userSession.isUserSignedIn()) {
      console.log('something')
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
                  onClick={() => createClaim(address)}
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

}

export default App;
