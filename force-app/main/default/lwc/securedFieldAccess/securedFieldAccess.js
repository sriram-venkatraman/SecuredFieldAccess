import { LightningElement, api, wire, track} from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getSecuredFields from '@salesforce/apex/SecuredFieldAccess.getFields';
import updateField from '@salesforce/apex/SecuredFieldAccess.updateField';

export default class SecuredFieldAccess extends LightningElement {
    @api objectApiName;
    @api recordId;
    @api strFieldMaskJSON;
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
            // console.log('Sriram: ' + JSON.stringify(this.fieldData));
            this.error = undefined;

            for (var i = 0; i < this.fieldData.length; i++) {
                this.fieldData[i].masked = true;
                this.fieldData[i].editMode = false;
             }
        } else if (error) {
            this.error = error;
            this.fieldData = 'undefined';
            console.log('Totally Messed Up: ' + JSON.stringify(this.error));
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
            }
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
 
    handleInputChange(event) {
        for (var i = 0; i < this.fieldData.length; i++) {
            if (this.fieldData[i].label == event.target.label) {
                this.changeValue = event.target.value;
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
        console.log('I came here');
        getSecuredFields({ fieldList: this.strFieldMaskJSON, recordId: this.recordId, sObjectName: this.objectApiName })
            .then((data) => {
                if (data) {
                    this.fieldData = JSON.parse(data);
                    console.log('Sriram: ' + JSON.stringify(this.fieldData));
                    this.error = undefined;
        
                    for (var i = 0; i < this.fieldData.length; i++) {
                        this.fieldData[i].masked = true;
                        this.fieldData[i].editMode = false;
                     }
                } else if (error) {
                    this.error = error;
                    this.fieldData = 'undefined';
                    console.log('Totally Messed Up: ' + JSON.stringify(this.error));
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