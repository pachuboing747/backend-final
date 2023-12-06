const ManagerFactory = require('../dao/managers/manager.Mongo/factory.manager.js');
const UserModel = require('../dao/models/user.model.js');
const nodemailer = require('nodemailer');
const {mail} = require ("../config/config.js")


const userManager = ManagerFactory.getManagerInstance('users');


const create = async (req, res) => {
  const { body } = req;
  const created = await userManager.create(body);
  res.send(created);
}

const changeUserRole = async (req, res) => {
  const userId = req.params.uid;
  const newRole = req.body.role;

  if (req.isAuthenticated()) {
    try {
      const userToChange = await userManager.getById(userId);

      if (!userToChange) {
        return res.status(404).json({ message: 'Usuario no encontrado.' });
      }

      if (req.user.role === 'admin') {
        userToChange.role = newRole;

        await userToChange.save();

        return res.status(200).json({ message: 'Rol de usuario actualizado con éxito' });
      } else {
        return res.status(403).json({ message: 'No tienes permiso para realizar esta acción.' });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error al actualizar el rol de usuario' });
    }
  } else {
    return res.status(403).json({ message: 'No estás autenticado.' });
  }
};

const documents = async (req, res) => {
  try {
    const { uid } = req.params;
    const uploadedFiles = req.files;

    if (!uploadedFiles) {
      return res.status(400).json({ error: 'No se han subido archivos.' });
    }

    const user = await UserModel.findById(uid);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const userDocuments = uploadedFiles.map(file => ({
      name: file.originalname,
      reference: file.path,
    }));

    user.documents = userDocuments;

    await user.save();

    res.status(200).json({ message: 'Documentos subidos exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

const getAllUsers = async (req, res) => {
  try {
    const allUsers = await userManager.getAll();
  
    const simplifiedUsers = allUsers.map(user => ({
      name: user.name,
      email: user.email,
      role: user.role,
    }));

    res.status(200).json(simplifiedUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  auth: {
     user: mail.GMAIL_ADDRESS,
     pass: mail.GMAIL_PWD
  }
});

const deleteInactiveUsers = async (req, res) => {
  try {
    const inactiveThreshold = new Date();
    inactiveThreshold.setDate(inactiveThreshold.getDate() - 2);

    const inactiveUsers = await userManager.find({ lastConnection: { $lt: inactiveThreshold } });

    const deletionPromises = inactiveUsers.map(async (user) => {
      const mailOptions = {
        from: 'tu_correo@gmail.com',
        to: user.email,
        subject: 'Eliminación de cuenta por inactividad',
        text: `Hola ${user.name},\nTu cuenta ha sido eliminada por inactividad en nuestro sistema.`,
      };

      await transporter.sendMail(mailOptions);

      await userManager.delete(user._id);
    });

    await Promise.all(deletionPromises);

    res.status(200).json({ message: 'Usuarios inactivos eliminados correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};



module.exports = {
  create,
  changeUserRole,
  documents,
  getAllUsers,
  deleteInactiveUsers,
};

