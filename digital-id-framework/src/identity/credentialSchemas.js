/**
 * Standard credential schemas for the Digital ID Framework
 */

const CredentialSchemas = {
  // Basic identity credential
  BasicIdentity: {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://schema.org/'
    ],
    type: 'BasicIdentityCredential',
    schema: {
      type: 'object',
      properties: {
        givenName: { type: 'string' },
        familyName: { type: 'string' },
        email: { type: 'string', format: 'email' },
        dateOfBirth: { type: 'string', format: 'date' },
        nationality: { type: 'string' },
        gender: { type: 'string', enum: ['male', 'female', 'other', 'prefer_not_to_say'] }
      },
      required: ['givenName', 'familyName']
    }
  },

  // Government ID credential
  GovernmentID: {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://schema.org/'
    ],
    type: 'GovernmentIDCredential',
    schema: {
      type: 'object',
      properties: {
        idNumber: { type: 'string' },
        idType: { type: 'string', enum: ['passport', 'national_id', 'drivers_license'] },
        issuingCountry: { type: 'string' },
        issuingAuthority: { type: 'string' },
        dateOfIssue: { type: 'string', format: 'date' },
        dateOfExpiry: { type: 'string', format: 'date' },
        holderName: { type: 'string' },
        holderDateOfBirth: { type: 'string', format: 'date' },
        holderPhoto: { type: 'string', format: 'uri' }
      },
      required: ['idNumber', 'idType', 'issuingCountry', 'holderName']
    }
  },

  // Educational credential
  EducationalCredential: {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://schema.org/'
    ],
    type: 'EducationalCredential',
    schema: {
      type: 'object',
      properties: {
        degree: { type: 'string' },
        field: { type: 'string' },
        institution: { type: 'string' },
        dateAwarded: { type: 'string', format: 'date' },
        grade: { type: 'string' },
        transcript: { type: 'string', format: 'uri' },
        studentId: { type: 'string' }
      },
      required: ['degree', 'institution', 'dateAwarded']
    }
  },

  // Employment credential
  EmploymentCredential: {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://schema.org/'
    ],
    type: 'EmploymentCredential',
    schema: {
      type: 'object',
      properties: {
        employerName: { type: 'string' },
        employeeId: { type: 'string' },
        jobTitle: { type: 'string' },
        department: { type: 'string' },
        startDate: { type: 'string', format: 'date' },
        endDate: { type: 'string', format: 'date' },
        employmentType: { type: 'string', enum: ['full_time', 'part_time', 'contract', 'internship'] },
        salary: { 
          type: 'object',
          properties: {
            amount: { type: 'number' },
            currency: { type: 'string' },
            frequency: { type: 'string', enum: ['hourly', 'monthly', 'yearly'] }
          }
        }
      },
      required: ['employerName', 'jobTitle', 'startDate']
    }
  },

  // Medical credential
  MedicalCredential: {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://schema.org/',
      'https://hl7.org/fhir/'
    ],
    type: 'MedicalCredential',
    schema: {
      type: 'object',
      properties: {
        patientId: { type: 'string' },
        medicalRecordNumber: { type: 'string' },
        bloodType: { type: 'string', enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
        allergies: { 
          type: 'array',
          items: { type: 'string' }
        },
        medications: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              dosage: { type: 'string' },
              frequency: { type: 'string' }
            }
          }
        },
        conditions: {
          type: 'array',
          items: { type: 'string' }
        },
        immunizations: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              vaccine: { type: 'string' },
              date: { type: 'string', format: 'date' },
              provider: { type: 'string' }
            }
          }
        }
      },
      required: ['patientId']
    }
  },

  // Financial credential
  FinancialCredential: {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://schema.org/'
    ],
    type: 'FinancialCredential',
    schema: {
      type: 'object',
      properties: {
        accountHolder: { type: 'string' },
        bankName: { type: 'string' },
        accountType: { type: 'string', enum: ['checking', 'savings', 'credit', 'investment'] },
        accountNumber: { type: 'string' },
        routingNumber: { type: 'string' },
        balance: {
          type: 'object',
          properties: {
            amount: { type: 'number' },
            currency: { type: 'string' },
            asOf: { type: 'string', format: 'date-time' }
          }
        },
        creditScore: {
          type: 'object',
          properties: {
            score: { type: 'number', minimum: 300, maximum: 850 },
            agency: { type: 'string' },
            date: { type: 'string', format: 'date' }
          }
        }
      },
      required: ['accountHolder', 'bankName']
    }
  },

  // Age verification credential
  AgeVerificationCredential: {
    '@context': [
      'https://www.w3.org/2018/credentials/v1'
    ],
    type: 'AgeVerificationCredential',
    schema: {
      type: 'object',
      properties: {
        ageOver18: { type: 'boolean' },
        ageOver21: { type: 'boolean' },
        ageOver65: { type: 'boolean' },
        dateOfBirth: { type: 'string', format: 'date' },
        issuingAuthority: { type: 'string' }
      },
      required: ['dateOfBirth']
    }
  },

  // Professional license credential
  ProfessionalLicense: {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://schema.org/'
    ],
    type: 'ProfessionalLicenseCredential',
    schema: {
      type: 'object',
      properties: {
        licenseType: { type: 'string' },
        licenseNumber: { type: 'string' },
        profession: { type: 'string' },
        issuingAuthority: { type: 'string' },
        issuingState: { type: 'string' },
        dateOfIssue: { type: 'string', format: 'date' },
        dateOfExpiry: { type: 'string', format: 'date' },
        status: { type: 'string', enum: ['active', 'suspended', 'revoked', 'expired'] },
        specializations: {
          type: 'array',
          items: { type: 'string' }
        }
      },
      required: ['licenseType', 'licenseNumber', 'issuingAuthority', 'status']
    }
  },

  // Membership credential
  MembershipCredential: {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://schema.org/'
    ],
    type: 'MembershipCredential',
    schema: {
      type: 'object',
      properties: {
        organizationName: { type: 'string' },
        membershipId: { type: 'string' },
        membershipType: { type: 'string' },
        memberSince: { type: 'string', format: 'date' },
        expiryDate: { type: 'string', format: 'date' },
        benefits: {
          type: 'array',
          items: { type: 'string' }
        },
        status: { type: 'string', enum: ['active', 'suspended', 'expired'] }
      },
      required: ['organizationName', 'membershipId', 'status']
    }
  },

  // Proof of residence credential
  ProofOfResidence: {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://schema.org/'
    ],
    type: 'ProofOfResidenceCredential',
    schema: {
      type: 'object',
      properties: {
        residentName: { type: 'string' },
        streetAddress: { type: 'string' },
        city: { type: 'string' },
        state: { type: 'string' },
        postalCode: { type: 'string' },
        country: { type: 'string' },
        residenceSince: { type: 'string', format: 'date' },
        documentType: { type: 'string', enum: ['utility_bill', 'lease', 'mortgage', 'bank_statement'] },
        documentDate: { type: 'string', format: 'date' }
      },
      required: ['residentName', 'streetAddress', 'city', 'country']
    }
  }
};

