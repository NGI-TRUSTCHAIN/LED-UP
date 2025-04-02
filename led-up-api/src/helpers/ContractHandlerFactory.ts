import { Contract } from 'ethers';

import { BaseErrorHandler } from './error-handler/BaseErrorHandler';
// Import all contract-specific handlers
import { CompensationErrorHandler } from './error-handler/CompensationErrorHandler';
import { ConsentErrorHandler } from './error-handler/ConsentErrorHandler';
import { DataRegistryErrorHandler } from './error-handler/DataRegistryErrorHandler';
import { DidAccessControlErrorHandler } from './error-handler/DidAccessControlErrorHandler';
import { DidAuthErrorHandler } from './error-handler/DidAuthErrorHandler';
import { DidIssuerErrorHandler } from './error-handler/DidIssuerErrorHandler';
import { DidRegistryErrorHandler } from './error-handler/DidRegistryErrorHandler';
import { DidVerifierErrorHandler } from './error-handler/DidVerifierErrorHandler';
import { TokenErrorHandler } from './error-handler/TokenErrorHandler';
import { ZKPErrorHandler } from './error-handler/ZKPErrorHandler';
import { BaseEventParser } from './event-parser/BaseEventParser';
// Import all contract-specific parsers
import { CompensationEventParser } from './event-parser/CompensationEventParser';
import { ConsentEventParser } from './event-parser/ConsentEventParser';
import { DataRegistryEventParser } from './event-parser/DataRegistryEventParser';
import { DidAccessControlEventParser } from './event-parser/DidAccessControlEventParser';
import { DidAuthEventParser } from './event-parser/DidAuthEventParser';
import { DidIssuerEventParser } from './event-parser/DidIssuerEventParser';
import { DidRegistryEventParser } from './event-parser/DidRegistryEventParser';
import { DidVerifierEventParser } from './event-parser/DidVerifierEventParser';
import { TokenEventParser } from './event-parser/TokenEventParser';
import { ZKPEventParser } from './event-parser/ZKPEventParser';

/**
 * Contract types supported by the factory
 */
export enum ContractType {
  DATA_REGISTRY = 'DataRegistry',
  COMPENSATION = 'Compensation',
  CONSENT = 'Consent',
  DID_ACCESS_CONTROL = 'DidAccessControl',
  DID_AUTH = 'DidAuth',
  DID_ISSUER = 'DidIssuer',
  DID_REGISTRY = 'DidRegistry',
  DID_VERIFIER = 'DidVerifier',
  TOKEN = 'Token',
  ZKP = 'ZKP',
  ZKP_VERIFICATION_REGISTRY = 'ZKPVerificationRegistry',
}

/**
 * Factory class for creating contract-specific error handlers and event parsers
 */
export class ContractHandlerFactory {
  /**
   * Creates an error handler for the specified contract type
   * @param contractType The type of contract
   * @param contract The contract instance
   * @returns An error handler for the specified contract
   */
  public static createErrorHandler(
    contractType: ContractType,
    contract: Contract
  ): BaseErrorHandler {
    switch (contractType) {
      case ContractType.DATA_REGISTRY:
        return new DataRegistryErrorHandler(contract);
      case ContractType.COMPENSATION:
        return new CompensationErrorHandler(contract);
      case ContractType.CONSENT:
        return new ConsentErrorHandler(contract);
      case ContractType.DID_ACCESS_CONTROL:
        return new DidAccessControlErrorHandler(contract);
      case ContractType.DID_AUTH:
        return new DidAuthErrorHandler(contract);
      case ContractType.DID_ISSUER:
        return new DidIssuerErrorHandler(contract);
      case ContractType.DID_REGISTRY:
        return new DidRegistryErrorHandler(contract);
      case ContractType.DID_VERIFIER:
        return new DidVerifierErrorHandler(contract);
      case ContractType.TOKEN:
        return new TokenErrorHandler(contract);
      case ContractType.ZKP:
      case ContractType.ZKP_VERIFICATION_REGISTRY:
        return new ZKPErrorHandler(contract);
      default:
        throw new Error(`Unsupported contract type: ${contractType}`);
    }
  }

  /**
   * Creates an event parser for the specified contract type
   * @param contractType The type of contract
   * @param contract The contract instance
   * @returns An event parser for the specified contract
   */
  public static createEventParser(contractType: ContractType, contract: Contract): BaseEventParser {
    switch (contractType) {
      case ContractType.DATA_REGISTRY:
        return new DataRegistryEventParser(contract);
      case ContractType.COMPENSATION:
        return new CompensationEventParser(contract);
      case ContractType.CONSENT:
        return new ConsentEventParser(contract);
      case ContractType.DID_ACCESS_CONTROL:
        return new DidAccessControlEventParser(contract);
      case ContractType.DID_AUTH:
        return new DidAuthEventParser(contract);
      case ContractType.DID_ISSUER:
        return new DidIssuerEventParser(contract);
      case ContractType.DID_REGISTRY:
        return new DidRegistryEventParser(contract);
      case ContractType.DID_VERIFIER:
        return new DidVerifierEventParser(contract);
      case ContractType.TOKEN:
        return new TokenEventParser(contract);
      case ContractType.ZKP:
      case ContractType.ZKP_VERIFICATION_REGISTRY:
        return new ZKPEventParser(contract);
      default:
        throw new Error(`Unsupported contract type: ${contractType}`);
    }
  }

  /**
   * Detects the contract type from the contract instance
   * @param contract The contract instance
   * @returns The detected contract type
   */
  public static detectContractType(contract: Contract): ContractType {
    // Check for specific functions or events to identify the contract type
    const functionNames: string[] = [];

    // In ethers.js v6, we need to use forEachFunction to iterate through functions
    contract.interface.forEachFunction(func => {
      functionNames.push(func.name);
    });

    if (functionNames.includes('registerProducerRecord')) {
      return ContractType.DATA_REGISTRY;
    } else if (functionNames.includes('processPayment')) {
      return ContractType.COMPENSATION;
    } else if (functionNames.includes('grantConsent')) {
      return ContractType.CONSENT;
    } else if (functionNames.includes('hasRole')) {
      return ContractType.DID_ACCESS_CONTROL;
    } else if (functionNames.includes('authenticate')) {
      return ContractType.DID_AUTH;
    } else if (functionNames.includes('issueDid')) {
      return ContractType.DID_ISSUER;
    } else if (functionNames.includes('registerDid')) {
      return ContractType.DID_REGISTRY;
    } else if (functionNames.includes('verifyDid')) {
      return ContractType.DID_VERIFIER;
    } else if (functionNames.includes('transfer')) {
      return ContractType.TOKEN;
    } else if (functionNames.includes('verifyProof')) {
      return ContractType.ZKP;
    } else if (functionNames.includes('registerVerification')) {
      return ContractType.ZKP_VERIFICATION_REGISTRY;
    }

    throw new Error('Unknown contract type');
  }
}
