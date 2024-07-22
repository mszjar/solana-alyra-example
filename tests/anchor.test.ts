// No imports needed: web3, anchor, pg and more are globally available

describe("Test", () => {
  it("initialize", async () => {
    // Generate keypair for the new account
    const newAccountKp = new web3.Keypair();

    // Send transaction
    const data = new BN(42);
    const txHash = await pg.program.methods
      .initialize(data)
      .accounts({
        newAccount: newAccountKp.publicKey,
        signer: pg.wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([newAccountKp])
      .rpc();
    console.log(`Use 'solana confirm -v ${txHash}' to see the logs`);

    // Confirm transaction
    await pg.connection.confirmTransaction(txHash);

    // Fetch the created account
    const newAccount = await pg.program.account.newAccount.fetch(
      newAccountKp.publicKey
    );

    console.log("On-chain data is:", newAccount.data.toString());

    // Check whether the data on-chain is equal to local 'data'
    assert(data.eq(newAccount.data));
  });
});

describe("Proposal", () => {
  it("should create a new proposal", async () => {
    // Generate keypair for the new proposal
    const proposalKp = new web3.Keypair();
    const voterKp = new web3.Keypair();
    
    // Send transaction
    const title = "Test Proposal";
    const description = "This is a test proposal";
    const options = ["Option 1", "Option 2", "Option 3"];

    const txHash = await pg.program.methods
      .createProposal(title, description, options)
      .accounts({
        proposal: proposalKp.publicKey,
        voter: voterKp.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([proposalKp, voterKp])
      .rpc();
    console.log(`Use 'solana confirm -v ${txHash}' to see the logs`);

    // Confirm transaction
    await pg.connection.confirmTransaction(txHash);

    // Fetch the created proposal account
    const proposalAccount = await pg.program.account.proposal.fetch(
      proposalKp.publicKey
    );

    console.log("On-chain data is:", proposalAccount);

    // Check whether the data on-chain matches the local data
    assert.strictEqual(proposalAccount.title, title);
    assert.strictEqual(proposalAccount.description, description);
    assert.deepStrictEqual(proposalAccount.options.map(o => o.label), options);
  });
});

describe("Vote", () => {
  it("should allow voting on a proposal", async () => {
    // Generate keypair for the proposal and voter
    const proposalKp = new web3.Keypair();
    const voterKp = new web3.Keypair();

    // Initialize a new proposal first
    const title = "Test Proposal";
    const description = "This is a test proposal";
    const options = ["Option 1", "Option 2", "Option 3"];

    await pg.program.methods
      .createProposal(title, description, options)
      .accounts({
        proposal: proposalKp.publicKey,
        voter: voterKp.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([proposalKp, voterKp])
      .rpc();

    // Now vote on the proposal
    const selectedOption = 1; // Option 2

    const txHash = await pg.program.methods
      .voteOnProposal(selectedOption)
      .accounts({
        proposal: proposalKp.publicKey,
        voter: voterKp.publicKey,
      })
      .signers([voterKp])
      .rpc();
    console.log(`Use 'solana confirm -v ${txHash}' to see the logs`);

    // Confirm transaction
    await pg.connection.confirmTransaction(txHash);

    // Fetch the updated proposal account
    const proposalAccount = await pg.program.account.proposal.fetch(
      proposalKp.publicKey
    );

    console.log("On-chain data is:", proposalAccount);

    // Check whether the vote count has been updated
    assert.strictEqual(proposalAccount.options[selectedOption].count, 1);
  });
});

describe("Initialize", () => {
  it("should initialize the program state", async () => {
    const initializerKp = new web3.Keypair();

    // Send transaction
    const txHash = await pg.program.methods
      .initialize()
      .accounts({
        initializer: initializerKp.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([initializerKp])
      .rpc();
    console.log(`Use 'solana confirm -v ${txHash}' to see the logs`);

    // Confirm transaction
    await pg.connection.confirmTransaction(txHash);

    // Fetch the initialized state
    const initializerAccount = await pg.program.account.initializer.fetch(
      initializerKp.publicKey
    );

    console.log("Initialized account data is:", initializerAccount);

    // Check if the initializer account has been set up correctly
    assert.ok(initializerAccount);
  });
});

describe("Vote Errors", () => {
  it("should fail to vote with invalid option index", async () => {
    const proposalKp = new web3.Keypair();
    const voterKp = new web3.Keypair();

    const title = "Test Proposal";
    const description = "This is a test proposal";
    const options = ["Option 1", "Option 2", "Option 3"];

    await pg.program.methods
      .createProposal(title, description, options)
      .accounts({
        proposal: proposalKp.publicKey,
        voter: voterKp.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([proposalKp, voterKp])
      .rpc();

    const invalidOptionIndex = 5; // Invalid index

    try {
      await pg.program.methods
        .voteOnProposal(invalidOptionIndex)
        .accounts({
          proposal: proposalKp.publicKey,
          voter: voterKp.publicKey,
        })
        .signers([voterKp])
        .rpc();
      assert.fail("Expected an error but none was thrown");
    } catch (error) {
      assert.ok(error.message.includes("Invalid option index"));
    }
  });
});

describe("Proposal and Vote", () => {
  it("should create a proposal and then vote on it", async () => {
    const proposalKp = new web3.Keypair();
    const voterKp = new web3.Keypair();

    const title = "Test Proposal";
    const description = "This is a test proposal";
    const options = ["Option 1", "Option 2", "Option 3"];

    // Create proposal
    await pg.program.methods
      .createProposal(title, description, options)
      .accounts({
        proposal: proposalKp.publicKey,
        voter: voterKp.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([proposalKp, voterKp])
      .rpc();

    // Vote on the proposal
    const selectedOption = 1; // Option 2

    const txHash = await pg.program.methods
      .voteOnProposal(selectedOption)
      .accounts({
        proposal: proposalKp.publicKey,
        voter: voterKp.publicKey,
      })
      .signers([voterKp])
      .rpc();
    console.log(`Use 'solana confirm -v ${txHash}' to see the logs`);

    // Confirm transaction
    await pg.connection.confirmTransaction(txHash);

    // Fetch the updated proposal account
    const proposalAccount = await pg.program.account.proposal.fetch(
      proposalKp.publicKey
    );

    console.log("On-chain data is:", proposalAccount);

    // Check whether the vote count has been updated
    assert.strictEqual(proposalAccount.options[selectedOption].count, 1);
  });
});
