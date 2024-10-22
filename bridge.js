require("dotenv").config();
const { ethers } = require("ethers");
const { registerCustomArbitrumNetwork, EthBridger } = require("@arbitrum/sdk");

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

    console.log("L1 Wallet Address: ", l1Wallet.address);

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

    const ERC20_ABI = [
      "function balanceOf(address owner) view returns (uint256)",
    ];

    // Get the ERC20 contract instance
    const gContract = new ethers.Contract(l1TokenAddress, ERC20_ABI, l1Wallet);
    let l1WalletBalance = await gContract.balanceOf(l1Wallet.address);
    console.log("Current Balance on Parent: ", l1WalletBalance.toString());

    const bridge = new EthBridger(l2Network);

    // Amount to bridge
    const amount = ethers.utils.parseUnits("0.01", 18); // Bridge 0.01 G
    const approveTx = await bridge.approveGasToken({
      amount: amount,
      parentSigner: l1Wallet,
    });
    const approveResponse = await approveTx.wait();
    console.log("Approve tx: ", approveResponse.transactionHash);

    // Initiate the bridge from L1 to L2
    console.log("Bridging...");
    const bridgeTx = await bridge.deposit({
      amount: amount,
      childProvider: l2NetworkProvider,
      parentSigner: l1Wallet,
    });
    const bridgeRec = await bridgeTx.wait();
    console.log("Bridge tx: ", bridgeRec.transactionHash);
    const childResult = await bridgeRec.waitForChildTransactionReceipt(
      l2NetworkProvider
    );
    console.log("Child Result: ", childResult.transactionHash);
  } catch (err) {
    console.error("Error:", err);
  }
})();
