# Gravity Bridge Demo

This is a simple example of bridging and withdrawing G token to and from Gravity Alpha Testnet Sepolia.

## Example Withdraw

```bash
yarn
yarn withdraw
```

### Example output

```
>> yarn withdraw
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

## Example Bridge

```bash
yarn bridge
```

### Example output

```
>> yarn withdraw
yarn bridge
yarn run v1.22.22
$ node bridge.js
L1 Wallet Address:  0xa272C14931E725D5cDB30f87Af77CF5Ce3d20B32
Current Balance on Parent:  1110000000000000000
Bridging...
Bridge tx:  0x7c8b17e2128f5d46464631c4d099f025a9a3d1065c8a21832464ab2d785c2636
Child Result: 0x14a0ab45e685634914afdc7c78a8312855ed4d6a4c8962cf4e16720b65c5d9f5
```
