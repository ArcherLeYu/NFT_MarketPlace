import React, { useState, useEffect } from 'react';
import { ethers } from "ethers";
import Web3Modal from 'web3modal';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './contract';
import './App.css';

const App = () => {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [nftDetails, setNftDetails] = useState({
    name: '',
    description: '',
    imageUrl: '',
  });
  const [nfts, setNfts] = useState([]); // NEW STATE FOR NFTs

  const connectWallet = async () => {
    try {
      // Initialize Web3Modal
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
  
      // Wrap connection with ethers.js provider
      const provider = new ethers.BrowserProvider(connection); // Updated for ethers v6
      const signer = await provider.getSigner();
  
      // Retrieve connected account address
      const account = await signer.getAddress();
      setCurrentAccount(account);
  
      // Connect to contract
      const nftContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      setContract(nftContract);
  
      console.log('Wallet Connected:', account);
      console.log('NFT Contract:', nftContract);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const mintNFT = async () => {
    if (!contract) return alert('Contract not connected');
    const { name, description, imageUrl } = nftDetails;

    try {
      const metadata = {
        name,
        description,
        image: imageUrl,
      };

      const tokenUri = JSON.stringify(metadata);
      const tx = await contract.mintNFT(currentAccount, tokenUri);
      await tx.wait();

      alert('NFT Minted Successfully!');
    } catch (error) {
      console.error('Error minting NFT:', error);
      alert('Failed to mint NFT');
    }
  };

  const handleInputChange = (e) => {
    setNftDetails({ ...nftDetails, [e.target.name]: e.target.value });
  };

  const fetchNFTs = async () => {
    try {
      if (!contract || !currentAccount) return;
  
      const balance = await contract.balanceOf(currentAccount);
      console.log("Balance of NFTs:", balance.toString());
  
      const nftData = [];
  
      for (let i = 0; i < balance; i++) {
        const tokenId = await contract.tokenOfOwnerByIndex(currentAccount, i);
        console.log("Token ID:", tokenId.toString());
  
        const tokenURI = await contract.tokenURI(tokenId);
        console.log("Raw Token URI:", tokenURI);
  
        // If the tokenURI is a JSON string, parse it first
        let metadata = tokenURI;
        if (typeof tokenURI === "string" && tokenURI.startsWith("{")) {
          metadata = JSON.parse(tokenURI); // Parse JSON string if needed
          console.log("Parsed Metadata:", metadata);
        } else {
          // Otherwise, fetch metadata from the tokenURI
          const response = await fetch(tokenURI);
          metadata = await response.json();
          console.log("Fetched Metadata:", metadata);
        }
  
        nftData.push({ tokenId: tokenId.toString(), ...metadata });
      }
  
      setNfts(nftData);
      console.log("NFTs State:", nftData);
    } catch (error) {
      console.error("Error fetching NFTs:", error);
    }
  };
  
  

  useEffect(() => {
    if (contract && currentAccount) {
      fetchNFTs();
    }
  }, [contract, currentAccount]);

  return (
    <div className="App">
      <h1>Welcome to the NFT Marketplace</h1>
      {!currentAccount ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <>
          <p>Connected Account: {currentAccount}</p>
          <p>NFT Contract Ready: {contract ? 'Yes' : 'No'}</p>
          <form>
            <input
              type="text"
              name="name"
              placeholder="NFT Name"
              value={nftDetails.name}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="description"
              placeholder="NFT Description"
              value={nftDetails.description}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="imageUrl"
              placeholder="IPFS Image URL"
              value={nftDetails.imageUrl}
              onChange={handleInputChange}
            />
            <button type="button" onClick={mintNFT}>Mint NFT</button>
          </form>

          {/* NEW SECTION TO DISPLAY NFTs */}
          <h2>My NFT Collection</h2>
          <div className="nft-grid">
            {nfts.length === 0 ? <p>No NFTs found</p> : nfts.map((nft, index) => (
              <div key={index} className="nft-card">
                <img src={nft.image} alt={nft.name} />
                <h2>{nft.name}</h2>
                <p>{nft.description}</p>
                <p>Token ID: {nft.tokenId}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default App;
