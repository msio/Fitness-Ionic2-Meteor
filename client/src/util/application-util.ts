import {PAGE_ENUM} from "../enums/enums";
export class ApplicationUtil {
    static DeviceId;
    static tabIndex: number;
    static currentPage: PAGE_ENUM;
    static fromBackground: boolean = false;

    static setDeviceId(deviceIds) {
        ApplicationUtil.DeviceId = deviceIds;
    }

    static setCurrentPage(currentPage: PAGE_ENUM) {
        this.currentPage = currentPage;
    }

    static isCurrentPage(currentPage: PAGE_ENUM): boolean {
        return this.currentPage === currentPage;
    }

    static setTabIndex(tabIndex: number) {
        this.tabIndex = tabIndex;
    }

    static getTabIndex() {
        return this.tabIndex;
    }


}