const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const { Schema } = mongoose;

const userSchema = new Schema({
  email: String,
  password: {
    hash: String,
    salt: String,
  },
  stream_key: String,
});

class UserClass {
  async generatePassword(plainPassword) {
    try {
      const salt = crypto.randomBytes(32).toString('hex'); // promisify
      const hash = await this.createHash(plainPassword, salt);
      return { hash, salt };
    } catch (error) {
      console.log(error);
    }
  }

  async validatePassword(plainPassword, hash, salt) {
    const hashToValidate = await this.createHash(plainPassword, salt);

    return hashToValidate === hash;
  }

  // https://www.rfc-editor.org/rfc/rfc2898.html
  createHash(plainPassword, salt) {
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(
        plainPassword,
        salt,
        10000,
        64,
        'sha512',
        (err, derivedKey) => {
          if (err) reject(err);
          resolve(derivedKey.toString('hex'));
        }
      );
    });
  }

  generateStreamKey() {
    return uuidv4();
  }

  async streamKeyExists(key) {
    // const filteredKeys = await this.find({ stream_key: key });
    // return filteredKeys.length > 0 ? true : false;
    return await this.findOne({ stream_key: key }).exec(); // test if works as intended
  }
}

userSchema.loadClass(UserClass);

const User = mongoose.model('User', userSchema);
module.exports = User;
