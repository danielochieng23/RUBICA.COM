/**
 * Basic Usage Example for Digital ID Framework
 * 
 * This example demonstrates:
 * - Creating a digital identity
 * - Issuing credentials
 * - Verifying credentials with zero-knowledge proofs
 * - Selective disclosure of information
 */

const DigitalIDSDK = require('../src/sdk');

async function main() {
  // Initialize SDK
  const sdk = new DigitalIDSDK({
    apiUrl: 'http://localhost:3000',
    rpcUrl: 'http://localhost:8545'
  });

  console.log('🚀 Digital ID Framework - Basic Usage Example\n');

  try {
    // 1. Generate wallets for different actors
    console.log('1️⃣ Generating wallets...');
    const userWallet = sdk.generateWallet();
    const issuerWallet = sdk.generateWallet();
    const verifierWallet = sdk.generateWallet();
    
    console.log('User wallet:', userWallet.address);
    console.log('Issuer wallet:', issuerWallet.address);
    console.log('Verifier wallet:', verifierWallet.address);

    // 2. Create a digital identity for the user
    console.log('\n2️⃣ Creating digital identity...');
    const identityData = {
      givenName: 'Alice',
      familyName: 'Johnson',
      email: 'alice@example.com',
      dateOfBirth: '1995-06-15',
      nationality: 'US'
    };

    const identity = await sdk.createIdentity(
      identityData,
      'SecurePassword123!',
      userWallet.privateKey
    );

    console.log('✅ Identity created!');
    console.log('DID:', identity.did);
    console.log('IPFS Hash:', identity.ipfsHash);

    // 3. Issue an educational credential
    console.log('\n3️⃣ Issuing educational credential...');
    const educationalCredential = await sdk.issueCredential(
      {
        type: 'EducationalCredential',
        subject: {
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          institution: 'Tech University',
          dateAwarded: '2023-06-15',
          grade: '3.8 GPA'
        }
      },
      identity.did,
      issuerWallet.privateKey
    );

    console.log('✅ Educational credential issued!');
    console.log('Credential Hash:', educationalCredential.credentialHash);

    // 4. Issue an employment credential
    console.log('\n4️⃣ Issuing employment credential...');
    const employmentCredential = await sdk.issueCredential(
      {
        type: 'EmploymentCredential',
        subject: {
          employerName: 'Tech Corp',
          jobTitle: 'Software Engineer',
          department: 'Engineering',
          startDate: '2023-07-01',
          employmentType: 'full_time'
        }
      },
      identity.did,
      issuerWallet.privateKey
    );

    console.log('✅ Employment credential issued!');

    // 5. Verify credentials
    console.log('\n5️⃣ Verifying credentials...');
    const educVerification = await sdk.verifyCredential(
      identity.did,
      educationalCredential.credentialHash
    );

    console.log('Educational credential verification:', educVerification);

    // 6. Zero-knowledge age proof
    console.log('\n6️⃣ Generating zero-knowledge age proof...');
    const currentYear = new Date().getFullYear();
    const birthYear = new Date(identityData.dateOfBirth).getFullYear();
    const age = currentYear - birthYear;

    const ageProof = await sdk.generateAgeProof(age, 21);
    console.log('✅ Age proof generated (proving age >= 21 without revealing actual age)');

    const isOver21 = await sdk.verifyAgeProof(
      ageProof.proof,
      21,
      verifierWallet.privateKey
    );
    console.log('Age verification result:', isOver21 ? 'VERIFIED ✅' : 'FAILED ❌');

    // 7. Selective disclosure presentation
    console.log('\n7️⃣ Creating selective disclosure presentation...');
    const presentation = await sdk.createPresentation(
      [educationalCredential.credential, employmentCredential.credential],
      [[0, 1], [0, 1]], // Only disclose degree, institution, employer, and job title
      'holder-secret-key'
    );

    console.log('✅ Presentation created with selective disclosure');
    console.log('Disclosed fields:', presentation.verifiableCredential.map(vc => vc.disclosedAttributes));

    // 8. Verify presentation
    console.log('\n8️⃣ Verifying presentation...');
    const presentationResult = await sdk.verifyPresentation(presentation);
    console.log('Presentation verification:', presentationResult.valid ? 'VALID ✅' : 'INVALID ❌');

    // 9. Demonstrate privacy features
    console.log('\n9️⃣ Privacy Features Demonstration:');
    console.log('- ✅ Identity data encrypted on IPFS');
    console.log('- ✅ Credentials stored with encryption');
    console.log('- ✅ Age verified without revealing date of birth');
    console.log('- ✅ Selective disclosure of credential attributes');
    console.log('- ✅ Zero-knowledge proofs for privacy preservation');

    console.log('\n🎉 Example completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Advanced examples

async function advancedPrivacyExamples(sdk) {
  console.log('\n📚 Advanced Privacy Examples:\n');

  // Range proof example
  console.log('1️⃣ Range Proof (salary verification without revealing exact amount)');
  const salaryProof = await sdk.zkProof.generateRangeProof(
    75000, // Actual salary
    50000, // Minimum threshold
    100000 // Maximum threshold
  );
  console.log('Salary is between $50k-$100k:', salaryProof.verified);

  // Membership proof example
  console.log('\n2️⃣ Set Membership Proof (proving membership without revealing which member)');
  const validUniversities = ['MIT', 'Stanford', 'Harvard', 'Tech University', 'Yale'];
  const membershipProof = await sdk.zkProof.generateMembershipProof(
    'Tech University',
    validUniversities,
    'random-salt'
  );
  console.log('University is in approved list:', membershipProof.verified);

  // Field-level encryption example
  console.log('\n3️⃣ Field-Level Encryption (encrypt specific fields)');
  const sensitiveData = {
    name: 'Alice Johnson',
    ssn: '123-45-6789',
    salary: 75000,
    department: 'Engineering'
  };
  
  const masterKey = sdk.encryption.generateKey();
  const encryptedFields = sdk.encryption.encryptFields(sensitiveData, masterKey);
  
  // Decrypt only specific fields
  const decryptedFields = sdk.encryption.decryptFields(
    encryptedFields,
    ['name', 'department'], // Only decrypt these fields
    masterKey
  );
  console.log('Selectively decrypted:', decryptedFields);
}

// Run the example
if (require.main === module) {
  main().catch(console.error);
}