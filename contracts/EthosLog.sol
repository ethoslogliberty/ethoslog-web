// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract EthosLog {
    address public owner;
    uint256 public constant PUBLISH_FEE_USD = 50; // 0.50 USD
    AggregatorV3Interface internal priceFeed;

    event PostCreated(address indexed author, string ipfsHash);

    constructor() {
        owner = msg.sender;
        // Oráculo ETH/USD en Base Sepolia (Versión corregida)
        priceFeed = AggregatorV3Interface(0x4AdC43E49111f584cdba3183Ce3cABa215278B47);
    }

    function getFee() public view returns (uint256) {
        (, int price, , , ) = priceFeed.latestRoundData();
        uint256 ethPrice = uint256(price) * 1e10; 
        return (PUBLISH_FEE_USD * 1e16) / (ethPrice / 1e18);
    }

    function createPost(string memory _ipfsHash) public payable {
        require(msg.value >= getFee(), "Pago insuficiente para cubrir $0.50 USD");
        emit PostCreated(msg.sender, _ipfsHash);
    }

    function withdraw() external {
        require(msg.sender == owner, "Solo owner");
        payable(owner).transfer(address(this).balance);
    }
}