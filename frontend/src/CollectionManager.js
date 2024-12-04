import { ethers } from "ethers";
import { FACTORY_CONTRACT_ADDRESS, FACTORY_CONTRACT_ABI, CONTRACT_ABI } from "./contract";

export const fetchCollections = async (signer) => {
  const factoryContract = new ethers.Contract(
    FACTORY_CONTRACT_ADDRESS,
    FACTORY_CONTRACT_ABI,
    signer
  );
  return await factoryContract.getCollections();
};

export const createCollection = async (signer, name, symbol) => {
  const factoryContract = new ethers.Contract(
    FACTORY_CONTRACT_ADDRESS,
    FACTORY_CONTRACT_ABI,
    signer
  );

  const tx = await factoryContract.createNFTCollection(name, symbol);
  await tx.wait();
};

export const switchCollection = async (signer, collectionAddress) => {
  const collectionContract = new ethers.Contract(
    collectionAddress,
    CONTRACT_ABI,
    signer
  );
  return collectionContract;
};
