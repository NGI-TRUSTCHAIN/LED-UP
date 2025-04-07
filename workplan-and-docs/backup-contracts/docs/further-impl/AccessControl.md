# LED-UP DID Access Control System Architecture

## Overview

This document provides a comprehensive architectural overview of the LED-UP DID Access Control system, which is designed to provide decentralized, role-based access control for the LED-UP platform. The system leverages blockchain technology to enable secure, verifiable, and flexible access management based on Decentralized Identifiers (DIDs).

The access control system is built on several core components:

1. **IDidAccessControl Interface** - Defines the standard contract interface for DID-based access control
2. **DidAccessControlCore** - Implements the core access control functionality
3. **DidAccessControlOptimized** - Provides a gas-optimized implementation for production use

## System Architecture

```mermaid
flowchart TB
    subgraph "Access Control System"
        direction TB
        IDidAccessControl["IDidAccessControl Interface"]
        DidAccessControlCore["DidAccessControlCore"]
        DidAccessControlOptimized["DidAccessControlOptimized"]

        IDidAccessControl -.implements.-> DidAccessControlCore
        IDidAccessControl -.implements.-> DidAccessControlOptimized
    end

    subgraph "External Components"
        direction TB
        DidRegistry["DID Registry"]
        DidAuth["DID Authentication"]
        DataRegistry["Data Registry"]
        Consent["Consent Management"]
    end

    subgraph "Utility Libraries"
        direction TB
        GasLib["Gas Library"]
        ValidationLib["Validation Library"]
        SecurityLib["Security Library"]
        BaseContract["Base Contract"]
    end

    DidAccessControlCore --> DidRegistry
    DidAccessControlOptimized --> DidRegistry
    DidAccessControlOptimized -.uses.-> GasLib
    DidAccessControlCore -.uses.-> ValidationLib
    DidAccessControlCore -.inherits.-> BaseContract

    DidAuth -.uses.-> DidAccessControlCore
    DataRegistry -.uses.-> DidAccessControlCore
    Consent -.uses.-> DidAccessControlCore

    classDef interface fill:#f9f,stroke:#333,stroke-width:2px;
    classDef core fill:#bbf,stroke:#333,stroke-width:2px;
    classDef optimized fill:#bfb,stroke:#333,stroke-width:2px;
    classDef external fill:#fbb,stroke:#333,stroke-width:2px;
    classDef utility fill:#ffb,stroke:#333,stroke-width:2px;

    class IDidAccessControl interface;
    class DidAccessControlCore core;
    class DidAccessControlOptimized optimized;
    class DidRegistry,DidAuth,DataRegistry,Consent external;
    class GasLib,ValidationLib,SecurityLib,BaseContract utility;
```

## Component Details

### 1. IDidAccessControl Interface

The `IDidAccessControl` interface defines the standard contract interface for DID-based access control in the LED-UP ecosystem. It establishes a consistent API for access control operations across different implementations.

#### Key Features:

- **Role Management**: Create, activate, and deactivate roles
- **Role Assignment**: Grant and revoke roles to DIDs
- **Role Verification**: Check if a DID has a specific role
- **Role Querying**: Get information about roles and role assignments

#### Interface Definition:

```solidity
interface IDidAccessControl {
    function createRole(bytes32 role, string calldata name, string calldata description) external;
    function grantRole(string calldata did, bytes32 role) external;
    function revokeRole(string calldata did, bytes32 role) external;
    function hasRole(string calldata did, bytes32 role) external view returns (bool);
    function getDidRegistryAddress() external view returns (address);
}
```

### 2. DidAccessControlCore

The `DidAccessControlCore` contract implements the core functionality defined in the `IDidAccessControl` interface. It provides the fundamental access control mechanisms for the LED-UP platform.

#### Key Features:

- **Role Definitions**: Define roles with names, descriptions, and active status
- **Role Requirements**: Set requirements for roles (e.g., required credentials)
- **Role Assignment**: Assign roles to DIDs and track assignments
- **Role Verification**: Verify if a DID has a specific role
- **Role Querying**: Query roles and role assignments

