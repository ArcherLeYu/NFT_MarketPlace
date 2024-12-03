// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../node_modules/@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract NFTAuction is Ownable {
    struct Auction {
        address seller;
        uint256 tokenId;
        uint256 startPrice;
        uint256 highestBid;
        address highestBidder;
        uint256 startTime;
        uint256 endTime;
        bool finalized;
    }

    IERC721 public nftContract;
    mapping(uint256 => Auction) public auctions;

    event AuctionCreated(uint256 tokenId, uint256 startPrice, uint256 endTime);
    event BidPlaced(uint256 tokenId, address bidder, uint256 bidAmount);
    event AuctionFinalized(uint256 tokenId, address winner, uint256 winningBid);

    constructor(address _nftContract) {
        require(_nftContract != address(0), "Invalid NFT contract address");
        nftContract = IERC721(_nftContract);
    }

    function createAuction(
        uint256 tokenId,
        uint256 startPrice,
        uint256 duration
    ) external {
        require(nftContract.ownerOf(tokenId) == msg.sender, "Not the token owner");
        require(auctions[tokenId].endTime == 0, "Auction already exists");
        require(duration > 0, "Duration must be greater than zero");

        nftContract.transferFrom(msg.sender, address(this), tokenId);

        auctions[tokenId] = Auction({
            seller: msg.sender,
            tokenId: tokenId,
            startPrice: startPrice,
            highestBid: 0,
            highestBidder: address(0),
            startTime: block.timestamp,
            endTime: block.timestamp + duration,
            finalized: false
        });

        emit AuctionCreated(tokenId, startPrice, block.timestamp + duration);
    }

    function placeBid(uint256 tokenId) external payable {
        Auction storage auction = auctions[tokenId];
        require(auction.endTime > 0, "Auction does not exist");
        require(block.timestamp < auction.endTime, "Auction ended");
        require(msg.value > auction.highestBid, "Bid not high enough");

        if (auction.highestBid > 0) {
            payable(auction.highestBidder).transfer(auction.highestBid);
        }

        auction.highestBid = msg.value;
        auction.highestBidder = msg.sender;

        emit BidPlaced(tokenId, msg.sender, msg.value);
    }

    function finalizeAuction(uint256 tokenId) external {
        Auction storage auction = auctions[tokenId];
        require(auction.endTime > 0, "Auction does not exist");
        require(block.timestamp >= auction.endTime, "Auction not ended");
        require(!auction.finalized, "Auction already finalized");

        auction.finalized = true;

        if (auction.highestBid > 0) {
            payable(auction.seller).transfer(auction.highestBid);
            nftContract.transferFrom(address(this), auction.highestBidder, tokenId);

            emit AuctionFinalized(tokenId, auction.highestBidder, auction.highestBid);
        } else {
            nftContract.transferFrom(address(this), auction.seller, tokenId);
        }
    }

    function getAuction(uint256 tokenId) external view returns (Auction memory) {
        require(auctions[tokenId].endTime > 0, "Auction does not exist");
        return auctions[tokenId];
    }
}
