// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Crowdfunding {
    struct Project {
        uint256 id;
        string title;
        string description;
        uint256 fundingGoal;
        uint256 currentFunding;
        uint256 deadline;
        string imageUrl;
        string category;
        address creator;
        bool isFunded;
        bool isExpired;
    }

    struct Backer {
        address backerAddress;
        uint256 amount;
        uint256 timestamp;
    }

    Project[] public projects;
    mapping(uint256 => Backer[]) public backers;
    uint256 public projectCount;

    event ProjectCreated(uint256 indexed projectId, string title, address creator);
    event ProjectFunded(uint256 indexed projectId, address backer, uint256 amount);
    event FundsWithdrawn(uint256 indexed projectId, address creator);

    function createProject(
        string memory _title,
        string memory _description,
        uint256 _fundingGoal,
        uint256 _deadline,
        string memory _imageUrl,
        string memory _category
    ) public returns (uint256) {
        require(_fundingGoal > 0, "Funding goal must be greater than 0");
        require(_deadline > block.timestamp, "Deadline must be in the future");

        uint256 projectId = projectCount++;
        projects.push(Project({
            id: projectId,
            title: _title,
            description: _description,
            fundingGoal: _fundingGoal,
            currentFunding: 0,
            deadline: _deadline,
            imageUrl: _imageUrl,
            category: _category,
            creator: msg.sender,
            isFunded: false,
            isExpired: false
        }));

        emit ProjectCreated(projectId, _title, msg.sender);
        return projectId;
    }

    function getProjects() public view returns (Project[] memory) {
        return projects;
    }

    function getProject(uint256 _projectId) public view returns (Project memory) {
        require(_projectId < projects.length, "Project does not exist");
        return projects[_projectId];
    }

    function fundProject(uint256 _projectId) public payable {
        require(_projectId < projects.length, "Project does not exist");
        require(msg.value > 0, "Funding amount must be greater than 0");
        require(!projects[_projectId].isExpired, "Project has expired");
        require(!projects[_projectId].isFunded, "Project is already funded");

        Project storage project = projects[_projectId];
        project.currentFunding += msg.value;

        backers[_projectId].push(Backer({
            backerAddress: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp
        }));

        if (project.currentFunding >= project.fundingGoal) {
            project.isFunded = true;
        }

        emit ProjectFunded(_projectId, msg.sender, msg.value);
    }

    function withdrawFunds(uint256 _projectId) public {
        require(_projectId < projects.length, "Project does not exist");
        require(projects[_projectId].creator == msg.sender, "Only creator can withdraw");
        require(projects[_projectId].isFunded, "Project is not funded");
        require(!projects[_projectId].isExpired, "Project has expired");

        uint256 amount = projects[_projectId].currentFunding;
        projects[_projectId].currentFunding = 0;
        projects[_projectId].isExpired = true;

        payable(msg.sender).transfer(amount);
        emit FundsWithdrawn(_projectId, msg.sender);
    }

    function getBackers(uint256 _projectId) public view returns (Backer[] memory) {
        require(_projectId < projects.length, "Project does not exist");
        return backers[_projectId];
    }

    function isProjectCreator(uint256 _projectId) public view returns (bool) {
        require(_projectId < projects.length, "Project does not exist");
        return projects[_projectId].creator == msg.sender;
    }

    function isProjectBacker(uint256 _projectId) public view returns (bool) {
        require(_projectId < projects.length, "Project does not exist");
        for (uint i = 0; i < backers[_projectId].length; i++) {
            if (backers[_projectId][i].backerAddress == msg.sender) {
                return true;
            }
        }
        return false;
    }
} 