/**
 * Created by msio on 2/15/17.
 */


export class ApplicationUtil {

    private static facebookAccessToken: string;

    static  setFacebookAccesToken(token: string) {
        this.facebookAccessToken = token;
    }

    static  getFacebookAccesToken() {
        return this.facebookAccessToken;
    }
}