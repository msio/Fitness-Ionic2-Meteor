import {Injectable} from '@angular/core';

@Injectable()
export class TabsService {

    constructor() {
    }

    /**
     *
     * @param footerHeight:string passes directly to css property marginBottom
     */
    public hide(footerHeight?: string) {
        let tabs = document.querySelectorAll('.tabbar');
        let footer = document.querySelectorAll('.footer');
        let scrollContent = document.querySelectorAll('.scroll-content');
        if (tabs !== null) {
            Object.keys(tabs).map((key) => {
                tabs[key].style.transform = 'translateY(56px)';
            });

            // fix for removing the margin if you got scrollable content
            setTimeout(() => {
                Object.keys(scrollContent).map((key) => {
                    scrollContent[key].style.marginBottom = footerHeight ? footerHeight : '0';
                });
                Object.keys(footer).map((key) => {
                    footer[key].style.bottom = '0px';
                });
            });
        }
    }

    public show() {
        let tabs = document.querySelectorAll('.tabbar');
        if (tabs !== null) {
            Object.keys(tabs).map((key) => {
                tabs[key].style.transform = 'translateY(0px)';
            });
        }
        let scrollContent = document.querySelectorAll('.scroll-content');
        Object.keys(scrollContent).map((key) => {
            scrollContent[key].style.marginBottom = '56px';
        });

    }
}
