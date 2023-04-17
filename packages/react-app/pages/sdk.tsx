import { useState } from "react";
import { parseEther } from "ethers/lib/utils";
import { ToucanClient } from "toucan-sdk";
import { useProvider, useSigner, useAccount } from "wagmi";
import { gql } from "@urql/core";

export default function Sdk() {
  const provider = useProvider();
  const { address } = useAccount();
  const { data: signer, isError, isLoading } = useSigner();
  const toucan = new ToucanClient("alfajores", provider, signer);

  const query = gql`
    query ($id: String) {
      user(id: $id) {
        redeemsCreated {
          token {
            address
            name
          }
        }
      }
    }
  `;

  const getcurrentNCTprice = async (): Promise<string | void> => {
    return await toucan
      .fetchTokenPriceOnDex("NCT")
      .then((data) => console.log(data));
  };

  const getUserRedeems = async (): Promise<string | void> => {
    return await toucan
      .fetchCustomQuery(query, {
        id: address?.toLowerCase(),
      })
      .then((data) => data?.user?.redeemsCreated[0].token.address);
  };

  const retireTokens = async () => {
    // get the NCT pool contract

    const nct = toucan.getPoolContract("NCT");

    // // call the redeem function
    const redeemed = await nct.redeemAuto2(parseEther("1"));

    console.log(redeemed);

    const tco2token = await getUserRedeems();
    console.log(tco2token);

    const tco2 = toucan.getTCO2Contract(tco2token);
    tco2.retire(parseEther("1"));

    console.log(tco2token);
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
          <div>
            <button
              className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={() => retireTokens()}
            >
              <span className="absolute inset-y-0 left-0 flex items-center pl-3"></span>
              {"Retire " + " Tokens"}
            </button>
            <button
              className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={() => getUserRedeems()}
            >
              <span className="absolute inset-y-0 left-0 flex items-center pl-3"></span>
              {"Get Token ID"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
