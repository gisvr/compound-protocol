pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

/**
 * @title ERC20Mintable
 * @dev ERC20 minting logic
 */
contract MintableERC20 is ERC20 {
    /**
     * @dev Function to mint tokens
     * @param value The amount of tokens to mint.
     * @return A boolean that indicates if the operation was successful.
     */
    function mint(uint256 value) public returns (bool) {
        _mint(msg.sender, value);
        return true;
    }
}

contract MockDAI is MintableERC20 {
    uint256 public decimals = 18;
    string public symbol = "DAI";
    string public name = "DAI Token";
}

contract MockUSDC is MintableERC20 {
    uint256 public decimals = 6;
    string public symbol = "USDC";
    string public name = "USDC Token";
}

contract MockBAT is MintableERC20 {
    uint256 public decimals = 18;
    string public symbol = "BAT";
    string public name = "BAT Token";
}

contract MockWBTC is MintableERC20 {
    uint256 public decimals = 8;
    string public symbol = "WBTC";
    string public name = "WBTC Token";
}

