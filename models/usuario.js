// const usuarioNuevo = { 
//     nombre: "Paco",
//     email: "pmacia@ua.es",
//     password: "1234",
//     img: "img.png",
//     role: "ADMIN_ROLE"
// };


var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var rolesValidos = {
        values: ['ADMIN_ROLE', 'USER_ROLE'],
        message: '{VALUE} no es un rol válido'
};

const usuarioSchema = new Schema ({ 
        nombre: { type: String, requiere: [true, 'El nombre es necesario'] },
        email: { type: String, unique:true, requiere: [true, 'El correo es necesario'] },
        password: { type: String, requiere: [true, 'La contraseña es necesaria'] },
        img: { type: String, requiere:false },
        role: { type: String, requiere: true, default: 'USER_ROLE', enum: rolesValidos },
        google: { type: Boolean, default: false } 
});

usuarioSchema.plugin(uniqueValidator, {message: '{PATH} debe ser único.'});


module.exports = mongoose.model('Usuario', usuarioSchema);
