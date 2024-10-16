# Gravity Bridge Demo

This is a simple example of withdrawing 0.01 G token from Gravity Alpha Testnet Sepolia to Ethereum Sepolia.

## Example run

```bash
yarn
yarn start
```

## Example output

```
>> yarn start
yarn run v1.22.22
$ node withdraw.js
Initiating withdrawal...
Withdrawal transaction submitted: 0x67238cd835f27245418fb905e779262e8d87e49af94e9ff5e6ed68153629525b
Withdrawal confirmed in block 141
Waiting for the challenge period to pass...
Checking if message is already executed...
Waiting for the outbox entry to be created (when the L2 block is confirmed on L1)...
Outbox entry exists! Trying to execute now
proof [
  '0x0000000000000000000000000000000000000000000000000000000000000000',
  '0x4b4a7a0ae42e3946233cf535bd42dfc50887033ace7948c2e21eb0f6d9989ab4',
  '0x3be46f4de2a4ac3b6bcc75e29b4ce2d231182dd516ec271f160844fb82e7b723'
]
Executing message...
Done! Your withdrawal is executed 0x343a4e18de12dd097a6aef224a2973387bb1e6ebb88967732b97d72ecc1bfc50
```

L2 tx: https://explorer-sepolia.gravity.xyz/tx/0x67238cd835f27245418fb905e779262e8d87e49af94e9ff5e6ed68153629525b
L1 tx: https://sepolia.etherscan.io/tx/0x343a4e18de12dd097a6aef224a2973387bb1e6ebb88967732b97d72ecc1bfc50
