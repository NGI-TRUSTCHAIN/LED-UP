import { FileTree } from 'nextra/components';

const SCTree = () => {
  return (
    <FileTree>
      <FileTree.Folder name="lib">
        <FileTree.File name="forge-std" />
        <FileTree.File name="openzeppelin-contracts" />
      </FileTree.Folder>
      <FileTree.Folder name="script">
        <FileTree.File name="Compensation.s.sol" />
        <FileTree.File name="DataRegistry.s.sol" />
        <FileTree.File name="HelperConfig.s.sol" />
      </FileTree.Folder>
      <FileTree.Folder name="src" defaultOpen>
        <FileTree.Folder name="contracts">
          <FileTree.File name="Compensation.sol" />

          <FileTree.File name="DataRegistry.sol" />
          <FileTree.File name="Token.sol" />
        </FileTree.Folder>
        <FileTree.Folder name="interface">
          <FileTree.File name="ICompensation.sol" />
          <FileTree.File name="IDataRegistry.sol" />
        </FileTree.Folder>
        <FileTree.Folder name="library">
          <FileTree.File name="DataTypes.sol" />
        </FileTree.Folder>
      </FileTree.Folder>
      <FileTree.Folder name="test">
        <FileTree.File name="Compensation.t.sol" />
        <FileTree.File name="Consent.t.sol" />
        <FileTree.File name="DataRegistry.t.sol" />
        <FileTree.File name="DataRegistry.t.ts" />
        <FileTree.File name="Token.t.sol" />
      </FileTree.Folder>
      <FileTree.File name="foundry.toml" />
      <FileTree.File name="Makefile" />
      <FileTree.File name="README.md" />
    </FileTree>
  );
};

export default SCTree;

/* 
├── lib
│   ├── forge-std
│   └── openzeppelin-contracts
├── script
│   ├── Compensation.s.sol
│   ├── DataRegistry.s.sol
│   └── HelperConfig.s.sol
├── src
│   ├── contracts
│   │   ├── Compensation.sol
│   │   ├── Consent.sol
│   │   ├── DataRegistry.sol
│   │   ├── Token.sol
│   │   ├── zkp
│   │   └── ZKP.sol
│   ├── interface
│   │   ├── ICompensation.sol
│   │   └── IDataRegistry.sol
│   └── library
│       └── DataTypes.sol
└── test
│   ├── Compensation.t.sol
│   ├── Consent.t.sol
│   ├── DataRegistry.t.sol
│   ├── DataRegistry.t.ts
│   ├── Token.t.sol
│   └── ZKP.t.sol
├── foundry.toml
├── Makefile
├── README.md
*/
