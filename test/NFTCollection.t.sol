// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/NFTCollection.sol";

contract NFTCollectionTest is Test {
    NFTCollection nft;

    function setUp() public {
        nft = new NFTCollection("TestCollection", "TEST");
    }

    function testMintNFT() public {
        nft.mintNFT(address(this), "ipfs://test-uri");
        assertEq(nft.ownerOf(0), address(this));
        assertEq(nft.tokenURI(0), "ipfs://test-uri");
    }
}
