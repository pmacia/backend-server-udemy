var mongoose = require('mongoose');
//var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

// var rolesValidos = {
//         values: ['ADMIN_ROLE', 'USER_ROLE'],
//         message: '{VALUE} no es un rol válido'
// };

// const hospitalSchema = new Schema ({ 
//         nombre: { type: String, requiere: [true, 'El nombre es necesario'] },
//         email: { type: String, unique:true, requiere: [true, 'El correo es necesario'] },
//         password: { type: String, requiere: [true, 'La contraseña es necesaria'] },
//         img: { type: String, requiere:false },
//         role: { type: String, requiere: true, default: 'USER_ROLE', enum: rolesValidos }
// });

// hospitalSchema.plugin(uniqueValidator, {message: '{PATH} debe ser único.'});

// const usuarioNuevo = { 
//     nombre: "Paco",
//     email: "pmacia@ua.es",
//     password: "1234",
//     img: "img.png",
//     role: "ADMIN_ROLE"
// };

var hospitalSchema = new Schema({
        nombre: { type: String, required: [true, 'El nombre es necesario'] },
        img: {	type: String,	required: false },
        usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' }
}, { collection: 'hospitales' });


module.exports = mongoose.model('Hospital', hospitalSchema);
