// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {NFTCollection} from "../src/NFTCollection.sol";

contract DeployNFTCollectionScript is Script {
    function run() public {
        vm.startBroadcast();
        new NFTCollection("MyCollection", "MC");
        vm.stopBroadcast();
    }
}
