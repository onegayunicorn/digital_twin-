// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * Sovereign Registry — Immutable record of project releases
 *
 * Provides verifiable provenance for project versions,
 * linking on-chain records to off-chain content (IPFS CIDs).
 */
contract SovereignRegistry {
    struct Record {
        string projectId;
        string version;
        uint256 timestamp;
        string cid;
        address publisher;
    }

    mapping(string => Record[]) public records;

    event RecordAdded(
        string indexed projectId,
        string version,
        string cid,
        address publisher
    );

    /**
     * Add a new release record to the registry.
     * @param projectId Unique project identifier
     * @param version Semantic version string
     * @param cid IPFS content identifier of the release artifact
     */
    function addRecord(
        string memory projectId,
        string memory version,
        string memory cid
    ) public {
        records[projectId].push(Record({
            projectId: projectId,
            version: version,
            timestamp: block.timestamp,
            cid: cid,
            publisher: msg.sender
        }));

        emit RecordAdded(projectId, version, cid, msg.sender);
    }

    /**
     * Get all records for a project.
     * @param projectId Unique project identifier
     * @return Array of release records
     */
    function getRecords(string memory projectId)
        public
        view
        returns (Record[] memory)
    {
        return records[projectId];
    }

    /**
     * Get the latest record for a project.
     * @param projectId Unique project identifier
     * @return Most recent release record
     */
    function getLatestRecord(string memory projectId)
        public
        view
        returns (Record memory)
    {
        Record[] storage projectRecords = records[projectId];
        require(projectRecords.length > 0, "No records found");
        return projectRecords[projectRecords.length - 1];
    }

    /**
     * Get the number of records for a project.
     * @param projectId Unique project identifier
     * @return Count of records
     */
    function getRecordCount(string memory projectId)
        public
        view
        returns (uint256)
    {
        return records[projectId].length;
    }
}
