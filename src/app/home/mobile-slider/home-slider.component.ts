import { Component, OnInit } from '@angular/core';
import { AdvertService } from '../../services/advert.service';

@Component({
    selector: 'mobile-slider',
    templateUrl: './home-slider.component.html',
    styleUrls: ['./home-slider.component.scss']
})
export class MobileSliderComponent implements OnInit {
    ads;
    options = {
        speed:  100000,
        width: "100%",
        height: "200px",
        opacity: "1"
    };
    constructor(
        private advertService: AdvertService,
    ) { }

    ngOnInit() { 
        let sec, tag;

        this.advertService.getShopAdverts(sec = "home slide", tag = "slide")
        .map(advert => {
          let urls = [];
            advert.forEach((a:any) => {
              urls.push(a.image_url);
            });
            return urls;
        })
        .subscribe((adv)=> {
          this.ads = adv;
        });
    }
}