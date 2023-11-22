const { User } = require("../db/models/usersModel");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const shortid = require("shortid");
const jwt = require("jsonwebtoken");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


const ITEMS_PER_PAGE_USERS = 20;
// const { sendEmailCopnfig } = require("../helpers/emailServices");



const createUser = async (email, password, phone, baseUrl) => {
  const directorEmail = ["tarassirenko71@gmail.com"]
  const emailExists = await User.findOne({ email: email });
  if (emailExists) return "Email already in use" 
  
  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationToken = uuidv4();

  const msg = {
    to: email,
    from: "tarassirenko71@gmail.com",
    subject: "Test email confirmation at login",
    text: `Вітаемо! Дякуємо за реєстрацію на нашому веб-сайті. Щоб завершити процес реєстрації та підтвердити вашу адресу електронної пошти, будь ласка, використовуйте нижченаведене посилання: <a href="${baseUrl}/api/users/verify/${verificationToken}">Посилання на підтвердження</a> Це посилання дійсне протягом обмеженого часу. Якщо ви не реєструвалися на нашому веб-сайті, просто ігноруйте це повідомлення. 
Дякуємо за обрання нашого сервісу!З повагою, Tools Lemaev`,

    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Підтвердження адреси електронної пошти</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      color: #707070;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }

    .container {
      max-width: 600px;
      margin: 50px auto;
      padding: 20px;
      background-color: #fff;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }

    h1 {
      color: #da9022;
    }

    p {
      margin-bottom: 20px;
    }

    a {
      display: inline-block;
      margin-top: 15px;
      padding: 10px 20px;
      background-color: #da9022;
      color: #fff;
      text-decoration: none;
      border-radius: 5px;
    }

    a:hover {
      background-color: #b56b16;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Вітаємо!</h1>
    <p>
      Дякуємо за реєстрацію на нашому веб-сайті. Щоб завершити процес реєстрації та підтвердити вашу адресу електронної пошти, будь ласка, використовуйте нижченаведене посилання:
    </p>
    <a href="${baseUrl}/api/users/verify/${verificationToken}">Посилання на підтвердження</a>
    <p>
      Це посилання дійсне протягом обмеженого часу. Якщо ви не реєструвалися на нашому веб-сайті, просто ігноруйте це повідомлення.
    </p>
    <p>Дякуємо за обрання нашого сервісу!</p>
    <p>З повагою, Tools Lemaev</p>
  </div>
</body>
</html>`,
  };
  sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error(error);
    });

   return await User.create({
     email,
     password: hashedPassword,
     verificationToken,
     phone,
     subscription: directorEmail.includes(email) ? "director" : "client",
   });
};
const userVerificationCheck = async (verificationToken) => {
  const user = await User.findOne({ verificationToken });
  if (!user) return null
  return await User.findOneAndUpdate(
    { _id: user.id },
    { $set: { verificationToken: null, verify: true } }
  );
};

const reVerification = async (email, baseUrl) => {
  const user = await User.findOne({ email });
  if (!user) return "user"
  if (user.verify) return null;

  const verificationToken = uuidv4();
  const msg = {
    to: email,
    from: "tarassirenko71@gmail.com",
    subject: "Test email confirmation at login",
    text: `Вітаемо!

Дякуємо за реєстрацію на нашому веб-сайті. Щоб завершити процес реєстрації та підтвердити вашу адресу електронної пошти, будь ласка, використовуйте нижченаведене посилання:

<a href="${baseUrl}/api/users/verify/${verificationToken}">Посилання на підтвердження</a>

Це посилання дійсне протягом обмеженого часу. Якщо ви не реєструвалися на нашому веб-сайті, просто ігноруйте це повідомлення. 

Дякуємо за обрання нашого сервісу!

З повагою, Tools Lemaev`,

    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Підтвердження адреси електронної пошти</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      color: #707070;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }

    .container {
      max-width: 600px;
      margin: 50px auto;
      padding: 20px;
      background-color: #fff;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }

    h1 {
      color: #da9022;
    }

    p {
      margin-bottom: 20px;
    }

    a {
      display: inline-block;
      margin-top: 15px;
      padding: 10px 20px;
      background-color: #da9022;
      color: #fff;
      text-decoration: none;
      border-radius: 5px;
    }

    a:hover {
      background-color: #b56b16;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Вітаємо!</h1>
    <p>
      Дякуємо за реєстрацію на нашому веб-сайті. Щоб завершити процес реєстрації та підтвердити вашу адресу електронної пошти, будь ласка, використовуйте нижченаведене посилання:
    </p>
    <a href="${baseUrl}/api/users/verify/${verificationToken}">Посилання на підтвердження</a>
    <p>
      Це посилання дійсне протягом обмеженого часу. Якщо ви не реєструвалися на нашому веб-сайті, просто ігноруйте це повідомлення.
    </p>
    <p>Дякуємо за обрання нашого сервісу!</p>
    <p>З повагою, Tools Lemaev</p>
  </div>
</body>
</html>`,
  };
  sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error(error);
    });

  return await User.findOneAndUpdate(
    { _id: user.id },
    { $set: { verificationToken } }
  );
};

