export interface UserData {
    firstName: string;
    lastName: string;
    gender: string;
    birthday: string;
    //type: facebook | set-by-user
    email: {value: string,type: string}
    //type: blob | url or picture will be null if no pic is set
    picture: string
}

export interface UserDataPassword extends UserData {
    password: string,
}

export interface AuthFacebook {
    accessToken: string;
    expiresIn: number;
    userID: string;
}