import React, { ReactElement, useState, useEffect } from 'react';
import {
  AppConfig,
  FinishedAuthData,
  showConnect,
  UserSession
} from '@stacks/connect';
import { useAuth } from './stores/useAuth';
import { useClaim } from './stores/useClaim';
import { callContract } from './data/stacks';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { truncateAddress } from './lib/utils';
import { appDetails } from './stores/useAuth';

function App(): ReactElement {
  const [address, setAddress] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [respondent, setRespondent] = useState('');

  const openClaimModal = () => {
    setModalOpen(true);
  };

  const closeClaimModal = () => {
    setModalOpen(false);
  };

  const handleClaimSubmit = () => {
    useClaim.getState().createClaim(name, respondent);
    closeClaimModal();
  };

  // Initialize your app configuration and user session here
  const appConfig = new AppConfig(['store_write', 'publish_data']);
  const userSession = new UserSession({ appConfig });
  const { session } = useAuth();
  useEffect(() => {
    const { fetchClaim } = useClaim.getState();
    fetchClaim();
  }, []);

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

  const createClaim = (name, respondentEmail) => {
    if (userSession.isUserSignedIn()) {
      useClaim.getState().createClaim(name, respondentEmail);
    }
  };

  return (
    <>
      {modalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
          onClick={closeClaimModal}
        >
          <div
            className="bg-white p-6 rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleClaimSubmit} className="space-y-4">
              <label className="block">
                <span className="text-gray-700">Name:</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </label>
              <label className="block">
                <span className="text-gray-700">Respondent:</span>
                <input
                  type="text"
                  value={respondent}
                  onChange={(e) => setRespondent(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </label>
              <div className="flex justify-end">
                <input
                  type="submit"
                  value="Submit"
                  className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                />
              </div>
            </form>
          </div>
        </div>
      )}
      {
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
                      onClick={() => openClaimModal()}
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
      }
    </>
  );
}

export default App;
