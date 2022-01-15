public interface SecuredFieldAccessLoggerInterface {
    String logView(String objectName, String fieldName, String recordId, String detail); 
    String logChange(String objectName, String fieldName, String recordId, String detail); 
}