/**
 * Validate credential data against schema
 * @param {string} credentialType - Type of credential
 * @param {Object} data - Credential data to validate
 * @returns {Object} Validation result
 */
function validateCredential(credentialType, data) {
  const schema = CredentialSchemas[credentialType];
  
  if (!schema) {
    return {
      valid: false,
      errors: [`Unknown credential type: ${credentialType}`]
    };
  }

  // Simple validation (in production, use a proper JSON Schema validator)
  const errors = [];
  const required = schema.schema.required || [];
  
  // Check required fields
  for (const field of required) {
    if (!(field in data)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Check field types
  for (const [field, value] of Object.entries(data)) {
    const fieldSchema = schema.schema.properties[field];
    
    if (!fieldSchema) {
      errors.push(`Unknown field: ${field}`);
      continue;
    }

    // Type validation
    if (fieldSchema.type === 'string' && typeof value !== 'string') {
      errors.push(`Field ${field} must be a string`);
    } else if (fieldSchema.type === 'number' && typeof value !== 'number') {
      errors.push(`Field ${field} must be a number`);
    } else if (fieldSchema.type === 'boolean' && typeof value !== 'boolean') {
      errors.push(`Field ${field} must be a boolean`);
    } else if (fieldSchema.type === 'array' && !Array.isArray(value)) {
      errors.push(`Field ${field} must be an array`);
    } else if (fieldSchema.type === 'object' && typeof value !== 'object') {
      errors.push(`Field ${field} must be an object`);
    }

    // Enum validation
    if (fieldSchema.enum && !fieldSchema.enum.includes(value)) {
      errors.push(`Field ${field} must be one of: ${fieldSchema.enum.join(', ')}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get credential template
 * @param {string} credentialType - Type of credential
 * @returns {Object} Credential template
 */
function getCredentialTemplate(credentialType) {
  const schema = CredentialSchemas[credentialType];
  
  if (!schema) {
    throw new Error(`Unknown credential type: ${credentialType}`);
  }

  const template = {
    '@context': schema['@context'],
    type: schema.type,
    credentialSubject: {}
  };

  // Add default values for required fields
  const required = schema.schema.required || [];
  for (const field of required) {
    template.credentialSubject[field] = '';
  }

  return template;
}

/**
 * Get all available credential types
 * @returns {Array} List of credential types
 */
function getCredentialTypes() {
  return Object.keys(CredentialSchemas);
}

module.exports = {
  CredentialSchemas,
  validateCredential,
  getCredentialTemplate,
  getCredentialTypes
};