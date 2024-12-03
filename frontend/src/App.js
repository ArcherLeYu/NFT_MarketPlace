import React, { useState, useEffect } from 'react';
import { ethers, parseEther } from "ethers";
import Web3Modal from 'web3modal';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './contract';
import './App.css';
import Auction from './Auction';

const App = () => {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [signer, setSigner] = useState(null); // New state for signer
  const [nftDetails, setNftDetails] = useState({
    name: '',
    description: '',
    imageUrl: '',
  });
  const [nfts, setNfts] = useState([]); 

  const connectWallet = async () => {
    try {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.BrowserProvider(connection);
      const signer = await provider.getSigner();
      const account = await signer.getAddress();

      // Save signer and account
      setSigner(signer);
      setCurrentAccount(account);

      // Initialize NFT contract
      const nftContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      setContract(nftContract);

      console.log('Wallet Connected:', account);
      console.log('NFT Contract Initialized:', nftContract);
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

  const fetchNFTs = async () => {
    if (!contract || !currentAccount) return;

    try {
      const balance = await contract.balanceOf(currentAccount);
      const nftData = [];

      for (let i = 0; i < balance; i++) {
        const tokenId = await contract.tokenOfOwnerByIndex(currentAccount, i);
        const tokenURI = await contract.tokenURI(tokenId);

        let metadata;
        if (tokenURI.startsWith('{')) {
          metadata = JSON.parse(tokenURI);
        } else {
          const response = await fetch(tokenURI);
          metadata = await response.json();
        }

        nftData.push({ tokenId: tokenId.toString(), ...metadata });
      }

      setNfts(nftData);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
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

          <Auction signer={signer} /> {/* Pass signer to Auction */}
          </>
      )}
    </div>
  );
};

export default App;
