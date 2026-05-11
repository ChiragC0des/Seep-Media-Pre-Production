# Security Specification for Seep Media

## Data Invariants
1. A Character must have a name, archetype, and creator.
2. A Workflow must have a name and creator.
3. A Scene must belong to an existing Workflow.
4. Only the creator of a resource can modify or delete it.
5. Timestamps must be handled on the server.

## The "Dirty Dozen" Payloads (Identity & Integrity Test Cases)
1. **Identity Spoofing**: Creating a character with a `createdBy` field that doesn't match the auth UID. (DENIED)
2. **Resource Poisoning**: Creating a character with a 1MB string as name. (DENIED)
3. **Ghost Field Mutation**: Updating a character with an unauthorized field like `isVerified: true`. (DENIED)
4. **Illegal ID Infiltration**: Using a non-alphanumeric character in a document ID. (DENIED)
5. **PII Blanket Read**: Attempting to list all characters without being the owner. (DENIED)
6. **Immutable Field Attack**: Attempting to change `createdBy` on an existing character. (DENIED)
7. **Temporal Fraud**: Sending a future timestamp as `createdAt`. (DENIED)
8. **Relation Hijacking**: Creating a scene for a workflow owned by someone else. (DENIED)
9. **Terminal State Lockdown**: (N/A for current entities, but reserved for outcome statuses).
10. **Shadow ID Write**: Writing to a hidden subcollection that wasn't declared. (DENIED)
11. **Email Spoofing**: Claiming administrator rights without a verified email (if admin logic added). (DENIED)
12. **Denial of Wallet**: Deeply nested list query without filtering (handled by rule enforcement). (DENIED)