#### Data Structures:

```solidity
// Role structure
struct Role {
    bytes32 id;
    string name;
    string description;
    uint256 createdAt;
    bool active;
}

// Role storage
mapping(bytes32 => Role) private roles;
bytes32[] private roleIds;

// Role assignments
mapping(string => mapping(bytes32 => bool)) private didRoles;

// Role assignments by DID
mapping(string => bytes32[]) private didRolesList;

// Role assignments by role
mapping(bytes32 => string[]) private roleDids;
```

### 3. DidAccessControlOptimized

The `DidAccessControlOptimized` contract provides a gas-optimized implementation of the access control functionality. It uses bit manipulation and other gas optimization techniques to reduce transaction costs.

#### Key Features:

- **Bit-Packed Role Flags**: Store multiple role assignments in a single storage slot
- **Hashed DIDs**: Use hashed DIDs as keys to reduce storage costs
- **Predefined Roles**: Use predefined role constants to reduce gas costs
- **Optimized Role Checks**: Efficient role checking using bit operations

#### Gas Optimization Techniques:

```solidity
// Role flags
uint8 private constant ROLE_ADMIN = 0;
uint8 private constant ROLE_OPERATOR = 1;
uint8 private constant ROLE_PRODUCER = 2;
uint8 private constant ROLE_CONSUMER = 3;
uint8 private constant ROLE_SERVICE_PROVIDER = 4;

// Role requirements - optimized using bytes32 for requirement hashes
mapping(bytes32 => bytes32) private roleRequirements;

// DID-based role assignments - optimized using bytes32 for DID hashes and uint256 for role flags
mapping(bytes32 => uint256) private didRoleFlags;
```

## Access Control Flows

### 1. Role Creation

```mermaid
sequenceDiagram
    actor Admin
    participant AC as Access Control

    Admin->>AC: createRole(roleId, name, description)
    AC->>AC: Check if role already exists

    alt Role does not exist
        AC->>AC: Create new role
        AC->>AC: Store role details
        AC->>AC: Emit RoleCreated event
        AC-->>Admin: Role created successfully
    else Role already exists
        AC-->>Admin: Revert with RoleAlreadyExists error
    end
```

### 2. Role Assignment

```mermaid
sequenceDiagram
    actor Admin
    participant AC as Access Control
    participant DR as DID Registry

    Admin->>AC: grantRole(did, role)
    AC->>DR: Check if DID exists and is active
    DR-->>AC: DID status

    alt DID is valid and role exists
        AC->>AC: Check if DID already has role

        alt DID does not have role
            AC->>AC: Assign role to DID
            AC->>AC: Update role assignments
            AC->>AC: Emit RoleGranted event
            AC-->>Admin: Role granted successfully
        else DID already has role
            AC-->>Admin: No action needed
        end
    else DID is invalid or role does not exist
        AC-->>Admin: Revert with appropriate error
    end
```

### 3. Role Verification

```mermaid
sequenceDiagram
    actor User
    participant App as Client Application
    participant AC as Access Control
    participant DR as DID Registry

    User->>App: Request access to resource
    App->>AC: hasRole(userDid, requiredRole)
    AC->>DR: Check if DID exists
    DR-->>AC: DID status

    alt DID exists
        AC->>AC: Check if role exists

        alt Role exists
            AC->>AC: Check if DID has role and role is active
            AC-->>App: Return role status
        else Role does not exist
            AC-->>App: Revert with RoleNotFound error
        end
    else DID does not exist
        AC-->>App: Revert with InvalidDID error
    end

    alt DID has required role
        App->>App: Grant access to resource
        App-->>User: Access granted
    else DID does not have required role
        App-->>User: Access denied
    end
```

### 4. Role Revocation

