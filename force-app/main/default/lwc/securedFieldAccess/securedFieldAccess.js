import { LightningElement, api, wire, track} from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getSecuredFields from '@salesforce/apex/SecuredFieldAccess.getFields';
import updateField from '@salesforce/apex/SecuredFieldAccess.updateField';
import viewLogger from '@salesforce/apex/SecuredFieldAccess.callViewLogger';
import { refreshApex } from '@salesforce/apex';

export default class SecuredFieldAccess extends LightningElement {
    @api objectApiName;
    @api recordId;
    @api strFieldMaskJSON;
    @api strViewLoggerClass;
    @api strChangeLoggerClass;
    @api strTitle;
    @api strOutput;
    @api sectionReveal;

    @track fieldData;
    changeField;
    changeValue;
    changeLabel;

    @track error;

    sectionReveal = false;

    refreshedData;

    @wire(getSecuredFields, { fieldList: '$strFieldMaskJSON', recordId: '$recordId', sObjectName: '$objectApiName' })
    wiredFields( result ) {
        this.refreshedData = result;
        if (result.data) {
            this.fieldData = JSON.parse(result.data);
            this.error = undefined;

            for (var i = 0; i < this.fieldData.length; i++) {
                this.fieldData[i].masked = true;
                this.fieldData[i].editMode = false;
             }
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
                    this.strViewLoggerClass != null && 
                    this.strViewLoggerClass != undefined) {
                    this.logTheView(this.strViewLoggerClass,
                                    this.objectApiName, 
                                    this.fieldData[i].fieldName,  
                                    this.recordId,
                                    'Revealed from ' + window.location.pathname);
                }
            }
        }
    }

    logTheView(cm, obj, fld, rid, dtl) {
        viewLogger({ classMethod: cm, objectName: obj, fieldName: fld,  recordId: rid, detail: dtl})
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

    handleSectionRevealClick(event) {
        this.sectionReveal = !(this.sectionReveal);
        if (!this.sectionReveal) {
            for (var i = 0; i < this.fieldData.length; i++) {
                this.fieldData[i].editMode = false;
            }
            this.changeField = undefined;
            this.changeLabel = undefined;
            this.changeValue = undefined;
            this.error = undefined;
        }
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

                if (this.fieldData[i].value != undefined && 
                    this.fieldData[i].value != null && 
                    this.strViewLoggerClass != null && 
                    this.strViewLoggerClass != undefined) {
                    this.logTheView(this.strViewLoggerClass,
                                    this.objectApiName, 
                                    this.fieldData[i].fieldName,  
                                    this.recordId,
                                    'Revealed for editing from ' + window.location.pathname);
                }
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
                                    this.objectApiName,
                                    ((this.strChangeLoggerClass != undefined && this.strChangeLoggerClass != null && this.strChangeLoggerClass != '') ? this.strChangeLoggerClass : null));
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

    saveRecord(lbl, fld, val, rid, obj, logcls) {
        updateField({ fieldName: fld, value: val, recordId: rid,  sObjectName: obj, logClass: logcls, detail: 'Changed from ' + window.location.pathname})
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

                    refreshApex(this.refreshedData);
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