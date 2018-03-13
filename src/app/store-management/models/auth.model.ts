
export interface Address {
    address_type: string,
    address: string,
    city: string,
    post_code: string,
    country: string
}
export interface Auth {
    uid: Number,
    type: string,
    displayName: string,
    photoURL: string,
    email: string,
    phone: string,
    status: string
    timeIn: Number,
    timeOut: Number,
    token: string
    who: string,
    emailVerified: Boolean,
    account_id: string,
    address: Address
}