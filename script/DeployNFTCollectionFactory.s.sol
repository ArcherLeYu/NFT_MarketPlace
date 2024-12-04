// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/NFTCollectionFactory.sol"; // Update with the correct path to NFTCollectionFactory.sol

contract DeployNFTCollectionFactory is Script {
    function run() external {
        vm.startBroadcast(); // Begin broadcasting transactions

        // Deploy the NFTCollectionFactory
        NFTCollectionFactory factory = new NFTCollectionFactory();

        console.log("NFTCollectionFactory deployed to:", address(factory));

        vm.stopBroadcast(); // End broadcasting transactions
    }
}
