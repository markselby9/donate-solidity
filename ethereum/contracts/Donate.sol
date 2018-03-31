pragma solidity ^0.4.1;

contract DonateFactory {
    address[] public donateProjects; // a list of created donate project contract instances

    function createDonateProject(uint minimum) public {
        address newAddress = new DonateProject(minimum, msg.sender);
        donateProjects.push(newAddress);
    }

    function getAllDonateProjects() public view returns (address[]) {
        return donateProjects;
    }
}

contract DonateProject {
    struct Request {
        string purpose;
        uint amount;
        address receipient;
        bool isComplete;
        mapping(address => bool) approvals;
        uint approvalCount;
    }

    Request[] public donateRequests;
    address public manager;
    uint public minimumDonateValue;
    mapping(address => bool) public donators;
    uint public donatorCount;

    // constructor
    function DonateProject(uint minimum, address creator) public {
        // manager = msg.sender;
        manager = creator;
        minimumDonateValue = minimum;
    }

    function donate() public payable {
        require(msg.value >= minimumDonateValue);
        donators[msg.sender] = true;
        donatorCount += 1;
    }

    function createRequest(string purpose, uint amount,
        address receipient ) public restricted {
        // storage? memory?
        Request memory newRequest = Request({
            purpose: purpose,
            amount: amount,
            receipient: receipient,
            isComplete: false,
            approvalCount: 0
            });
        donateRequests.push(newRequest);
    }

    // approve donate request from donators
    function approveRequest(uint index) public {
        Request storage request = donateRequests[index];
        require(donators[msg.sender]);
        require(request.approvals[msg.sender] != true);

        request.approvals[msg.sender] = true;
        request.approvalCount += 1;
    }

    // Manager can finalize the request if it got more than half votes
    function finalizeRequest(uint index) public restricted {
        Request storage request = donateRequests[index];
        require(request.isComplete != true);
        require(request.approvalCount > donatorCount / 2);

        request.isComplete = true;
        request.receipient.transfer(request.amount);
    }

    modifier restricted() {
        require(msg.sender == manager);
        _;
    }
}