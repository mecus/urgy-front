import { Component, OnInit } from '@angular/core';
import { StoreService } from '../services/store.service';
import { UploadImageService } from '../services/image-upload.service';

@Component({
    selector: 'admin-advert',
    templateUrl: './advert-list.component.html',
    styleUrls: ['./adverts.component.scss']
})
export class AdvertsComponent implements OnInit {
    advert$;
    constructor(
        private storeService: StoreService,
        private uploadImage: UploadImageService,
    ) { 
        this.advert$ = storeService.getAdverts()
        .map(snapshot => {
            return snapshot.map(ad => {
                let id = ad.payload.doc.id;
                let data = ad.payload.doc.data();
                return {id, ...data};
            })
        });
    }
    async removeAdvert(ad){
        let d = confirm("Are you sure");
        let path = "adverts/"
        if(d){
            let deletAd = await this.storeService.removeAdverts(ad.id);
            let deletIm = await this.uploadImage.removeStorageFile(path, ad.image_name);
            console.log("Advert Deleted:", deletAd);
            console.log("Image Removed:", deletIm);
            
        }
        
    }

    ngOnInit() { }
}