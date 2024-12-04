import React, { useState, useEffect } from "react";
import { ethers, parseEther } from "ethers";
import Web3Modal from "web3modal";
import { CONTRACT_ABI, FACTORY_CONTRACT_ABI, FACTORY_CONTRACT_ADDRESS } from "./contract";
import "./App.css";
import Auction from "./Auction";
import { fetchCollections, createCollection, switchCollection } from "./CollectionManager";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [currentContract, setCurrentContract] = useState(null);
  const [signer, setSigner] = useState(null);
  const [collections, setCollections] = useState([]); // Persist collections
  const [selectedCollection, setSelectedCollection] = useState("");
  const [newCollectionDetails, setNewCollectionDetails] = useState({ name: "", symbol: "" });
  const [nftDetails, setNftDetails] = useState({ name: "", description: "", imageUrl: "" });
  const [nfts, setNfts] = useState([]);

  const connectWallet = async () => {
    try {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.BrowserProvider(connection);
      const signer = await provider.getSigner();
      const account = await signer.getAddress();

      setSigner(signer);
      setCurrentAccount(account);

      console.log("Wallet Connected:", account);

      // Fetch and populate collections
      const collections = await fetchCollections(signer);
      setCollections(collections);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const handleCreateCollection = async () => {
    const { name, symbol } = newCollectionDetails;
    if (!name || !symbol) return alert("Please provide both name and symbol.");

    try {
      await createCollection(signer, name, symbol);
      alert("Collection created successfully!");

      // Refresh collections after creating a new one
      const collections = await fetchCollections(signer);
      setCollections(collections);
    } catch (error) {
      console.error("Error creating collection:", error);
      alert("Failed to create collection.");
    }
  };

  const handleSwitchCollection = async (collectionAddress) => {
    try {
      const contract = await switchCollection(signer, collectionAddress);
      setCurrentContract(contract);
      setSelectedCollection(collectionAddress);

      console.log(`Switched to collection: ${collectionAddress}`);

      // Fetch NFTs for the switched collection
      fetchNFTs(contract);
    } catch (error) {
      console.error("Error switching collection:", error);
    }
  };

  const mintNFT = async () => {
    if (!currentContract) return alert("No collection selected.");
    const { name, description, imageUrl } = nftDetails;

    try {
      const metadata = { name, description, image: imageUrl };
      const tokenUri = JSON.stringify(metadata);
      const tx = await currentContract.mintNFT(currentAccount, tokenUri);
      await tx.wait();

      alert("NFT Minted Successfully!");

      // Refresh NFTs after minting
      fetchNFTs(currentContract);
    } catch (error) {
      console.error("Error minting NFT:", error);
      alert("Failed to mint NFT.");
    }
  };

  const fetchNFTs = async (contract) => {
    if (!contract) return;

    try {
      const balance = await contract.balanceOf(currentAccount);
      const nftData = [];

      for (let i = 0; i < balance; i++) {
        const tokenId = await contract.tokenOfOwnerByIndex(currentAccount, i);
        const tokenURI = await contract.tokenURI(tokenId);

        let metadata;
        if (tokenURI.startsWith("{")) {
          metadata = JSON.parse(tokenURI);
        } else {
          const response = await fetch(tokenURI);
          metadata = await response.json();
        }

        nftData.push({ tokenId: tokenId.toString(), ...metadata });
      }

      setNfts(nftData);
    } catch (error) {
      console.error("Error fetching NFTs:", error);
    }
  };

  useEffect(() => {
    if (signer && currentAccount) {
      fetchCollections(signer).then(setCollections).catch(console.error);
    }
  }, [signer, currentAccount]);

  return (
    <div className="App">
      <h1>Welcome to the NFT Marketplace</h1>
      {!currentAccount ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <>
          <p>Connected Account: {currentAccount}</p>

          <div>
            <h2>Create a New Collection</h2>
            <input
              type="text"
              placeholder="Collection Name"
              value={newCollectionDetails.name}
              onChange={(e) => setNewCollectionDetails({ ...newCollectionDetails, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Collection Symbol"
              value={newCollectionDetails.symbol}
              onChange={(e) => setNewCollectionDetails({ ...newCollectionDetails, symbol: e.target.value })}
            />
            <button onClick={handleCreateCollection}>Create Collection</button>
          </div>

          <div>
            <h2>Switch Collection</h2>
            <select value={selectedCollection} onChange={(e) => handleSwitchCollection(e.target.value)}>
              <option value="">Select a Collection</option>
              {collections.map((address, index) => (
                <option key={index} value={address}>
                  {address}
                </option>
              ))}
            </select>
          </div>

          <form>
            <input
              type="text"
              name="name"
              placeholder="NFT Name"
              value={nftDetails.name}
              onChange={(e) => setNftDetails({ ...nftDetails, [e.target.name]: e.target.value })}
            />
            <input
              type="text"
              name="description"
              placeholder="NFT Description"
              value={nftDetails.description}
              onChange={(e) => setNftDetails({ ...nftDetails, [e.target.name]: e.target.value })}
            />
            <input
              type="text"
              name="imageUrl"
              placeholder="IPFS Image URL"
              value={nftDetails.imageUrl}
              onChange={(e) => setNftDetails({ ...nftDetails, [e.target.name]: e.target.value })}
            />
            <button type="button" onClick={mintNFT}>Mint NFT</button>
          </form>

          <h2>My NFT Collection</h2>
          <div className="nft-grid">
            {nfts.map((nft, index) => (
              <div key={index} className="nft-card">
                <img src={nft.image} alt={nft.name} />
                <h2>{nft.name}</h2>
                <p>{nft.description}</p>
                <p>Token ID: {nft.tokenId}</p>
              </div>
            ))}
          </div>

          <Auction signer={signer} />
        </>
      )}
    </div>
  );
};

export default App;
