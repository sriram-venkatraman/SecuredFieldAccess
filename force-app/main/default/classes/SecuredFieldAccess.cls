public with sharing class SecuredFieldAccess {

    @AuraEnabled(cacheable=true)
    public static String getFields(String fieldList, String recordId, String sObjectName) {
        List<FieldMask> fml = (List<FieldMask>) JSON.deserialize(fieldList, List<FieldMask>.class);
        String inSOQL = 'select';
        List<FieldMaskClassMethod> iflds = new List<FieldMaskClassMethod>();
        FieldMaskClassMethod fmcm = new FieldMaskClassMethod();
        for (FieldMask fm : fml) {
            inSOQL += ' ' + fm.field + ',';
            fmcm = new FieldMaskClassMethod();
            fmcm.fieldName = fm.field;
            if (fm.masker != null && fm.masker != '' & fm.masker.indexOf('.') > 1) {
                fmcm.className = fm.masker.split('\\.')[0];
                fmcm.methodName = fm.masker.split('\\.')[1];
            }
            fmcm.hasPerm2View = SecuredFieldAccess.hasCustomPermission(fm.perm2View);
            fmcm.hasPerm2Edit = SecuredFieldAccess.hasCustomPermission(fm.perm2Edit);
            iflds.add(fmcm);
        }
        inSOQL = inSOQL.left(inSOQL.length()-1) + ' from ' + sObjectName + ' where Id = \'' + recordId + '\'';

        sObject record = Database.query(inSOQL);

        Schema.SObjectType sot = record.getSObjectType();
        Map<String, Schema.SObjectField> fieldMap = sot.getDescribe().fields.getMap();
        Schema.DescribeSObjectResult res = sot.getDescribe();
        Set<String> fields = res.fields.getMap().keyset();

        List<OutputFields> oflds = new List<OutputFields>();
        for (FieldMaskClassMethod fld : iflds) {
            String field = fld.fieldName;
            String className = fld.className;
            String methodName = fld.methodName;

            if (record.isSet(field)) {
                OutputFields ofld = new OutputFields();
                ofld.fieldName = field;
                ofld.label = fieldMap.get(field).getDescribe().getLabel();
                if (fieldMap.get(field).getDescribe().getType() == Schema.DisplayType.DATE || 
                    fieldMap.get(field).getDescribe().getType() == Schema.DisplayType.DATETIME) {
                    ofld.value = ((Datetime) record.get(field)).formatGmt('MM/dd/yyyy');
                } else {
                    ofld.value = (String) record.get(field);
                }
                
                ofld.hasPerm2View = fld.hasPerm2View;
                ofld.hasPerm2Edit = fld.hasPerm2Edit;

                if (className != null && methodName != null) {
                    Callable masker = (Callable) Type.forName(className).newInstance();
                    if (fieldMap.get(field).getDescribe().getType() == Schema.DisplayType.DATE ||
                        fieldMap.get(field).getDescribe().getType() == Schema.DisplayType.DATETIME) {
                        ofld.maskedValue = (String) masker.call(methodName, new Map<String, Object> { 'dateValue' => (Datetime) record.get(field), 'stringValue' => '**/mm/yyyy' });
                    } else if (fieldMap.get(field).getDescribe().getType() == Schema.DisplayType.STRING) {
                        ofld.maskedValue = (String) masker.call(methodName, new Map<String, Object> { 'stringValue' => (String) record.get(field) });
                    } else {
                    ofld.maskedValue = ofld.value;
                    }
                }
                oflds.add(ofld);
            }
        }
        
        return JSON.serialize(oflds);
    }

    @AuraEnabled
    public static String updateField(String fieldName, String value, String recordId, String sObjectName) {
        sObject sObj = Schema.getGlobalDescribe().get(sObjectName).newSObject();
        Schema.SObjectType sot = sObj.getSObjectType();
        Map<String, Schema.SObjectField> fieldMap = sot.getDescribe().fields.getMap();

        sObj.put('Id', recordId);

        try {
            if (fieldMap.get(fieldName).getDescribe().getType() == Schema.DisplayType.DATE) {
                sObj.put(fieldName, Date.parse(value));
            } else if (fieldMap.get(fieldName).getDescribe().getType() == Schema.DisplayType.DATETIME) {
                sObj.put(fieldName, Datetime.parse(value));
            } else {
                sObj.put(fieldName, value);
            }
        } catch (Exception e) {
            return 'Error! Bad data. ' + e.getMessage();
        }

        try {
            update sObj;
        } catch (Exception e) {
            return 'Update Failed: ' + e.getMessage();
        }
        
        return 'Success';
    }

    public static Boolean hasCustomPermission(String name) {
        Set<Id> permissionSetIds = new Set<Id>();
        for (SetupEntityAccess access : [SELECT ParentId 
                                        FROM SetupEntityAccess 
                                        WHERE SetupEntityId IN (
                                            SELECT Id 
                                            FROM CustomPermission 
                                            WHERE MasterLabel = :name
                                        )
                                    ]) {
            permissionSetIds.add(access.ParentId);
        }

        List<User> ul = [SELECT Username 
                         FROM User 
                         WHERE Id IN (SELECT AssigneeId 
                                      FROM PermissionSetAssignment
                                      WHERE PermissionSetId IN :permissionSetIds)
                         AND Id = :UserInfo.getUserId()];

        return (ul.size() > 0);
    }

    class FieldMask {
        String field;
        String masker;
        String perm2View;
        String perm2Edit;
    }

    class FieldMaskClassMethod {
        String fieldName;
        String className;
        String methodName;
        Boolean hasPerm2View;
        Boolean hasPerm2Edit;
    }

    class OutputFields {
        String fieldName;
        String label;
        String maskedValue;
        String value;
        Boolean hasPerm2View;
        Boolean hasPerm2Edit;
    }
}