const loginUser = async (email, password) => {

  const user = await User.findOne({ email: email });
  console.log(user);
    if (!user) return null;
  if (!user?.verify) return "Not verified";

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) return "Wrong password"
  const token = jwt.sign(
    {
      email: user.email,
      id: user._id.toString(),
      subscription: user.subscription,
    },
    process.env.JWT_SECRET
  );
  await User.findOneAndUpdate({ email: email }, { $set: { token } });

  return {
    token,
    user: { email, phone: user.phone, subscription: user.subscription },
  };
};

const logoutUser = async (userId) => {
  const user = await User.findOne({ _id: userId });
  if (!user) return null

  return await User.findOneAndUpdate(
    { _id: userId },
    { $set: { token: null } }
  );
};
const getUsers = async (page) => {
  const skip = (page-1)*ITEMS_PER_PAGE_USERS 
  return await User.find({}).skip(skip).limit(ITEMS_PER_PAGE_USERS);
};
const getUserById = async (userId) => {
  return await User.findOne({ _id: userId });
};
const getUserByPhone = async (phone) => {
  return await User.findOne({ phone: phone });
};
const deleteUserById = async (userId) => {
  return await User.findOneAndDelete({ _id: userId });
};


const updateUserStatus = async (userId, subscription) => {
    return await User.findOneAndUpdate(
    { _id: userId },
    { $set: { subscription } },
    { new: true }
  );
};

const addToAccess = async (userId, storeId) => {
  const user = await User.findOne({ _id: userId });
  if (!user) return null;
  if (user.subscription === "client") return "client";

  if (user.subscription === "seller") {
    return await User.findOneAndUpdate(
      { _id: userId },
      { $set: { availableStores: storeId } },
      { new: true }
    );
  }
  if (user.subscription === "manager") {
    return await User.findOneAndUpdate(
      { _id: userId },
      { $addToSet: { availableStores: { $each: storeId } } },
      { new: true }
    );
  }
};
const removeFromAccess = async (userId, storeId) => {
  const user = await User.findOne({ _id: userId });
  if (!user) return null;
  if (user.subscription === "client") return "client";

  if (user.subscription === "seller") {
    return await User.findOneAndUpdate(
      { _id: userId },
      { $set: { availableStores: null } },
      { new: true }
    );
  }
  if (user.subscription === "manager") {
    return await User.findOneAndUpdate(
      { _id: userId },
      { $pull: { availableStores: storeId  } },
      { new: true }
    );
  }
};

const updateUserStatistics = async (userId, resultOfCooperation) => {
  const user = await User.findOne({ _id: userId });
  if (!user) return null;
  if (user.subscription !== "client") return "not a client";
let updateData = {};

switch (resultOfCooperation) {
  case "GoodOrders":
    updateData = { $inc: { counterGoodOrders: 1 } };
    break;
  case "OverdueOrders":
    updateData = { $inc: { counterOverdueOrders: 1 } };
    break;
  case "BrokenTool":
    updateData = { $inc: { countereBrokenTool: 1 } };
    break;
  default:
    return null; 
}
return await User.findOneAndUpdate({ _id: userId }, updateData, { new: true });
 
};

