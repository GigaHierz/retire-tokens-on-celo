import { useState } from "react";
import { parseEther } from "ethers/lib/utils";
import { ToucanClient } from "toucan-sdk";
import { useProvider, useSigner, useAccount } from "wagmi";
import { gql } from "@urql/core";

export default function Sdk() {
  const provider = useProvider();
  const account = useAccount();
  const { data: signer, isError, isLoading } = useSigner();
  const toucan = new ToucanClient("alfajores");

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

  const getcurrentNCTprice = async () => {
    // await toucan
    //   .fetchUserBatches("0x101b4c436df747b24d17ce43146da52fa6006c36")
    //   .then((data: any) => console.log(data));

    const result = await toucan
      .fetchCustomQuery(query, {
        id: "0x101b4c436df747b24d17ce43146da52fa6006c36",
      })
      .then((data) => console.log(data));

    await toucan.fetchTokenPriceOnDex("NCT").then((data) => console.log(data));
  };

  const retireTokens = async () => {
    // get the NCT pool contract
    // await toucan.getPoolContract("NCT").then(async (nct: any) => {
    //   console.log(nct);

    // await nct.redeemAuto2(parseEther("1")).then(async (tco2Tokens: any) => {
    //   console.log(tco2Tokens);

    //   await toucan
    //     .getTCO2Contract(tco2Tokens.address)
    //     .then(async (tco2: any) => {
    //       console.log(tco2);

    //       await tco2.retire(parseEther("1"));
    //     });
    // });
    // });

    const nct = toucan.getPoolContract("NCT");
    console.log(nct);

    // // call the redeem function
    // const tco2Tokens = nct.redeemAuto2(parseEther("1"));

    // get TCO2 Contract and retire the tokens.
    // const tco2 = toucan.getTCO2Contract(
    //   "0xb297f730e741a822a426c737ecd0f7877a9a2c22"
    // );
    // console.log(tco2);

    // tco2.retire(parseEther("1"));
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
          <form className="mt-8 space-y-6" action="#" method="POST">
            <div>
              <button
                type="submit"
                className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                onClick={() => retireTokens()}
              >
                <span className="absolute inset-y-0 left-0 flex items-center pl-3"></span>
                {"Retire " + " Tokens"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
