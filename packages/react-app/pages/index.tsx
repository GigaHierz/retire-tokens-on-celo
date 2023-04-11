import { usePrepareContractWrite, useContractWrite } from 'wagmi'
import { useState } from 'react'

import natureCarbonTonne from '../abis/NatureCarbonTonne.json'
import toucanCarbonOffset from '../abis/ToucanCarbonOffset.json'

export default function Home () {
  const [amountPoolToken, setAmountPoolToken] = useState(0)

  const nctConfig = usePrepareContractWrite({
    address: natureCarbonTonne.address,
    abi: natureCarbonTonne.abi,
    functionName: 'redeemAuto2',
    args: [1]
  })

  const tco2Config = usePrepareContractWrite({
    address: toucanCarbonOffset.address,
    abi: toucanCarbonOffset.abi,
    functionName: 'retire',
    args: [1],
    overrides: {
      gasLimit: 2500000
    }
  })

  const nctContract = useContractWrite(nctConfig.config)
  const offsetContract = useContractWrite(tco2Config.config)

  return (
    <div>
      <div className='flex min-h-full items-center justify-center px-4 py-12 sm:px-6 lg:px-8'>
        <div className='w-full max-w-md space-y-8'>
          <div>
            <h2 className='mt-6 text-center text-3xl font-bold tracking-tight text-gray-900'>
              Build a climate positive dApp{' '}
            </h2>
          </div>
          <form className='mt-8 space-y-6' action='#' method='POST'>
            <div className='-space-y-px rounded-md shadow-sm'>
              <div>
                <label htmlFor='email-address' className='sr-only'>
                  Amount of pool tokens (NCT) you want to retire
                </label>
                <input
                  id='pool-token'
                  name='amountPoolToken'
                  type='number'
                  required
                  className='relative block w-full rounded-t-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                  value={amountPoolToken}
                  onChange={e => setAmountPoolToken(parseInt(e.target.value))}
                />
              </div>
            </div>

            <div>
              <button
                type='submit'
                className='group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                disabled={!nctContract.write}
                onClick={() => nctContract.write?.()}
              >
                <span className='absolute inset-y-0 left-0 flex items-center pl-3'></span>
                {'Redeem ' + amountPoolToken + ' Tokens'}
              </button>
              {nctContract.isLoading && <div>Check Wallet</div>}
              {nctContract.isSuccess && (
                <div>Transaction: {JSON.stringify(nctContract.data)}</div>
              )}
            </div>
            <div>
              <button
                type='submit'
                className='group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                disabled={!offsetContract.write}
                onClick={() => offsetContract.write?.()}
              >
                <span className='absolute inset-y-0 left-0 flex items-center pl-3'></span>
                {'Retire ' + amountPoolToken + ' Tokens'}
              </button>
              {offsetContract.isLoading && <div>Check Wallet</div>}
              {offsetContract.isSuccess && (
                <div>Transaction: {JSON.stringify(offsetContract.data)}</div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