const updateUserInfo = async (
  userId,
  name,
  seriesPassportNumber,
  email,
  phone
) => {
    const updateFields = {};
    if (name) updateFields.name = name;
    if (seriesPassportNumber)
      updateFields.seriesPassportNumber = seriesPassportNumber;
    if (email) updateFields.email = email;
    if (phone) updateFields.phone = phone;
 
  return await User.findOneAndUpdate(
    { _id: userId },
    { $set: updateFields },
    { new: true }
  );
};


const changePasswordRequest = async (email, baseUrl) => {

  const temporaryPassword = shortid.generate();
  const user = await User.findOne({ email });
  if (!user) return null
    const setPasswordToken = jwt.sign(
      {
        email: email,
        subscription: user.subscription,
        password: temporaryPassword,
      },
      process.env.JWT_SECRET
    );

  const updatedUser = await User.findOneAndUpdate(
      { email },
      { $set: { setPasswordToken } }
    );
  const msg = {
    to: email,
    from: "tarassirenko71@gmail.com",
    subject: "Test email confirmation at login",
    text: `Your temporary password is ${temporaryPassword}, follow the <a href="${baseUrl}/api/users/changePassword/${setPasswordToken}">link</a> to restore access. For better security, change the password to your personal one in the user settings.`,
    html: `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Відновлення доступу</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      color: #707070;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }

    .container {
      max-width: 600px;
      margin: 50px auto;
      padding: 20px;
      background-color: #fff;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }

    h1 {
      color: #da9022;
    }

    p {
      margin-bottom: 20px;
    }

    a {
      display: inline-block;
      margin-top: 15px;
      padding: 10px 20px;
      background-color: #da9022;
      color: #fff;
      text-decoration: none;
      border-radius: 5px;
    }

    a:hover {
      background-color: #b56b16;
    }

    .icon {
      width: 20px;
      height: 20px;
      margin-right: 10px;
      fill: #da9022;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Ваш тимчасовий пароль: ${temporaryPassword}</h1>
    <p>
      Щоб відновити доступ, перейдіть за нижченаведеним посиланням:
    </p>
    <a href="${baseUrl}/api/users/changePassword/${setPasswordToken}">
      Посилання на відновлення доступу
    </a>
    <p>
      Для забезпечення безпеки, будь ласка, змініть пароль на особистий у налаштуваннях користувача.
    </p>
    <p>Дякуємо за використання нашого сервісу!</p>
    <p>З повагою, Tools Lemaev</p>
  </div>
</body>
</html>`,
  };
  const result = await sgMail.send(msg);
  if (result.error) {
    console.error(result.error);
    return "email err";
  } else {
    console.log("Email sent");
  }

  return updatedUser;
};

const changePassword = async (setPasswordToken) => {
   const user = await User.findOne({ setPasswordToken });
  if (!user) return null
  const decodedToken = jwt.verify(setPasswordToken, process.env.JWT_SECRET);
  const { email, password } = decodedToken;

const hashedPassword = await bcrypt.hash(password, 10);


  const updatedUser = await User.findOneAndUpdate(
    { email },
    { $set: { password: hashedPassword, setPasswordToken: null } },
    { new: true }
  );
  return updatedUser;
};


const userChengePassword = async (newPassword, oldPassword,password,  userId) => {
 
const isPasswordValid = await bcrypt.compare(oldPassword, password);
if (!isPasswordValid) return "Wrong password";

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const user = await User.findOne({ _id: userId });
  if(!user) return null

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId},
      { $set: { password: hashedPassword } },
      { new: true }
    );

    return updatedUser;

};



module.exports = {
  createUser,
  userVerificationCheck,
  reVerification,
  loginUser,
  logoutUser,
  getUsers,
  getUserById,
  getUserByPhone,
  deleteUserById,
  updateUserStatus,
  addToAccess,
  removeFromAccess,
  updateUserStatistics,
  updateUserInfo,
  changePasswordRequest,
  changePassword,
  userChengePassword,
};
