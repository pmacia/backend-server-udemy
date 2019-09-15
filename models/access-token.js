// Modelo Token. Ejemplo:
//  {
//     "access_token": "e74d0ec86ba6c5cec94e10b632a056830e96220a",
//     "expires_in": 3600,
//     "token_type": "Bearer",
//     "scope": null,
//     "refresh_token": "5203fc6424b46d25fedcd338c238c86ba947d4ac"
//  }

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const accessTokenSchema = new Schema ({ 
        access_token: { type: String, requiere: [true, 'El token de acceso es necesario'] },
        expires_in: { type: Number, requiere: [true, 'La fecha de expiraión es necesaria'], default: 3600 },
        token_type: { type: String, requiere: false, default: 'Bearer' },
        scope: { type: String, requiere: false, default: null },
        refresh_token: { type: String, requiere: [true, 'El token de refresco es necesario'] },
}, { collection: 'accesstoken' });

module.exports = mongoose.model('AccessToken', accessTokenSchema);
