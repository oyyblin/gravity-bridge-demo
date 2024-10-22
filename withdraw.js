require("dotenv").config();
const { ethers } = require("ethers");
const {
  EthBridger,
  registerCustomArbitrumNetwork,
  ChildToParentMessageStatus,
  ChildTransactionReceipt,
} = require("@arbitrum/sdk");

(async () => {
  try {
    const { PRIVATE_KEY } = process.env;

    const l1RpcUrl = `https://rpc.ankr.com/eth_sepolia`;
    const l1Provider = new ethers.providers.JsonRpcProvider(l1RpcUrl);
    const l1Wallet = new ethers.Wallet(PRIVATE_KEY, l1Provider);

    const l2RpcUrl = `https://rpc-sepolia.gravity.xyz`;
    const l2Provider = new ethers.providers.JsonRpcProvider(l2RpcUrl);
    const l2Wallet = new ethers.Wallet(PRIVATE_KEY, l2Provider);

    // G address on Sepolia
    const l1TokenAddress = "0x9C7BEBa8F6eF6643aBd725e45a4E8387eF260649";

    // https://docs.gravity.xyz/contract-addresses/testnet
    // "ArbSdkError: Unrecognized network 13505" if call getArbitrumNetwork(l2Provider);
    const customL2Network = {
      name: "Gravity Alpha Sepolia Testnet",
      chainId: 13505,
      parentChainId: 11155111,
      confirmPeriodBlocks: 45818,
      isCustom: true,
      isTestnet: true,
      nativeToken: l1TokenAddress,
      ethBridge: {
        bridge: "0x946CF7F3238537e51B017369E523425A18996C23",
        inbox: "0xe50eBd835F5f17fdEC0A547c37343F080B664357",
        outbox: "0xC5C415a8739dbE817683a691445B762F3B2c34Dd",
        rollup: "0xDE145C4Ef9699D130848167d512dD1D09f173066",
        sequencerInbox: "0x3eb7334755Fb41dC01400B15C8cC0C64B36E5969",
      },
    };

    // Initialize the L2Network
    const l2Network = registerCustomArbitrumNetwork(customL2Network, {
      throwIfAlreadyRegistered: true,
    });
    const l2NetworkProvider = new ethers.providers.StaticJsonRpcProvider(
      l2RpcUrl,
      l2Network
    );

    const bridge = new EthBridger(l2Network);

    // Amount to withdraw
    const amount = ethers.utils.parseUnits("0.01", 18); // Withdraw 0.01 G

    // Initiate the withdrawal from L2 to L1
    console.log("Initiating withdrawal...");
    const withdrawTx = await bridge.withdraw({
      amount: amount,
      destinationAddress: l1Wallet.address,
      from: l2Wallet.address,
      childSigner: l2Wallet,
    });
    console.log(`Withdrawal transaction submitted: ${withdrawTx.hash}`);

    // Wait for the transaction to be confirmed on L2
    const withdrawReceipt = await l2Provider.waitForTransaction(
      withdrawTx.hash,
      1,
      120000
    ); // 2 minutes timeout

    console.log(`Withdrawal confirmed in block ${withdrawReceipt.blockNumber}`);

    const l2Receipt = new ChildTransactionReceipt(withdrawReceipt);
    const messages = await l2Receipt.getChildToParentMessages(l1Wallet);

    const l2ToL1Msg = messages[0];

    // Wait for the outbox entry to be created (challenge period)
    console.log("Waiting for the challenge period to pass...");

    console.log("Checking if message is already executed...");
    if (
      (await l2ToL1Msg.status(l2NetworkProvider)) ==
      ChildToParentMessageStatus.EXECUTED
    ) {
      console.log(`Message already executed! Nothing else to do here`);
      process.exit(1);
    }

    const timeToWaitMs = 1000 * 60;
    console.log(
      "Waiting for the outbox entry to be created (when the L2 block is confirmed on L1)..."
    );
    await l2ToL1Msg.waitUntilReadyToExecute(l2NetworkProvider, timeToWaitMs);
    console.log("Outbox entry exists! Trying to execute now");

    const proof = await l2ToL1Msg.getOutboxProof(l2NetworkProvider);
    console.log("proof", proof);

    console.log("Executing message...");
    const res = await l2ToL1Msg.execute(l2NetworkProvider);
    const rec = await res.wait();
    console.log("Done! Your withdrawal is executed", rec.transactionHash);
  } catch (err) {
    console.error("Error:", err);
  }
})();
