import jsonData from './NFTCollection.json'; // Replace with your actual ABI JSON file
import AuctionjsonData from './NFTAuction.json';
import factoryABI from "./NFTCollectionFactory.json";


export const CONTRACT_ADDRESS = '0x9b3d1ad930c70c324558fbea916ac966585ffe4a'; // NFTCollection contract
export const CONTRACT_ABI = jsonData.abi;

export const Auction_ADDRESS = '0xb41d62dc7240e39eb69597bf5062116dc7f5efcf'; //auction contract.
export const Auction_ABI = AuctionjsonData.abi;

export const FACTORY_CONTRACT_ADDRESS = "0x3d6cf9ec19c1d402faa98c79c5e766448e72f61d"; // Update with your factory address
export const FACTORY_CONTRACT_ABI = factoryABI.abi