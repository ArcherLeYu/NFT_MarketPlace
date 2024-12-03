import {Script} from "forge-std/Script.sol";
import {NFTAuction} from "../src/NFTAuction.sol"; // Correct the contract name and path

contract DeployAuction is Script {
    function run() public {
        vm.startBroadcast();

        address nftCollectionAddress = 0xB851ffc9E4bC312BC60875911B77Cc7f71661701
;

        // Deploy NFTAuction contract
        NFTAuction auction = new NFTAuction(nftCollectionAddress); // Use correct contract name

        vm.stopBroadcast();
    }
}
