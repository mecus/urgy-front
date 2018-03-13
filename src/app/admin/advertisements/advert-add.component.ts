import { Component, OnInit, HostListener } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { UploadImageService } from '../services/image-upload.service';
import { StoreService } from '../services/store.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import * as Rx from 'rxjs/Rx';

@Component({
    selector: 'admin-advert-add',
    templateUrl: './advert-add.component.html',
    styleUrls: ['./adverts.component.scss']
})
export class AdvertAddComponent implements OnInit {
    statusdMsg;
    files;
    formInput: FormGroup;
    color;
    timer = Rx.Observable.timer(2000);

    sections = ["home", "home slide", "department", "product", "product offer"];
    constructor(
        private fb: FormBuilder, 
        private uploadImage: UploadImageService,
        private storeService: StoreService,
        private _router: Router
    )  { 
        this.formGroup();
    }

    formGroup(){
        this.formInput = this.fb.group({
            title: ["", Validators.required],
            section: ["", Validators.required],
            image_name: [""],
            tag: [""],
            image_url: [""]
        });
    }
    @HostListener('change', ['$event']) fileCahnge(e:any){
        e.preventDefault();
        e.stopPropagation();
        if(!e.target.files){
            return;
        }
        this.files = e.target.files[0];
    }
    async sendAdvert(ad){
        console.log(ad);
        if(!this.files){
            this.color = 'red';
            return this.statusdMsg = "Please upload image before submitting";
        }
        this.color = 'blue';
        this.statusdMsg = "Image Upload Started....";
        let path = 'adverts/';
        let imageUrl = await this.uploadImage.uploadImage(this.files, path);
        if(imageUrl){
            this.color = 'green';
            this.statusdMsg = "Image Upload Completed!! Saving files in the database...";
            ad.image_url = imageUrl.downloadURL;
            ad.image_name = this.files.name;
            this.storeService.saveAdvert(ad).then((res)=>{
                console.log(res)
                this.color = 'green';
                this.statusdMsg = "Process Completed Successfully";
                this.timer.subscribe(T => {
                    this._router.navigate(["/admin/advertisements"]);
                })
            })
            .catch((err)=> {
                console.log(err);
            });
        }
    }
    ngOnInit() {

     }
}