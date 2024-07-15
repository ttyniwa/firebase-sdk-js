"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenManager = void 0;
const MARGIN_OF_EXPIRES_SECONDS = 300;
class TokenManager {
    constructor(admin, authorizationCode, cryptor) {
        this.admin = admin;
        this.authorizationCode = authorizationCode;
        this.cryptor = cryptor;
        this.tokenCache = {};
    }
    /**
     * Get token with handling refresh token
     */
    async get(userId) {
        const freeeToken = await this.getTokenFromFirebase(userId);
        if (this.tokenExpired(freeeToken)) {
            console.log(`accessToken has been expired for user:`, userId);
            try {
                return await this.refreshToken(freeeToken, userId);
            }
            catch (error) {
                if (error.output && error.output.statusCode === 401) {
                    console.log('Token is already refreshed in other instance:', error);
                    const newToken = await this.getTokenFromFirebase(userId, true);
                    if (this.tokenExpired(newToken)) {
                        console.error('Can not get available token:', error);
                        throw error;
                    }
                    return newToken.accessToken;
                }
                else {
                    throw error;
                }
            }
        }
        else {
            return freeeToken.accessToken;
        }
    }
    /**
     * Get token with handling refresh token
     */
    async save(userId, email, freeeToken) {
        const token = await this.encrypt(freeeToken);
        // Save freee token to firestore
        await this.admin
            .firestore()
            .doc(`/freeeTokens/${userId}`)
            .set(Object.assign(Object.assign({}, token), { email }));
    }
    async createCryptoKey(date) {
        if (this.cryptor) {
            await this.cryptor.createCryptoKey(date);
        }
    }
    async refreshToken(freeeToken, userId) {
        // refresh
        const tokenObject = {
            access_token: freeeToken.accessToken,
            refresh_token: freeeToken.refreshToken,
            expires_in: freeeToken.expiresIn,
        };
        const accessToken = this.authorizationCode.createToken(tokenObject);
        const newToken = await accessToken.refresh();
        // encrypt and cache
        const token = (await this.encrypt({
            accessToken: newToken.token.access_token,
            refreshToken: newToken.token.refresh_token,
            expiresIn: newToken.token.expires_in,
            createdAt: newToken.token.created_at,
        }));
        this.tokenCache[userId] = token;
        // save token to firestore
        await this.admin
            .firestore()
            .doc(`/freeeTokens/${userId}`)
            .set(Object.assign({}, token), { merge: true });
        console.log('accessToken is successfully refreshed for user:', userId);
        return newToken.token.access_token;
    }
    tokenExpired(freeeToken) {
        const expiredSeconds = freeeToken.createdAt + freeeToken.expiresIn - MARGIN_OF_EXPIRES_SECONDS;
        const nowInSeconds = new Date().getTime() / 1000;
        const shouldRefresh = nowInSeconds >= expiredSeconds;
        return shouldRefresh;
    }
    async getTokenFromFirebase(userId, fromFirestore) {
        if (!fromFirestore) {
            const cachedToken = this.tokenCache[userId];
            if (cachedToken) {
                return await this.decrypt(cachedToken);
            }
        }
        const snap = await this.admin
            .firestore()
            .doc(`/freeeTokens/${userId}`)
            .get();
        const token = snap.data();
        this.tokenCache[userId] = token;
        console.log('Token is retrieved from firestore for user:', userId);
        return await this.decrypt(token);
    }
    async encrypt(freeeToken) {
        return this.cryptor ? await this.cryptor.encrypt(freeeToken) : freeeToken;
    }
    async decrypt(freeeToken) {
        return this.cryptor ? await this.cryptor.decrypt(freeeToken) : freeeToken;
    }
}
exports.TokenManager = TokenManager;
//# sourceMappingURL=token-manager.js.map