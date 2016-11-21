import Auth0 from 'auth0-js';
import Auth0Lock from 'auth0-lock';
import { Promise } from 'es6-promise';
import 'isomorphic-fetch';


export class Auth0Widget {

    constructor(clientId, domain, logoSingle, primaryColor) {
        this.lock = new Auth0Lock(clientId, domain,  {
            closable: false,
            theme: {
                logo: logoSingle,
                primaryColor: primaryColor
            },
            languageDictionary: {
                title: 'Ocelot',
            }
        });

        this.lock.on('authorization_error', this._authorizationError.bind(this));
        this.lock.on('unrecoverable_error', this._unrecoverableError.bind(this));
    }

    showLoginWidget() {
        this.lock.show();
    }

    // TODO(horia141): better error handling
    _authorizationError(error) {
        console.log('Authentication Error', error);
    }

    // TODO(horia141): better error handling    
    _unrecoverableError(error) {
        console.log('Unrecoverable Error', error);
    }
}


export class IdentityService {
    
    constructor(clientId, domain, identityServiceDomain) {
        const auth0 = new Auth0({clientID: clientId, domain: domain});

        let authResult = null;
	if (window !== undefined) {
	    authResult = auth0.parseHash(window.location.hash);
	}

        let accessToken = null;
        if (authResult && authResult.accessToken && authResult.idToken) {
            accessToken = authResult.accessToken;
            this._setAccessToken(authResult.accessToken);
        } else {
            accessToken = this.getAccessToken();
        }
            
        this._accessToken = accessToken; // Might be null!
        this._identityServiceDomain = identityServiceDomain
    }

    loggedIn() {
        const token = this.getAccessToken()
        return !!token;
    }

    getUserFromService() {
        const accessToken = this._accessToken;
        return new Promise(
            (resolve, reject) => {
                if (accessToken == null) {
                    reject(401);
                    return;
                }

		const options = {
		    method: 'GET',
		    headers: {'Authorization': `Bearer ${accessToken}`},
		    mode: 'cors',
		    cache: 'no-cache',
		    redirect: 'error',
		    referrer: 'client'
		};

		fetch(`http://${this._identityServiceDomain}/user`, options)
		      .then((response) => {
			  if (response.ok) {
			      response.json()
				  .then((json) => {
				      resolve(json.user);
				  })
				  .catch((error) => {
				      reject(error);
				  });
			  } else if (response.status == 404) {
			      const creationOptions = Object.assign({}, options);
			      creationOptions.method = 'POST';

			      fetch(`http://${this._identityServiceDomain}/user`, creationOptions)
				    .then((response) => {
					if (response.ok) {
					    response.json()
						.then((json) => {
						    resolve(json.user);
						})
						.catch((error) => {
						    reject(error);
						});
					} else {
					    reject(respponse.status);
					}
				    })
				    .catch((error) => {
					reject(error);
				    });
			  } else {
			      reject(response.status);
			  }
		      })
		      .catch((error) => {
			  reject(error);
		      });
            });
    }

    logout() {
        localStorage.removeItem('access_token');
    }

    _setAccessToken(accessToken) {
        localStorage.setItem('access_token', accessToken)
    }

    getAccessToken() {
        return localStorage.getItem('access_token')
    }
}
