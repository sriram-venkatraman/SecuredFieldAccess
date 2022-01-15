public class DataMasker implements Callable {

    public static String maskSSN(String convertInput) {

        if (convertInput == null) {
            return null;
        }

        String convertOutput = '';
        String validate = '(?:\\d{9})';

        convertOutput = convertInput;
        Pattern p = Pattern.compile(validate);

        String ssn = '';
        String maskedSSN = '';
        Matcher m = p.matcher(convertOutput);
        while (m.find() == true) {        
            ssn = convertOutput.subString(m.start(), m.end());
            maskedSSN = '***-**-' + ssn.right(4);
            convertOutput = m.replacefirst(maskedSSN);
            m = p.matcher(convertOutput);
        } 
        return (convertOutput == convertInput ? 'Bad data format' : convertOutput);
    }

    public static String maskDate(Datetime convertInput, String dateFormat) {
        if (convertInput == null) {
            return null;
        }

        String convertOutput = '';
        System.debug('Sriram Date: ' + convertInput);
        try {
            if (dateFormat == '**/mm/yyyy' || dateFormat == null) {
                convertOutput = convertInput.formatGmt('MM/yyyy');
            } else {
                return 'Bad Date Format';
            }
        } catch (Exception e) {
            return 'Bad Date Conversion. convertInput: ' + convertInput + ' | dateFormat: ' + dateFormat + ' | ' + e.getMessage();
        }

        return convertOutput;
    }

    // Dispatch actual methods
    public Object call(String action, Map<String, Object> args) {
        switch on action {
            when 'maskSSN' {
                return DataMasker.maskSSN((String) args.get('stringValue'));
            }
            when 'maskDate' {
                return DataMasker.maskDate((Datetime) args.get('dateValue'), (String) args.get('stringValue'));
            }
            when else {
                throw new ExtensionMalformedCallException('Method not implemented');
            }
        }
    }

    public class ExtensionMalformedCallException extends Exception {}
}