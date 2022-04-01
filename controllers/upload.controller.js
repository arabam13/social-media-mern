const UserModel = require("../models/user.model");
const fs = require("fs");
const streamifier = require("streamifier");
// const { promisify } = require("util");
// const pipeline = promisify(require("stream").pipeline);
const { uploadErrors } = require("../utils/errors.utils");
const path = require("path");

module.exports.uploadProfil = async (req, res) => {
  try {
    // console.log(req.file);
    if (
      req.file.mimetype != "image/jpeg" &&
      req.file.mimetype != "image/png" &&
      req.file.mimetype != "image/jpg"
    )
      throw Error("invalid file");

    if (req.file.size > 500000) throw Error("max size");
  } catch (err) {
    const errors = uploadErrors(err);
    return res.status(201).json({ errors });
  }

  const fileName = req.body.name + ".jpg";

  // path_file = `${__dirname}/../client/public/uploads/profil`;
  const __dirname = path.resolve();
  const path_file = path.join(
    __dirname,
    "client",
    "public",
    "uploads",
    "profil"
  );

  const pathWithFile = path.join(path_file, fileName);
  console.log(pathWithFile);
  if (fs.existsSync(pathWithFile)) {
    // console.log("file exists!!");
    fs.unlink(pathWithFile, (err) => {
      if (err) {
        console.error(err);
      }
      // console.log("file deleted!");
    });
  }

  const writeStream = fs.createWriteStream(pathWithFile);
  await streamifier.createReadStream(req.file.buffer).pipe(writeStream);

  try {
    await UserModel.findByIdAndUpdate(
      req.body.userId,
      { $set: { picture: "./uploads/profil/" + fileName } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )
      .then((data) => res.send(data))
      .catch((err) => res.status(500).send({ message: err }));
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};
