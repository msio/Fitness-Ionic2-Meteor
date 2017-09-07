/**
 * Created by msio on 10/25/16.
 */

export const HAS_LOGGED_IN = 'HAS_LOGGED_IN';

export const USER_DATA_EVENT_TYPE = {
    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT',
    SIGNUP: 'SIGNUP',
}

export const LIST_OF_INTERESTS = 'LIST_OF_INTERESTS';

export const TAB = {
    INTERESTS: 0,
    MATCHES: 1,
    CHATS: 2
}

/**
 * constant is used e.g. by generation of days list. how many days will be shown
 *
 * @type {number}
 */
export const NUMBER_OF_GENERATED_DAYS = 2;

export const USER_DATA_FIELD = {
    FIRST_NAME: 'firstName',
    LAST_NAME: 'lastName',
    GENDER: 'gender',
    BIRTHDAY: 'birthday',
    PICTURE: 'picture',
    PASSOWRD: 'password',
    EMAIL: 'email'
}

export const FB_LOGIN_STATUS = {
    CONNECTED: 'connected',
    NOT_AUTHORIZED: 'not_authorized',
    UNKNOWN: 'unknown'
}

export const CHECK_INTERVAL_ACTIVITY_START = 1000;

export const CURRENT_POSITION = {
    YES: 'YES',
    NO: 'NO'
}

export const POSITION_SELECTOR_BACK = 'positionSelectorBack';

export const LOGIN_TOKEN = 'loginToken';

export const POKES_BADGE_COUNT = 'pokesBadgeCount';

export const MATCHES_BADGE_COUNT = 'matchesBadgeCount';

export const USER_DATA_STORAGE = 'userDataStorage';

export const USER_PICTURES_STORAGE = 'userPicturesStorage';

export const USER_PROFILE_BACK = 'newUserProfileBack';

export const ABOUT_BACK = 'aboutBack';

export const MAX_NUMBER_OF_UPLOAD_PICTURES = 5;

// in km
export const MAX_LOCATION_RADIUS = 30;

// timeout to get current position
export const CURRENT_POSITION_TIMEOUT = 5000;

export const MEMBERSHIP_DETAILS_CURRENT_LOCATION_PERMISSION_STATE = 'memDetailsCLPermState';

export const PIPE_DISTANCE_FORMAT = '1.0-1';

//in ms
export const POSITION_BAR_TIMEOUT_HIDE = 3000;
