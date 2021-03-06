# Secured Field Access

__Deploy to Dev Org/Prod:__ [![Deploy to Salesforce](https://andrewfawcett.files.wordpress.com/2014/09/deploy.png)](https://githubsfdeploy.herokuapp.com/app/githubdeploy/sriram-venkatraman/SecuredFieldAccess)

__Deploy to Sandbox:__ [![Deploy to Salesforce](https://andrewfawcett.files.wordpress.com/2014/09/deploy.png)](https://githubsfdeploy-sandbox.herokuapp.com/app/githubdeploy/sriram-venkatraman/SecuredFieldAccess)

_Note: Still tidying up with test classes and documentation. Functionality seems to work reasonably well although I haven't done extensive testing_

- [Secured Field Access](#secured-field-access)
  - [Challenge:](#challenge)
  - [Solution:](#solution)
    - [Sample Component Configuration](#sample-component-configuration)
    - [Sample JSON for Dynamic Field Specification](#sample-json-for-dynamic-field-specification)
    - [Sample Usage including logging](#sample-usage-including-logging)
    - [Sample Logger Implementation](#sample-logger-implementation)
    - [Sample Logger Object](#sample-logger-object)
- [!! Important !!](#-important-)
  - [Dev, Build and Test](#dev-build-and-test)
  - [Resources](#resources)
  - [Description of Files and Directories](#description-of-files-and-directories)
  - [Issues](#issues)
  
## Challenge:
Salesforce provides [Platform Encryption](https://help.salesforce.com/s/articleView?id=sf.security_pe_overview.htm&type=5) to encrypt sensitive fields at rest. Platform Encryption doesn's provide a standard mechanism to mask fields that are considered sensitive. Current available options for UX are as follows -
* Switch to classic encryption & use the masking feature. Be aware of [differences between classic and platform encryption](https://developer.salesforce.com/docs/atlas.en-us.securityImplGuide.meta/securityImplGuide/security_pe_vs_classic_encryption.htm) and [considerations](https://developer.salesforce.com/docs/atlas.en-us.210.0.securityImplGuide.meta/securityImplGuide/security_pe_considerations_general.htm)
* Provide access to unmasked sensitive fields through field level security or completely take away the access
* Create a custom solution

Typically information security compliance requires access to sensitive data to be provided only when required, to those who are authorized and log view/update activities.

## Solution:
This open source has been created as a reusable solution for the Salesforce community to provide quick starting point with all foundational capabilities such as -
* Configurable LWC record page component.
* Ability to specify dynamic fields specifications including masking through apex & permission to view & update. No standard Field Level Security access needs to be provided to these fields. Yet use Customm Permission to reveal and update access to specific fields.
* Optionally, provide custom apex Class.Method to log views & updates.

### Sample Component Configuration
![Sample Component Configuration](/assets/images/componentconfig.png)
### Sample JSON for Dynamic Field Specification
![Sample JSON for Dynamic Field Specification](/assets/images/jsonconfig.png)
### Sample Usage including logging
![Sample Usage including logging](/assets/images/usage.gif)
### [Sample Logger Implementation](/force-app/main/default/classes/SecuredFieldAccessLogger.cls)
### [Sample Logger Object](/force-app/main/default/objects/Secured_Field_Access_Log__c)

# !! Important !!
* Still working on adding comments to my code
* Still working on creating test classes to the apex classes

## Dev, Build and Test

## Resources

## Description of Files and Directories

## Issues