```mermaid
sequenceDiagram
    actor Admin
    participant AC as Access Control
    participant DR as DID Registry

    Admin->>AC: revokeRole(did, role)
    AC->>DR: Check if DID exists
    DR-->>AC: DID status

    alt DID exists and role exists
        AC->>AC: Check if DID has role

        alt DID has role
            AC->>AC: Remove role from DID
            AC->>AC: Update role assignments
            AC->>AC: Emit RoleRevoked event
            AC-->>Admin: Role revoked successfully
        else DID does not have role
            AC-->>Admin: No action needed
        end
    else DID is invalid or role does not exist
        AC-->>Admin: Revert with appropriate error
    end
```

## Integration with LED-UP Ecosystem

The access control system integrates with the broader LED-UP ecosystem through interactions with other core components:

```mermaid
flowchart TB
    subgraph "Access Control System"
        direction TB
        AccessControl["DID Access Control"]
    end

    subgraph "Core LED-UP Components"
        direction TB
        DidReg["DID Registry"]
        DidAuth["DID Authentication"]
        DataReg["Data Registry"]
        Consent["Consent Management"]
        Comp["Compensation"]
    end

    subgraph "Client Applications"
        direction TB
        Producer["Producer App"]
        Consumer["Consumer App"]
        Provider["Provider App"]
    end

    Producer --> DidAuth
    Consumer --> DidAuth
    Provider --> DidAuth

    DidAuth --> AccessControl
    DataReg --> AccessControl
    Consent --> AccessControl
    Comp --> AccessControl

    AccessControl --> DidReg

    classDef access fill:#f9f,stroke:#333,stroke-width:2px;
    classDef core fill:#bbf,stroke:#333,stroke-width:2px;
    classDef client fill:#bfb,stroke:#333,stroke-width:2px;

    class AccessControl access;
    class DidReg,DidAuth,DataReg,Consent,Comp core;
    class Producer,Consumer,Provider client;
```

## Role-Based Access Control Model

The LED-UP access control system implements a role-based access control (RBAC) model with DID-based identities:

```mermaid
flowchart TB
    subgraph "Roles"
        direction TB
        Admin["Admin Role"]
        Operator["Operator Role"]
        Producer["Producer Role"]
        Consumer["Consumer Role"]
        Provider["Service Provider Role"]
    end

    subgraph "Permissions"
        direction TB
        ManageRoles["Manage Roles"]
        ManageDIDs["Manage DIDs"]
        SubmitData["Submit Data"]
        AccessData["Access Data"]
        ProvideServices["Provide Services"]
    end

    subgraph "DIDs"
        direction TB
        AdminDID["Admin DIDs"]
        OperatorDID["Operator DIDs"]
        ProducerDID["Producer DIDs"]
        ConsumerDID["Consumer DIDs"]
        ProviderDID["Provider DIDs"]
    end

    Admin --> ManageRoles
    Admin --> ManageDIDs
    Operator --> ManageDIDs
    Producer --> SubmitData
    Consumer --> AccessData
    Provider --> ProvideServices

    AdminDID --> Admin
    OperatorDID --> Operator
    ProducerDID --> Producer
    ConsumerDID --> Consumer
    ProviderDID --> Provider

    classDef role fill:#f96,stroke:#333,stroke-width:2px;
    classDef permission fill:#9f6,stroke:#333,stroke-width:2px;
    classDef did fill:#69f,stroke:#333,stroke-width:2px;

    class Admin,Operator,Producer,Consumer,Provider role;
    class ManageRoles,ManageDIDs,SubmitData,AccessData,ProvideServices permission;
    class AdminDID,OperatorDID,ProducerDID,ConsumerDID,ProviderDID did;
```

## Security Considerations

The access control system implements several security measures to ensure the integrity and confidentiality of the access control process:

