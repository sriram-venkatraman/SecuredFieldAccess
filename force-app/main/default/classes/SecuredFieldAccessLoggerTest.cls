@isTest
private class SecuredFieldAccessLoggerTest {
    @isTest static void testLogView() {

        Callable logger = (Callable) Type.forName('SecuredFieldAccessLogger').newInstance();
        String status = (String) logger.call('logView', 
                                             new Map<String, Object> { 'objectName' => 'DummyObject', 
                                                                       'fieldName' => 'DummyField', 
                                                                       'recordId' => 'DummyRecord',
                                                                       'detail' => 'Dummy Detail' });
        
        System.assertEquals('Success', status);

        list<Secured_Field_Access_Log__c> sfal = [select Object_Name__c,
                                                        Field_Name__c, 
                                                        User__c,
                                                        Record_Id__c,
                                                        Mode__c,
                                                        Details__c
                                                from Secured_Field_Access_Log__c];
        System.assertEquals(1, sfal.size());
        System.assertEquals('DummyObject', sfal[0].Object_Name__c);
        System.assertEquals('DummyField', sfal[0].Field_Name__c);
        System.assertEquals('DummyRecord', sfal[0].Record_Id__c);
        System.assertEquals('Dummy Detail', sfal[0].Details__c);
        System.assertEquals('View', sfal[0].Mode__c);
        System.assertEquals(UserInfo.getUserId(), sfal[0].User__c);
    }

    @isTest static void testLogChange() {

        Callable logger = (Callable) Type.forName('SecuredFieldAccessLogger').newInstance();
        String status = (String) logger.call('logChange', 
                                             new Map<String, Object> { 'objectName' => 'DummyObject', 
                                                                       'fieldName' => 'DummyField', 
                                                                       'recordId' => 'DummyRecord',
                                                                       'detail' => 'Dummy Detail' });
        
        System.assertEquals('Success', status);

        list<Secured_Field_Access_Log__c> sfal = [select Object_Name__c,
                                                        Field_Name__c, 
                                                        User__c,
                                                        Record_Id__c,
                                                        Mode__c,
                                                        Details__c
                                                from Secured_Field_Access_Log__c];
        System.assertEquals(1, sfal.size());
        System.assertEquals('DummyObject', sfal[0].Object_Name__c);
        System.assertEquals('DummyField', sfal[0].Field_Name__c);
        System.assertEquals('DummyRecord', sfal[0].Record_Id__c);
        System.assertEquals('Dummy Detail', sfal[0].Details__c);
        System.assertEquals('View', sfal[0].Mode__c);
        System.assertEquals(UserInfo.getUserId(), sfal[0].User__c);
    }
}
