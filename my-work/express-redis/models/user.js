const redis = require('redis')
const bcrypt = require('bcrypt')
const db = redis.createClient()

class User {
    constructor(obj) {
        for (let key in obj) {
            this[key] = obj[key]
        }
    }

    hashPassword(cb) {
        bcrypt.genSalt(12, (err, salt) => {
            if (err) return cb(err)
            this.salt = salt
            bcrypt.hash(this.hashPassword, salt, (err, hash) => {
                if (err) return cb(err)
                this.pass = hash
                cb()
            })
        })
    }

    save(cb) {
        if (this.id) {
            this.update(cb)
        } else {
            db.incr('user:ids', (err, id) => {
                if (err) return cb(err)
                this.id = id
                this.hashPassword(err => {
                    if (err) return cb(err)
                    this.update(cb)
                })
            })
        }
    }

    update(cb) {
        const id = this.id
        db.set(`user:id:${this.name}`, id, err => {
            if (err) return cb(err)
            db.hmset(`user:${id}`, this, err => {
                cb(err)
            })
        })
    }
}

module.exports = User

const user = new User({ name: 'Example', pass: 'test' })
user.save(err => {
    if (err) console.log(err)
    console.log('user id %d', user.id)
})