```mermaid
flowchart LR
    subgraph "Security Measures"
        direction TB
        S1["Role-based Access Control"]
        S2["DID Validation"]
        S3["Role Requirements"]
        S4["Role Activation/Deactivation"]
        S5["Admin-only Role Management"]
        S6["Event Logging"]
    end

    subgraph "Threats Mitigated"
        direction TB
        T1["Unauthorized Access"]
        T2["Invalid Identity"]
        T3["Privilege Escalation"]
        T4["Role Abuse"]
        T5["Unauthorized Role Changes"]
        T6["Audit Trail Tampering"]
    end

    S1 --> T1
    S2 --> T2
    S3 --> T3
    S4 --> T4
    S5 --> T5
    S6 --> T6

    classDef security fill:#f96,stroke:#333,stroke-width:2px;
    classDef threat fill:#b9f,stroke:#333,stroke-width:2px;

    class S1,S2,S3,S4,S5,S6 security;
    class T1,T2,T3,T4,T5,T6 threat;
```

### Key Security Features:

1. **Role-based Access Control**: Restricts access to functions based on assigned roles
2. **DID Validation**: Ensures DIDs are valid and active before role assignment
3. **Role Requirements**: Allows setting requirements for roles (e.g., required credentials)
4. **Role Activation/Deactivation**: Enables disabling roles without removing assignments
5. **Admin-only Role Management**: Restricts role management to admin users
6. **Event Logging**: Logs all role-related actions for audit purposes

## Architectural Assessment

### Strengths

1. **Flexible Role Management**: The system allows for dynamic creation and management of roles.
2. **DID Integration**: Seamless integration with the DID system for identity verification.
3. **Optimized Implementation**: Gas-optimized implementation for production use.
4. **Comprehensive Role Tracking**: Tracks role assignments by both DID and role.
5. **Role Requirements**: Supports setting requirements for roles.

### Areas for Improvement

1. **Role Hierarchy**: The current implementation does not support role hierarchies or inheritance.
2. **Credential Verification**: The role requirement verification is currently a placeholder.
3. **Delegation**: No support for delegating role-based permissions.
4. **Temporal Constraints**: No support for time-limited role assignments.
5. **Fine-grained Permissions**: Roles are binary (granted or not) without support for fine-grained permissions.

## Recommendations for Enhancement

### 1. Implement Role Hierarchy

Enhance the system with role hierarchy support to allow roles to inherit permissions from parent roles.

```solidity
// Role hierarchy
mapping(bytes32 => bytes32) private roleParents;

// Check if a DID has a role or any parent role
function hasRoleOrParent(string calldata did, bytes32 role) external view returns (bool) {
    if (hasRole(did, role)) {
        return true;
    }

    bytes32 parentRole = roleParents[role];
    while (parentRole != bytes32(0)) {
        if (hasRole(did, parentRole)) {
            return true;
        }
        parentRole = roleParents[parentRole];
    }

    return false;
}
```

### 2. Implement Credential Verification

Enhance the role requirement verification to check for specific credentials.

```mermaid
sequenceDiagram
    actor Admin
    participant AC as Access Control
    participant DR as DID Registry
    participant DV as DID Verifier

    Admin->>AC: grantRole(did, role)
    AC->>DR: Check if DID exists and is active
    DR-->>AC: DID status

    alt DID is valid and role exists
        AC->>AC: Get role requirements

        alt Role has requirements
            AC->>DV: verifyCredential(did, requirementType, requirementId)
            DV-->>AC: Verification result

            alt Credential verified
                AC->>AC: Assign role to DID
                AC->>AC: Emit RoleGranted event
                AC-->>Admin: Role granted successfully
            else Credential not verified
                AC-->>Admin: Revert with MissingRequirement error
            end
        else Role has no requirements
            AC->>AC: Assign role to DID
            AC->>AC: Emit RoleGranted event
            AC-->>Admin: Role granted successfully
        end
    else DID is invalid or role does not exist
        AC-->>Admin: Revert with appropriate error
    end
```

### 3. Implement Role Delegation

Allow DIDs to delegate their roles to other DIDs for specific purposes.

