import { usePrepareContractWrite, useContractWrite, useAccount } from "wagmi";
import { useState } from "react";
import { parseEther } from "ethers/lib/utils";
import { createClient, Client, gql, fetchExchange } from "@urql/core";

import natureCarbonTonne from "../abis/NatureCarbonTonne.json";
import toucanCarbonOffset from "../abis/ToucanCarbonOffset.json";
import { BigNumber } from "ethers";

export default function Home() {
  let graphClient = new Client({
    url: "https://api.thegraph.com/subgraphs/name/toucanprotocol/alfajores",
    requestPolicy: "network-only",
    fetch: fetch,
    exchanges: [fetchExchange],
  });

  const { address } = useAccount();
  const [amountPoolToken, setAmountPoolToken] = useState<string>("0");
  const [tco2address, setTco2address] = useState<string>();

  const nctConfig = usePrepareContractWrite({
    address: natureCarbonTonne.address,
    abi: natureCarbonTonne.abi,
    functionName: "redeemAuto2",
    args: [amountPoolToken ? parseEther(amountPoolToken) : 0],
    overrides: {
      gasLimit: 2500000,
    },
  });

  const tco2Config = usePrepareContractWrite({
    address: tco2address,
    abi: toucanCarbonOffset.abi,
    functionName: "retire",
    args: [amountPoolToken ? parseEther(amountPoolToken) : 0],
    overrides: {
      gasLimit: 2500000,
    },
  });

  const fetchUserRedeems: any = async (
    walletAddress: string,
    poolAddress: string,
    first: number
  ) => {
    const query = gql`
      query ($walletAddress: String, $poolAddress: String, $first: Int) {
        user(id: $walletAddress) {
          redeemsCreated(
            first: $first
            orderBy: timestamp
            orderDirection: desc
          ) {
            id
            amount
            timestamp
            creator {
              id
            }
            token {
              symbol
              name
              address
              projectVintage {
                name
                project {
                  projectId
                }
              }
            }
          }
        }
      }
    `;

    const result = await graphClient
      .query(query, {
        walletAddress,
        poolAddress,
        first,
      })
      .toPromise();

    console.log(result);

    if (result.error) throw result.error;
    if (result.data?.user?.redeemsCreated)
      setTco2address(result.data?.user?.redeemsCreated[0].token.address);
    return result.data.user.redeemsCreated;
    return [];
  };

  const nctContract = useContractWrite(nctConfig.config);
  const tco2retireContract = useContractWrite(tco2Config.config);

  const retirePoolToken = async () => {
    console.log(nctContract);
    await nctContract.writeAsync?.().then(async (data) => {
      console.log(data);

      console.log(address);

      fetchUserRedeems();

      tco2address &&
        (await tco2retireContract.writeAsync?.().then(async (data) => {
          console.log(data);
        }));
    });
  };

  return (
    <div>
      <div className="flex min-h-full items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              Build a climate positive dApp{" "}
            </h2>
          </div>
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Amount of pool tokens (NCT) you want to retire
              </label>
              <input
                id="pool-token"
                name="amountPoolToken"
                className="relative block w-full rounded-t-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                value={amountPoolToken}
                onChange={(e) => setAmountPoolToken(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              disabled={!nctContract.write && !amountPoolToken}
              onClick={() => retirePoolToken()}
            >
              <span className="absolute inset-y-0 left-0 flex items-center pl-3"></span>
              {"Redeem " + amountPoolToken + " Tokens"}
            </button>
            {nctContract.isLoading && <div>Check Wallet</div>}
            {nctContract.isSuccess && (
              <div>Transaction: {JSON.stringify(nctContract.data)}</div>
            )}
          </div>
          <div>
            <button
              className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              disabled={!nctContract.write && !amountPoolToken}
              onClick={() =>
                fetchUserRedeems(
                  address?.toLowerCase(),
                  natureCarbonTonne.address,
                  Number(amountPoolToken)
                )
              }
            >
              <span className="absolute inset-y-0 left-0 flex items-center pl-3"></span>
              {"Get Token name"}
            </button>
          </div>
          <div>{tco2address}</div>
          <div>
            <button
              className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              disabled={!tco2retireContract.write && !amountPoolToken}
              onClick={() => tco2retireContract.write?.()}
            >
              <span className="absolute inset-y-0 left-0 flex items-center pl-3"></span>
              {"Retire " + amountPoolToken + " Tokens"}
            </button>
            {tco2retireContract.isLoading && <div>Check Wallet</div>}
            {tco2retireContract.isSuccess && (
              <div>Transaction: {JSON.stringify(tco2retireContract.data)}</div>
            )}
          </div>
          <div>
            <button
              className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              disabled={
                !nctContract?.write &&
                !tco2retireContract?.write &&
                !amountPoolToken
              }
              onClick={() => retirePoolToken()}
            >
              <span className="absolute inset-y-0 left-0 flex items-center pl-3"></span>
              {"Redeem + Retire " + amountPoolToken + " Tokens"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
