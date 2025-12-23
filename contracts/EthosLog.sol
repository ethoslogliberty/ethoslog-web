// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract EthosLog {
    address public owner;
    uint256 public constant PUBLISH_FEE = 0.0004 ether;

    event PostCreated(address indexed author, string ipfsHash);

    constructor() {
        owner = msg.sender;
    }

    function publishEntry(string memory _ipfsHash) public payable {
        require(msg.value >= PUBLISH_FEE, "Pago insuficiente: 0.0004 ETH requerido");
        emit PostCreated(msg.sender, _ipfsHash);
    }

    function withdraw() external {
        require(msg.sender == owner, "Solo el owner puede retirar");
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success, "Error al retirar");
    }
}