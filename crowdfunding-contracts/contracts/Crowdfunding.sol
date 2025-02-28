// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Crowdfunding {
    struct Project {
        uint id;
        address creator;
        string title;
        string description;
        string imageUrl;
        uint fundingGoal;
        uint amountRaised;
        uint deadline;
        bool completed;
        bool funded;
    }

    mapping(uint => Project) public projects;
    mapping(uint => mapping(address => uint)) public contributions;
    uint public projectCount = 0;

    event ProjectCreated(
        uint id,
        address creator,
        string title,
        string description,
        string imageUrl,
        uint fundingGoal,
        uint deadline
    );

    event ProjectFunded(uint id, uint amount, address contributor);
    event FundsWithdrawn(uint id, uint amount);
    event RefundClaimed(uint id, address contributor, uint amount);

    function createProject(
        string memory _title,
        string memory _description,
        string memory _imageUrl,
        uint _fundingGoal,
        uint _durationInDays
    ) public {
        require(_fundingGoal > 0, "Funding goal must be greater than 0");
        require(_durationInDays > 0, "Duration must be greater than 0");

        uint deadline = block.timestamp + (_durationInDays * 1 days);
        
        projectCount++;
        projects[projectCount] = Project(
            projectCount,
            msg.sender,
            _title,
            _description,
            _imageUrl,
            _fundingGoal,
            0,
            deadline,
            false,
            false
        );

        emit ProjectCreated(
            projectCount,
            msg.sender,
            _title,
            _description,
            _imageUrl,
            _fundingGoal,
            deadline
        );
    }

    function fundProject(uint _projectId) public payable {
        Project storage project = projects[_projectId];
        
        require(project.id != 0, "Project does not exist");
        require(block.timestamp < project.deadline, "Project funding deadline has passed");
        require(!project.completed, "Project is already completed");
        require(msg.value > 0, "Funding amount must be greater than 0");

        contributions[_projectId][msg.sender] += msg.value;
        project.amountRaised += msg.value;

        emit ProjectFunded(_projectId, msg.value, msg.sender);

        if (project.amountRaised >= project.fundingGoal) {
            project.funded = true;
        }
    }

    function withdrawFunds(uint _projectId) public {
        Project storage project = projects[_projectId];
        
        require(project.id != 0, "Project does not exist");
        require(project.creator == msg.sender, "Only the creator can withdraw funds");
        require(project.amountRaised >= project.fundingGoal, "Funding goal not reached");
        require(!project.completed, "Funds already withdrawn");
        
        project.completed = true;
        payable(project.creator).transfer(project.amountRaised);
        
        emit FundsWithdrawn(_projectId, project.amountRaised);
    }

    function claimRefund(uint _projectId) public {
        Project storage project = projects[_projectId];
        
        require(project.id != 0, "Project does not exist");
        require(block.timestamp >= project.deadline, "Project funding period not yet over");
        require(!project.funded, "Project was successfully funded");
        require(!project.completed, "Refunds already processed");
        require(contributions[_projectId][msg.sender] > 0, "No contribution to refund");
        
        uint amount = contributions[_projectId][msg.sender];
        contributions[_projectId][msg.sender] = 0;
        
        payable(msg.sender).transfer(amount);
        
        emit RefundClaimed(_projectId, msg.sender, amount);
    }

    function getProject(uint _projectId) public view returns (
        uint id,
        address creator,
        string memory title,
        string memory description,
        string memory imageUrl,
        uint fundingGoal,
        uint amountRaised,
        uint deadline,
        bool completed,
        bool funded
    ) {
        Project memory project = projects[_projectId];
        return (
            project.id,
            project.creator,
            project.title,
            project.description,
            project.imageUrl,
            project.fundingGoal,
            project.amountRaised,
            project.deadline,
            project.completed,
            project.funded
        );
    }

    function getContribution(uint _projectId, address _contributor) public view returns (uint) {
        return contributions[_projectId][_contributor];
    }
}