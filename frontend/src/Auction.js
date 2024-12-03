import React, { useState } from "react";
import { ethers, parseEther } from "ethers";
import { Auction_ADDRESS, Auction_ABI, CONTRACT_ADDRESS, CONTRACT_ABI } from "./contract";

const Auction = ({ signer }) => {
  const [auctionDetails, setAuctionDetails] = useState({
    tokenId: "",
    startPrice: "",
    duration: "",
  });

  const handleInputChange = (e) => {
    setAuctionDetails({ ...auctionDetails, [e.target.name]: e.target.value });
  };

  const approveNFT = async (tokenId) => {
    try {
      if (!signer) return alert("Wallet not connected");

      // Connect to the NFT contract
      const nftContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // Approve the Auction contract for the specific tokenId
      const tx = await nftContract.approve(Auction_ADDRESS, tokenId);
      console.log("Approval transaction sent:", tx.hash);

      // Wait for the transaction to be mined
      await tx.wait();
      console.log("Approval transaction confirmed.");
    } catch (error) {
      console.error("Error approving NFT:", error);
      alert("Failed to approve NFT for auction");
    }
  };

  const createAuction = async () => {
    if (!signer) return alert("Wallet not connected");

    const { tokenId, startPrice, duration } = auctionDetails;

    try {
      console.log("Auction Parameters:", { tokenId, startPrice, duration });

      // Approve the NFT before creating an auction
      await approveNFT(tokenId);

      // Connect to the Auction contract
      const auctionContract = new ethers.Contract(Auction_ADDRESS, Auction_ABI, signer);

      console.log("Auction Contract:", auctionContract);

      // Call createAuction function
      const tx = await auctionContract.createAuction(
        parseInt(tokenId), // Ensure tokenId is an integer
        parseEther(startPrice), // Ensure startPrice is parsed correctly
        parseInt(duration) // Ensure duration is an integer
      );

      console.log("Transaction Sent:", tx.hash);
      await tx.wait();

      alert("Auction created successfully!");
    } catch (error) {
      console.error("Error creating auction:", error);
      alert("Failed to create auction");
    }
  };

  return (
    <div>
      <h2>Create Auction</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createAuction();
        }}
      >
        <input
          type="number"
          name="tokenId"
          placeholder="Token ID"
          value={auctionDetails.tokenId}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="startPrice"
          placeholder="Start Price (ETH)"
          value={auctionDetails.startPrice}
          onChange={handleInputChange}
          required
        />
        <input
          type="number"
          name="duration"
          placeholder="Duration (seconds)"
          value={auctionDetails.duration}
          onChange={handleInputChange}
          required
        />
        <button type="submit">Create Auction</button>
      </form>
    </div>
  );
};

export default Auction;
