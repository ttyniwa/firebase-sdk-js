"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FreeeFirebaseAuthClient = void 0;
const config_manager_1 = require("../services/config-manager");
class FreeeFirebaseAuthClient {
    constructor(admin, oauth2, axios, tokenManager, config) {
        this.admin = admin;
        this.oauth2 = oauth2;
        this.axios = axios;
        this.tokenManager = tokenManager;
        // path setting
        this.clientId = config_manager_1.ConfigManager.config.freee.client_id;
        this.clientSecret = config_manager_1.ConfigManager.config.freee.client_secret;
        this.redirectPath = config_manager_1.ConfigManager.getFreeeConfig(config, 'redirectPath');
        this.callbackPath = config_manager_1.ConfigManager.getFreeeConfig(config, 'callbackPath');
        this.companiesPath = config_manager_1.ConfigManager.getFreeeConfig(config, 'companiesPath');
        this.homePath = config_manager_1.ConfigManager.getFreeeConfig(config, 'homePath');
        this.appHost = config_manager_1.ConfigManager.getFreeeConfig(config, 'appHost');
        this.authHost = config_manager_1.ConfigManager.getFreeeConfig(config, 'authHost');
        this.apiKey = config.firebase && config.firebase.apiKey;
    }
    /**
     * Redirect screen to authorize
     */
    redirect(res) {
        const redirectUri = this.oauth2.authorizationCode.authorizeURL({
            redirect_uri: `${this.authHost}${this.getCallbackPath()}`,
        });
        res.redirect(redirectUri);
    }
    /**
     * Get token, save it to firebase and login firebase
     */
    async callback(code, res) {
        try {
            const result = await this.oauth2.authorizationCode.getToken({
                client_id: this.clientId,
                client_secret: this.clientSecret,
                code: code,
                redirect_uri: `${this.authHost}${this.getCallbackPath()}`,
            });
            const freeeToken = {
                accessToken: result.access_token,
                refreshToken: result.refresh_token,
                expiresIn: result.expires_in,
                createdAt: result.created_at,
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
    /**
     * path for redirect on freee authorization
     */
    getRedirectPath() {
        return this.redirectPath;
    }
    /**
     * path for callback on freee authorization
     */
    getCallbackPath() {
        return this.callbackPath;
    }
    /**
     * path for callback on freee authorization
     */
    getCompaniesPath() {
        return this.companiesPath;
    }
    /**
     * Create crypto key to bucket for it by specified date
     */
    async createCryptoKey(date) {
        await this.tokenManager.createCryptoKey(date);
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