```solidity
// Delegation structure
struct Delegation {
    string delegator;
    string delegate;
    bytes32 role;
    uint256 expiresAt;
    bool active;
}

// Delegation storage
mapping(bytes32 => Delegation) private delegations;

// Delegate a role
function delegateRole(string calldata delegator, string calldata delegate, bytes32 role, uint256 duration)
    external
    didExists(delegator)
    didExists(delegate)
    roleExists(role)
{
    // Check if the delegator has the role
    if (!hasRole(delegator, role)) {
        revert DidAccessControl__Unauthorized();
    }

    // Create delegation
    bytes32 delegationId = keccak256(abi.encodePacked(delegator, delegate, role));
    delegations[delegationId] = Delegation({
        delegator: delegator,
        delegate: delegate,
        role: role,
        expiresAt: block.timestamp + duration,
        active: true
    });

    emit RoleDelegated(delegator, delegate, role, block.timestamp + duration);
}

// Check if a delegation is valid
function hasDelegatedRole(string calldata delegate, bytes32 role) external view returns (bool) {
    for (uint256 i = 0; i < delegations.length; i++) {
        Delegation memory delegation = delegations[i];
        if (
            keccak256(bytes(delegation.delegate)) == keccak256(bytes(delegate)) &&
            delegation.role == role &&
            delegation.active &&
            delegation.expiresAt > block.timestamp
        ) {
            return true;
        }
    }

    return false;
}
```

### 4. Implement Temporal Constraints

Add support for time-limited role assignments.

```solidity
// Time-limited role assignment structure
struct TimedRole {
    bytes32 role;
    uint256 expiresAt;
    bool active;
}

// Time-limited role assignments
mapping(string => mapping(bytes32 => TimedRole)) private timedRoles;

// Grant a time-limited role
function grantTimedRole(string calldata did, bytes32 role, uint256 duration)
    external
    didExists(did)
    roleExists(role)
    onlyOwner
{
    timedRoles[did][role] = TimedRole({
        role: role,
        expiresAt: block.timestamp + duration,
        active: true
    });

    emit TimedRoleGranted(did, role, block.timestamp + duration);
}

// Check if a DID has a valid timed role
function hasValidTimedRole(string calldata did, bytes32 role) external view returns (bool) {
    TimedRole memory timedRole = timedRoles[did][role];
    return timedRole.active && timedRole.expiresAt > block.timestamp;
}
```

### 5. Implement Fine-grained Permissions

Enhance the system with fine-grained permissions within roles.

```solidity
// Permission structure
struct Permission {
    bytes32 id;
    string name;
    string description;
    bool active;
}

// Role-permission assignments
mapping(bytes32 => mapping(bytes32 => bool)) private rolePermissions;

// Grant a permission to a role
function grantPermissionToRole(bytes32 role, bytes32 permission)
    external
    roleExists(role)
    permissionExists(permission)
    onlyOwner
{
    rolePermissions[role][permission] = true;

    emit PermissionGranted(role, permission);
}

// Check if a role has a permission
function roleHasPermission(bytes32 role, bytes32 permission) external view returns (bool) {
    return rolePermissions[role][permission];
}

// Check if a DID has a permission
function didHasPermission(string calldata did, bytes32 permission) external view returns (bool) {
    for (uint256 i = 0; i < roleIds.length; i++) {
        bytes32 role = roleIds[i];
        if (hasRole(did, role) && roleHasPermission(role, permission)) {
            return true;
        }
    }

    return false;
}
```

## Conclusion

The LED-UP DID Access Control system provides a robust foundation for role-based access control in the LED-UP ecosystem. The modular architecture, with both standard and optimized implementations, allows for flexibility and efficiency while maintaining a consistent interface.

The system implements several security measures to ensure the integrity and confidentiality of the access control process, including role-based access control, DID validation, role requirements, role activation/deactivation, admin-only role management, and event logging.

While the current implementation provides a solid foundation, there are several areas for enhancement, including role hierarchy, credential verification, delegation, temporal constraints, and fine-grained permissions. By implementing these enhancements, the LED-UP DID Access Control system can provide even stronger security guarantees while maintaining flexibility and usability for the LED-UP ecosystem.
