"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FreeeFirebaseAuthClient = void 0;
class FreeeFirebaseAuthClient {
    constructor(admin, authorizationCode, axios, tokenManager, config) {
        this.admin = admin;
        this.authorizationCode = authorizationCode;
        this.axios = axios;
        this.tokenManager = tokenManager;
        // path setting
        this.redirectPath = config.redirectPath;
        this.callbackPath = config.callbackPath;
        this.companiesPath = config.companiesPath;
        this.homePath = config.homePath;
        this.appHost = config.appHost;
        this.authHost = config.authHost;
    }
    /**
     * Redirect screen to authorize
     */
    redirect(res) {
        const redirectUri = this.authorizationCode.authorizeURL({
            redirect_uri: `${this.authHost}${this.callbackPath}`,
        });
        res.redirect(redirectUri);
    }
    /**
     * Get token, save it to firebase and login firebase
     */
    async callback(code, res) {
        try {
            const result = await this.authorizationCode.getToken({
                code: code,
                redirect_uri: `${this.authHost}${this.callbackPath}`,
            });
            const freeeToken = {
                accessToken: result.token.access_token,
                refreshToken: result.token.refresh_token,
                expiresIn: result.token.expires_in,
                createdAt: result.token.created_at,
            };
            // get freee user
            const response = await this.getFreeeUser(freeeToken.accessToken);
            const id = response.data.user.id;
            const email = response.data.user.email;
            // consider null value of displayName
            const displayName = response.data.user.display_name
                ? response.data.user.display_name
                : '';
            // Create a Firebase Account and get the custom Auth Token.
            const firebaseToken = await this.createFirebaseAccount(id, email, displayName, freeeToken);
            // redirect to home path with token info
            res.redirect(`${this.appHost}${this.homePath}?token=${firebaseToken}`);
        }
        catch (error) {
            console.error('Some error occured on login process:', error);
            res.send(this.signInRefusedTemplate());
        }
    }
    getFreeeUser(accessToken) {
        return this.axios.get('/api/1/users/me?companies=true', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
    }
    /**
     * create firebase account and token
     */
    async createFirebaseAccount(id, email, displayName, freeeToken) {
        const uid = id.toString();
        await this.tokenManager.save(uid, email, freeeToken);
        // Create or update the user account.
        await this.admin
            .auth()
            .updateUser(uid, {
            email: email,
            displayName: displayName,
        })
            .catch(async (error) => {
            if (error.code === 'auth/user-not-found') {
                return await this.admin.auth().createUser({
                    uid: uid,
                    email: email,
                    displayName: displayName,
                });
            }
            throw error;
        });
        return await this.admin.auth().createCustomToken(uid);
    }
    /**
     * Script for redirection when user refuse sign-up
     */
    signInRefusedTemplate() {
        return `
      <script>
        window.location.href = '${this.appHost}'
      </script>`;
    }
}
exports.FreeeFirebaseAuthClient = FreeeFirebaseAuthClient;
//# sourceMappingURL=freee-firebase-auth-client.js.map