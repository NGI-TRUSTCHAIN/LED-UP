import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const DidRegistryModule = buildModule('DidRegistryModule', (m) => {
  const didRegistry = m.contract('DidRegistry');
  return { didRegistry };
});

const DataRegistryModule = buildModule('DataRegistryModule', (m) => {
  const dataRegistry = m.contract('DataRegistry');
  return { dataRegistry };
});

const CompensationModule = buildModule('CompensationModule', (m) => {
  const compensation = m.contract('Compensation');
  return { compensation };
});

const DidAuthModule = buildModule('DidAuthModule', (m) => {
  const didAuth = m.contract('DidAuth');
  return { didAuth };
});

const DidVerifierModule = buildModule('DidVerifierModule', (m) => {
  const didVerifier = m.contract('DidVerifier');
  return { didVerifier };
});

const DidIssuerModule = buildModule('DidIssuerModule', (m) => {
  const didIssuer = m.contract('DidIssuer');
  return { didIssuer };
});

const DidAccessControlModule = buildModule('DidAccessControlModule', (m) => {
  const didAccessControl = m.contract('DidAccessControl');
  return { didAccessControl };
});

export {
  DidRegistryModule,
  DataRegistryModule,
  CompensationModule,
  DidAuthModule,
  DidVerifierModule,
  DidIssuerModule,
  DidAccessControlModule,
};
