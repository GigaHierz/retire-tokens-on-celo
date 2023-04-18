import { useState } from "react";
import { parseEther } from "ethers/lib/utils";
import { ToucanClient } from "toucan-sdk";
import { useProvider, useSigner, useAccount } from "wagmi";
import { gql } from "@urql/core";

export default function Sdk() {
  const provider = useProvider();
  const { address } = useAccount();
  const { data: signer, isError, isLoading } = useSigner();
  const toucan = new ToucanClient("alfajores", provider);
  signer && toucan.setSigner(signer);

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
  const getUserRetirements = async () => {
    const result = await toucan.fetchUserRetirements(address?.toLowerCase());
    console.log(result);
  };

  const getUserRedeemsSDK = async () => {
    const result = await toucan.fetchUserRedeems(address?.toLowerCase(), "NCT");
    console.log(result);
  };

  const retireTokens = async () => {
    // get the NCT pool contract
    // const nct = toucan.getPoolContract("NCT");
    // redeem NCT for TCO2s
    // await nct.redeemAuto2(parseEther("1"));
    // toucan.redeemAuto2("NCT", parseEther("1"));
    // const scoredTCO2s = await toucan.getScoredTCO2s("NCT");
    // console.log(scoredTCO2s);
    // toucan.redeemMany(
    //   "NCT",
    //   [scoredTCO2s[length - 1], scoredTCO2s[length - 2]],
    //   [parseEther("1"), parseEther("1")]
    // );

    const beneficiaryAddress = address;
    const beneficiaryName = "GigaHierz";
    const retirementMessage = "happy birthday";
    const amount = parseEther("1");
    const tco2Address = await getUserRedeems();

    const certificate = await toucan.retireAndMintCertificate(
      "NCT",
      beneficiaryAddress,
      beneficiaryName,
      retirementMessage,
      amount,
      tco2Address
    );

    console.log(certificate);

    // get the last redeemed TCO2 tokens address
    // console.log(tco2Address);
    // if (tco2Address) {
    //   toucan.retire(parseEther("1.0"), tco2Address);
    //   // const tco2 = toucan.getTCO2Contract(tco2Address);
    //   // tco2.retire(parseEther("1"));
    // }
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
          </div>
          <div>
            <button
              className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={() => getUserRedeems()}
            >
              <span className="absolute inset-y-0 left-0 flex items-center pl-3"></span>
              {"Get Token ID"}
            </button>
          </div>
          <div>
            <button
              className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={() => getUserRedeemsSDK()}
            >
              <span className="absolute inset-y-0 left-0 flex items-center pl-3"></span>
              {"User Redeems SDK"}
            </button>
          </div>
          <div>
            <button
              className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={() => getUserRetirements()}
            >
              <span className="absolute inset-y-0 left-0 flex items-center pl-3"></span>
              {"Get User Retirements"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
