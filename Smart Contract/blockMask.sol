pragma solidity ^0.5.8;

contract BlockMask {
    
    mapping (address => Registrar) private userContent;
    mapping (bytes32 => Content) private storedData;
    mapping (bytes32 => UserAddressList) private usersAddress;
    mapping (address => UserNameList) private usersName;
    address private owner;
        
    struct Content {
        bytes32 hashmsg;
        address registrar;
        uint creationDate;
    }
    
    struct Registrar {
        string[] messages;
    }
    
    struct UserAddressList {
        address userAddress;
    }
    struct UserNameList {
        string userName;
    }
    constructor () public {
        owner = msg.sender;
    }
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
    
    function setNewUser (string memory _name) public {
        bytes32 hashName = keccak256(abi.encodePacked(_name));
        require(usersAddress[hashName].userAddress == address(0) && keccak256(abi.encodePacked(usersName[msg.sender].userName)) == keccak256(""));
        usersAddress[hashName].userAddress = msg.sender;
        usersName[msg.sender].userName = _name;
    }
    
    function getUserAddress (string memory _name) public view returns (address){
        bytes32 hashName = keccak256(abi.encodePacked(_name));
        return usersAddress[hashName].userAddress;
    }
    
    function getUserName () public view returns (string memory){
       
        return usersName[msg.sender].userName;
    }
    
    function setContent (string memory _url, string memory _msg) public {
       bytes32 url = keccak256(abi.encodePacked(_url));
       
       require(storedData[url].registrar == address(0));
        
       userContent[msg.sender].messages.push(_url) - 1;
       
       storedData[url].hashmsg = keccak256(abi.encodePacked(_msg));
       storedData[url].registrar = msg.sender;
       storedData[url].creationDate = block.timestamp;

    }
    
    function checkIntegrity (string memory _url, string memory _msg, address _user) public view returns (bool) {
        
        bool result = false;
        
        if (keccak256(abi.encodePacked(_msg)) == storedData[keccak256(abi.encodePacked(_url))].hashmsg && _user == storedData[keccak256(abi.encodePacked(_url))].registrar) {
            result = true;
        }
        
        return result;
       
    }
    
    function getInfo(string memory _url) public view returns (bytes32, address, uint) {
        
        bytes32 url = keccak256(abi.encodePacked(_url));
        
        return (storedData[url].hashmsg,
                storedData[url].registrar,
                storedData[url].creationDate
                );
        
    }
    function getMyMessages (uint i) public view returns (string memory) {
        
        return userContent[msg.sender].messages[i];
        
    }
    
    function getMyNumberOfMessages () public view returns (uint) {
        
        return userContent[msg.sender].messages.length;
    }

}
