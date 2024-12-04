// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./NFTCollection.sol";

contract NFTCollectionFactory {
    address[] public deployedCollections;

    event CollectionCreated(address collectionAddress, address owner);

    function createNFTCollection(string memory name, string memory symbol) public {
        NFTCollection newCollection = new NFTCollection(name, symbol);
        deployedCollections.push(address(newCollection));
        newCollection.transferOwnership(msg.sender); // Transfer ownership to the user who deployed
        emit CollectionCreated(address(newCollection), msg.sender);
    }

    function getCollections() public view returns (address[] memory) {
        return deployedCollections;
    }
}
