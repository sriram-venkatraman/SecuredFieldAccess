declare module "@salesforce/apex/SecuredFieldAccess.getFields" {
  export default function getFields(param: {fieldList: any, recordId: any, sObjectName: any}): Promise<any>;
}
declare module "@salesforce/apex/SecuredFieldAccess.updateField" {
  export default function updateField(param: {fieldName: any, value: any, recordId: any, sObjectName: any}): Promise<any>;
}
