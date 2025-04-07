# LED-UP Smart Contract Libraries

This directory contains utility libraries for the LED-UP smart contracts. These libraries provide reusable functions that can be used across multiple contracts to reduce code duplication and improve gas efficiency.

## Libraries

### StorageLib

The `StorageLib` library contains common data structures used across contracts. It centralizes data structures to ensure consistency and reduce redundancy.

Key features:

- Optimized data structures for DID documents, consent records, payments, and health records
- Reduced storage costs through packed data types
- Consistent structure definitions across contracts

### GasLib

The `GasLib` library contains gas optimization utilities. It provides functions to optimize gas usage in contracts.

Key features:

- Functions for packing and unpacking boolean flags
- Functions for packing and unpacking multiple values into a single storage slot
- Utilities for efficient bit manipulation

### StringLib

The `StringLib` library contains string manipulation utilities. It provides functions for efficient string operations.

Key features:

- String comparison and concatenation
- String conversion utilities
- Substring extraction

### EventLib

The `EventLib` library contains utilities for event-based storage. It provides functions for using events as a cheaper alternative to storage.

Key features:

- Functions for computing unique event identifiers
- Utilities for event-based storage patterns
- Support for various event types (DID, record, consent, payment)

### SecurityLib

The `SecurityLib` library contains security utilities. It provides functions for enhancing the security of contracts.

Key features:

- Signature validation
- Timestamp validation
- Nonce validation
- Message hash computation

### ValidationLib

The `ValidationLib` library contains validation utilities. It provides functions for validating inputs and states.

Key features:

- DID format validation
- Address validation
- String validation
- Range validation
- Record ID and metadata validation

### MathLib

The `MathLib` library contains mathematical utilities. It provides functions for efficient mathematical operations.

Key features:

- Percentage calculation
- Min/max functions
- Average calculation
- Ceiling division

## Usage

To use these libraries, import them in your contract:

```solidity
import {StorageLib} from "../libraries/StorageLib.sol";
import {GasLib} from "../libraries/GasLib.sol";
import {StringLib} from "../libraries/StringLib.sol";
import {EventLib} from "../libraries/EventLib.sol";
import {SecurityLib} from "../libraries/SecurityLib.sol";
import {ValidationLib} from "../libraries/ValidationLib.sol";
import {MathLib} from "../libraries/MathLib.sol";

contract MyContract {
    // Use the library functions
    function myFunction() external {
        uint256 percentage = MathLib.calculatePercentage(100, 10); // 10% of 100 = 10
        bool isValid = ValidationLib.validateAddress(msg.sender);
    }
}
```

## License

All libraries in this directory are licensed under the MIT License.
