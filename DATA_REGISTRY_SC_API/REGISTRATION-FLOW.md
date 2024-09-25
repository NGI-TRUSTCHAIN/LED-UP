# Registration Flow

1. The patient visits the registration page and fills out the registration form.
2. While filling out the form, the patient address(in our case, the producer address) is collected from the connected wallet
3. The patient data signature is calculated using the patient's private key and bundled in the form data.
4. The patient submits the form.
5. The server verifies the signature using the patient's public key. <- Optional
6. The server stores the patient data into FHIR Server, SQL Database, or IPFS.
7. The server grabs the data recordId, signature, resourceType, url, cid, hash, and submits it to the blockchain.
8. The server receives the event log from the blockchain and stores it in the SQL Database.
9. The patient receives a confirmation message with the transaction hash.
10. The patient can now see the registration record in their profile page.

```typescript
type ProducerRegistrationParam = {
  recordId: string; // the resourceId
  producer: string; // producer's address
  signature: string; // signed with the producer's private key
  resourceType: string; // the resource type
  consent: ConsentStatus; // consent from the patient
  status?: RecordStatus; // status of the record
  metadata: RecordMetadata; // metadata
};

type RecordMetadata = {
  url: string; // the url of the record - it can be fhir server url, ipfs url, or any other url
  cid: string; // the content id of the record
  hash: string; // the hash of the record
};
```

## Programming Steps

1. Prepare the patient to access the registration page with the connected wallet.
2. Create a registration form with the required fields. The patient address is automatically filled in from the connected wallet.

```json
{
  "resourceType": "Patient",
  "id": "d0658787-9eeb-4b40-9053-09e1adacdf6a",
  "meta": {
    "versionId": "1",
    "lastUpdated": "2024-04-19T04:55:59.038+00:00"
  },
  "active": true,
  "name": [
    {
      "use": "official",
      "family": "Smith",
      "given": ["Lisa", "Marie"]
    },
    {
      "use": "usual",
      "given": ["Lisa"]
    }
  ],
  "gender": "female",
  "birthDate": "1974-12-25"
}
```

3. Calculate the signature using the patient's private key and bundle it with the form data.

```typescript
const signature = signData(formData, privateKey);
```

4. Submit the form data to the server.

```typescript
const response = await fetch('/api/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    data: formData,
    signature,
    address: producerAddress,
    consent: ConsentStatus.Given,
  }),
});
```

5. The server verifies the signature using the patient public key.

```typescript
const isValid = verifySignature(formData, signature, publicKey);

if (!isValid) {
  throw new Error('Invalid signature');
}
```

6. The server stores the patient data into FHIR Server, SQL Database, or IPFS.

```typescript
const { url, recordId, cid } = await storeRecord(formData);
const metadata = { url, cid, hash: hashRecord(formData) };
cont registerParam: ProducerRegistrationParam = {
  recordId,
  producer: producerAddress,
  signature,
  resourceType: formData.resourceType,
  consent: ConsentStatus.Given,
  status: RecordStatus.Active,
  metadata,
};
```

7. The server submits the registration data to the blockchain.

```typescript
const txHash = await submitRegistration(registerParam);
```

8. The server receives the event log from the blockchain and stores it in the SQL Database.

```typescript
const eventLog = await getEventLog(txHash);
await storeEventLog(eventLog);
```

9. The patient receives a confirmation message with the transaction hash.

```typescript
alert(`Registration successful. Transaction hash: ${txHash}`);
```

10. The patient can now see the registration record in their profile page.

```typescript
const records = await getRecords(patientAddress);
// or
const records = await getRecords(patientId);
```

### Registration Form Data Sample

```json
{
  "signature": "0x7f7e8798250252052905904589045094590",
  "producer": "0x7f7e8798250252052905904589045094590",
  "data": {
    "resourceType": "Patient",
    "id": "d0658787-9eeb-4b40-9053-09e1adacdf6a",
    "meta": {
      "versionId": "1",
      "lastUpdated": "2024-04-19T04:55:59.038+00:00"
    },
    "active": true,
    "name": [
      {
        "use": "official",
        "family": "Smith",
        "given": ["Lisa", "Marie"]
      },
      {
        "use": "usual",
        "given": ["Lisa"]
      }
    ],
    "gender": "female",
    "birthDate": "1974-12-25"
  }
}
```

```typescript
type FormType = {
  signature: string;
  producer: string;
  data: PatientType;
};
```
