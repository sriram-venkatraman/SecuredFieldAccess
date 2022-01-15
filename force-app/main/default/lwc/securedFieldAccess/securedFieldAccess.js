import { LightningElement, api, wire, track} from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getSecuredFields from '@salesforce/apex/SecuredFieldAccess.getFields';
import updateField from '@salesforce/apex/SecuredFieldAccess.updateField';
import viewLogger from '@salesforce/apex/SecuredFieldAccess.callViewLogger';

export default class SecuredFieldAccess extends LightningElement {
    @api objectApiName;
    @api recordId;
    @api strFieldMaskJSON;
    @api strLoggerClass;
    @api strTitle;
    @api strOutput;
    @track fieldData;
    changeField;
    changeValue;
    changeLabel;

    @track error;

    @wire(getSecuredFields, { fieldList: '$strFieldMaskJSON', recordId: '$recordId', sObjectName: '$objectApiName' })
    wiredFields({ error, data }) {
        if (data) {
            this.fieldData = JSON.parse(data);

            this.error = undefined;

            for (var i = 0; i < this.fieldData.length; i++) {
                this.fieldData[i].masked = true;
                this.fieldData[i].editMode = false;
             }
        } else if (error) {
            this.error = error;
            this.fieldData = 'undefined';
        }
    }

    get recordText() {
        return JSON.stringify(this.fieldData);
    }

    get allFields() {
        return this.fieldData;
    }

    get errorText() {
        return JSON.stringify(this.error);
    }

    handleRevealClick(event) {
        for (var i = 0; i < this.fieldData.length; i++) {
            if (this.fieldData[i].fieldName == event.target.title) {
                this.fieldData[i].masked = false;

                if (this.fieldData[i].value != undefined && 
                    this.fieldData[i].value != null && 
                    this.strLoggerClass != null && 
                    this.strLoggerClass != undefined) {
                    this.logTheView(this.strLoggerClass,
                                    this.objectApiName, 
                                    this.fieldData[i].fieldName,  
                                    this.recordId);
                }
            }
        }
    }

    logTheView(cm, obj, fld, rid) {
        viewLogger({ classMethod: cm, objectName: obj, fieldName: fld,  recordId: rid})
            .then((result) => {
                if (result != 'Success') {
                    const evt = new ShowToastEvent({title: 'Logger Error',
                                                    message: 'Logger Error: ' + result,
                                                    variant: 'error'});
                    this.dispatchEvent(evt);
                    this.error = result;
                }
            })
            .catch((error) => {this.error = error;
                this.result = undefined;
                const evt = new ShowToastEvent({title: 'Error',
                                                message: error.message,
                                                variant: 'error'});
                this.dispatchEvent(evt);
            });        
    }

    handleMaskClick(event) {
        for (var i = 0; i < this.fieldData.length; i++) {
            if (this.fieldData[i].fieldName == event.target.title) {
                this.fieldData[i].masked = true;
            }
        }
    }

    handleEditClick(event) {
        for (var i = 0; i < this.fieldData.length; i++) {
            if (this.fieldData[i].fieldName == event.target.title) {
                this.fieldData[i].editMode = true;
                this.changeField = this.fieldData[i].fieldName;
                this.changeLabel = this.fieldData[i].label;
                this.changeValue = undefined;
            }
        }
    }

    get showSaveButton() {
        for (var i = 0; i < this.fieldData.length; i++) {
            if (this.fieldData[i].fieldName == this.changeField &&
                this.changeValue != undefined &&
                this.changeValue != this.fieldData[i].value) {
                return true;
            }
        }
        return false;
    }

    handleInputChange(event) {
        for (var i = 0; i < this.fieldData.length; i++) {
            if (this.fieldData[i].label == event.target.label) {
                this.changeValue = event.target.value;
            }
        }
    }

    handleSaveClick(event) {
        for (var i = 0; i < this.fieldData.length; i++) {
            if (this.fieldData[i].fieldName == event.target.title) {
                if (this.changeValue != this.fieldData[i].value && this.changeValue != undefined) {
                    this.saveRecord(this.changeLabel, 
                                    this.changeField, 
                                    this.changeValue, 
                                    this.recordId, 
                                    this.objectApiName);
                }
            }
        }
    }
 
    handleCancelClick(event) {
        for (var i = 0; i < this.fieldData.length; i++) {
            if (this.fieldData[i].fieldName == event.target.title) {
                this.fieldData[i].editMode = false;
                this.changeField = undefined;
                this.changeLabel = undefined;
                this.changeValue = undefined;
                this.error = undefined;
            }
        }
    }

    saveRecord(lbl, fld, val, rid, obj) {
        updateField({ fieldName: fld, value: val, recordId: rid,  sObjectName: obj})
            .then((result) => {
                if (result == 'Success') {
                    const evt = new ShowToastEvent({title: 'Success',
                                                    message: 'Successfully Updated ' + lbl,
                                                    variant: 'success'});
                    this.dispatchEvent(evt);
                    this.error = undefined;
                    this.changeField = undefined;
                    this.changeLabel = undefined;
                    this.changeValue = undefined;
                    this.imperativeGetFields();
                } else {
                    const evt = new ShowToastEvent({title: 'Error',
                                                    message: result,
                                                    variant: 'error'});
                    this.dispatchEvent(evt);
                    this.error = result;
                }
            })
            .catch((error) => {this.error = error;
                               this.result = undefined;
                               const evt = new ShowToastEvent({title: 'Error',
                                                               message: error.message,
                                                               variant: 'error'});
                this.dispatchEvent(evt);
            });
    }
 
    imperativeGetFields() {
        getSecuredFields({ fieldList: this.strFieldMaskJSON, recordId: this.recordId, sObjectName: this.objectApiName })
            .then((data) => {
                if (data) {
                    this.fieldData = JSON.parse(data);
                    this.error = undefined;
        
                    for (var i = 0; i < this.fieldData.length; i++) {
                        this.fieldData[i].masked = true;
                        this.fieldData[i].editMode = false;
                     }
                } else if (error) {
                    this.error = error;
                    this.fieldData = 'undefined';
                }
            })
            .catch((error) => {this.error = error;
                               this.result = undefined;
                               const evt = new ShowToastEvent({title: 'Error',
                                                               message: 'Error retrieving Secured fields',
                                                               variant: 'error'});
                this.dispatchEvent(evt);
            });
    }
}
/* 
[
   {
      "field":"FinServ__TaxId__pc",
      "masker":"DataMasker.maskSSN",
      "perm2View":"Reveal Tax Id",
      "perm2Edit":"Reveal Tax Id"
   },
   {
      "field":"PersonBirthdate",
      "masker":"DataMasker.maskDate"
   }
]
*/