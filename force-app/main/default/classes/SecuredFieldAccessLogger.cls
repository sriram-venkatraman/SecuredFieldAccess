public with sharing class SecuredFieldAccessLogger implements Callable {
    public static String logView(String objectName, String fieldName, String recordId, String detail) {
        try {
            Secured_Field_Access_Log__c sfal = new Secured_Field_Access_Log__c();
            sfal.Object_Name__c = objectName;
            sfal.Field_Name__c = fieldName;
            sfal.User__c = UserInfo.getUserId();
            sfal.Record_Id__c = recordId;
            sfal.Mode__c = 'View';
            sfal.Details__c = detail;
            insert sfal;
        } catch (Exception e) {
            return 'Error! ' + e.getMessage();
        }

        return 'Success';
    }

    // Dispatch actual methods
    public Object call(String action, Map<String, Object> args) {
        switch on action {
            when 'logView' {
                return SecuredFieldAccessLogger.logView((String) args.get('objectName'),
                                                        (String) args.get('fieldName'),
                                                        (String) args.get('recordId'),
                                                        (String) args.get('detail'));
            }
            when else {
                throw new ExtensionMalformedCallException('Method not implemented');
            }
        }
    }

    public class ExtensionMalformedCallException extends Exception {}

}
