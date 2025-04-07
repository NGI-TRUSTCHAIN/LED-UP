# Component Library Documentation

## Overview

This document catalogs and describes the custom UI components built for the LEDUP frontend application. These components are designed to provide consistent user experience while implementing domain-specific functionality for the decentralized healthcare data platform.

## Component Categories

The component library is organized into the following functional categories:

1. **Layout Components**: Components for page structure and navigation
2. **UI Components**: Core reusable interface elements
3. **Blockchain Components**: Components for blockchain interaction
4. **Data Registry Components**: Components for managing healthcare data records
5. **ZKP Components**: Components for zero-knowledge proof functionality
6. **DID Components**: Components for decentralized identity management
7. **Feedback Components**: Components for notifications and status feedback

## Layout Components

### Header

The main application header component that displays navigation, user profile, and authentication status.

```tsx
import { Header } from '@/components/header';

// Usage example
<Header />;
```

**Features**:

- Responsive design with mobile menu
- User profile integration
- Navigation links to main application areas
- Search functionality integration
- Dark/light mode toggle

### Sidebar

The application sidebar for main navigation and contextual options.

```tsx
import { Sidebar } from '@/components/sidebar';

// Usage example
<Sidebar />;
```

**Features**:

- Collapsible navigation menu
- Role-based navigation items
- Feature section organization
- Active state indication

### Footer

The application footer with links and legal information.

```tsx
import { Footer } from '@/components/footer';

// Usage example
<Footer />;
```

### Dashboard Layout

The main dashboard layout with header, sidebar, and content area.

```tsx
import { Dashboard } from '@/components/dashboard';

// Usage example
<Dashboard>
  <YourContent />
</Dashboard>;
```

## UI Components

### Button

Customized button component with variants for different use cases.

```tsx
import { Button } from '@/components/ui/button';

// Usage examples
<Button>Default Button</Button>
<Button variant="destructive">Destructive Action</Button>
<Button variant="outline">Outline Button</Button>
<Button variant="secondary">Secondary Button</Button>
<Button variant="ghost">Ghost Button</Button>
<Button variant="link">Link Button</Button>
```

### Card

Container component for grouping related content.

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

// Usage example
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>;
```

### Stepper

Multi-step workflow component for guiding users through complex processes.

```tsx
import { Stepper, Step, StepIndicator, StepContent } from '@/components/ui/stepper';

// Usage example
<Stepper activeStep={currentStep}>
  <Step>
    <StepIndicator>1</StepIndicator>
    <StepContent>Step 1 Content</StepContent>
  </Step>
  <Step>
    <StepIndicator>2</StepIndicator>
    <StepContent>Step 2 Content</StepContent>
  </Step>
</Stepper>;
```

### Alert

Component for displaying important messages to users.

```tsx
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

// Usage example
<Alert variant="info">
  <AlertTitle>Information</AlertTitle>
  <AlertDescription>This is an informational message.</AlertDescription>
</Alert>;
```

### Dialog

Modal dialog component for focused user interactions.

```tsx
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

// Usage example
<Dialog>
  <DialogTrigger>Open Dialog</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description</DialogDescription>
    </DialogHeader>
    <div>Dialog content</div>
    <DialogFooter>
      <Button>Action</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>;
```

### Form Components

Custom form components including:

```tsx
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

// Usage example
<form>
  <Input placeholder="Enter text" />
  <Textarea placeholder="Enter longer text" />
  <Checkbox label="Check this option" />
  <Switch />
  <RadioGroup defaultValue="option1">
    <RadioGroupItem value="option1" />
    <RadioGroupItem value="option2" />
  </RadioGroup>
  <Select>
    <SelectTrigger>
      <SelectValue placeholder="Select an option" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="option1">Option 1</SelectItem>
      <SelectItem value="option2">Option 2</SelectItem>
    </SelectContent>
  </Select>
</form>;
```

## Blockchain Components

### WalletConnect

Component for connecting to blockchain wallets.

```tsx
import { WalletConnect } from '@/components/wallet-connect';

// Usage example
<WalletConnect />;
```

**Features**:

- Multi-wallet support
- Connection status display
- Address display with truncation
- Disconnect functionality
- Network switching

### Web3Provider

Provider component for blockchain context.

```tsx
import { Web3Provider } from '@/components/web3-provider';

// Usage example
<Web3Provider>{children}</Web3Provider>;
```

### ProtectedRoute

Route guard component for blockchain authentication.

```tsx
import { ProtectedRoute } from '@/components/protected-route';

