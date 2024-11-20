async function main() {
    // Mine a block
    await network.provider.send("evm_mine");
    console.log("Mined one block!");
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
  