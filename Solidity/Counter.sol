// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/utils/Strings.sol";

contract Counter {
    uint256 public count;

    // Function to get the current count
    function getYY() public view returns (uint256) {
        return count;
    }

        function getSender() public view  returns (string memory) {
        //msg.sender.balance
        return string(abi.encodePacked("The sender is: dennis :", " ",addressToString(msg.sender)));
    }

    function addressToString(address _addr) internal pure returns (string memory) {
        bytes memory addressBytes = abi.encodePacked(_addr);
        bytes memory alphabet = "0123456789abcdef";

        bytes memory str = new bytes(2 + addressBytes.length * 2);
        str[0] = '0';
        str[1] = 'x';

        for (uint256 i = 0; i < addressBytes.length; i++) {
            str[2 + i * 2] = alphabet[uint8(addressBytes[i] >> 4)];
            str[3 + i * 2] = alphabet[uint8(addressBytes[i] & 0x0f)];
        }

        return string(str);
    }
    // Function to increment count by 1
    function inc() public {
        count += 1;
    }

    // Function to decrement count by 1
    function dec() public {
        // This function will fail if count = 0
        count -= 1;
    }
}