// Usage example
<ProtectedRoute>
  <PrivateContent />
</ProtectedRoute>;
```

## Data Registry Components

### RecordsList

Component for displaying and managing data records.

```tsx
import { RecordsList } from '@/features/data-registry/components/RecordsList';

// Usage example
<RecordsList producerAddress="0x..." />;
```

**Features**:

- Pagination
- Filtering
- Record detail view
- IPFS data integration
- Editing capabilities

### RecordForm

Form component for submitting new records or editing existing ones.

```tsx
import { RecordForm } from '@/features/data-registry/components/RecordForm';

// Usage example
<RecordForm onSubmit={handleSubmit} initialData={existingRecord} />;
```

**Features**:

- Field validation
- FHIR data schema support
- File upload integration
- Metadata input

### IPFSUploadDemo

Component demonstrating IPFS upload functionality.

```tsx
import { IPFSUploadDemo } from '@/features/data-registry/components/IPFSUploadDemo';

// Usage example
<IPFSUploadDemo />;
```

**Features**:

- File selection
- Upload progress indication
- IPFS link display
- Blockchain registration integration

## ZKP Components

### AgeVerification

Component for age verification using zero-knowledge proofs.

```tsx
import { AgeVerification } from '@/features/zkp/components/AgeVerification';

// Usage example
<AgeVerification />;
```

**Features**:

- Age input without revealing exact birthdate
- ZKP generation
- Verification status display
- Circuit integration

### HashVerification

Component for verifying document hashes using ZKP.

```tsx
import { HashVerification } from '@/features/zkp/components/HashVerification';

// Usage example
<HashVerification />;
```

**Features**:

- File upload for hash generation
- Original hash comparison
- ZKP generation and verification
- Verification history

### FHIRVerification

Component for verifying FHIR data properties using ZKP.

```tsx
import { FHIRVerification } from '@/features/zkp/components/FHIRVerification';

// Usage example
<FHIRVerification />;
```

**Features**:

- FHIR data selection
- Property verification without revealing full data
- ZKP generation for selective disclosure
- Verification status display

## DID Components

### DidRegistrationPage

Component for DID registration and management.

```tsx
import { DidRegistrationPage } from '@/components/DidRegistrationPage';

// Usage example
<DidRegistrationPage />;
```

**Features**:

- DID creation
- DID association with blockchain address
- DID document management
- Verification methods

### DidRegistryDemo

Component showcasing DID Registry functionality.

```tsx
import { DidRegistryDemo } from '@/components/DidRegistryDemo';

// Usage example
<DidRegistryDemo />;
```

**Features**:

- DID lookup
- DID verification
- DID history
- DID document display

## Feedback Components

### ResourceCard

Displays resource information in a card format.

```tsx
import { ResourceCard } from '@/components/ResourceCard';

// Usage example
<ResourceCard title="Resource Title" description="Resource description" type="Patient" onClick={handleClick} />;
```

### ResourceModal

Modal component for displaying detailed resource information.

```tsx
import { ResourceModal } from '@/components/ResourceModal';

// Usage example
<ResourceModal isOpen={isOpen} onClose={handleClose} resource={resourceData} />;
```

## Feature-Specific Components

The LEDUP application includes numerous feature-specific components organized within their respective feature folders. These components implement domain-specific functionality while leveraging the core UI components.

### Compensation Components

```tsx
// Producer registration form
import { RegisterProducerForm } from '@/features/compensation/components/RegisterProducerForm';

// Payment processing interface
import { ProcessPayment } from '@/features/compensation/components/ProcessPayment';
```

### Consent Management Components

```tsx
// Consent management interface
import { ConsentManager } from '@/features/consent-management/components/ConsentManager';

// Access control display
import { AccessControl } from '@/features/consent-management/components/AccessControl';
```

## Component Development Guidelines

When creating new components for the LEDUP application:

1. **Component Structure**: Follow the established pattern of organizing components by function and feature
2. **Composability**: Design components to be composable with clear responsibilities
3. **Props Interface**: Clearly define the props interface with TypeScript
4. **Documentation**: Include JSDoc comments for props and component functionality
5. **Accessibility**: Ensure components meet accessibility standards
6. **Responsive Design**: Implement responsive behavior for all screen sizes
7. **Testing**: Write unit tests for component functionality
8. **Consistent Styling**: Use the design system tokens and utility classes for styling

---

**Last Updated:** March 2025
**Contact:** LED-UP Development Team
