const {Router} = require('express')
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const router = Router()
const {check, validationResult} = require('express-validator')
const jwt = require('jsonwebtoken')
const config = require('config')

router.post(
    '/registration',
    [
        check('email', 'Некорректный email').isEmail(),
        check('password', 'минимальная длина пароля 6 символов').isLength({min: 6})
    ],
    async (res, req) => {
        try {
            const errors = validationResult(req)

            if (!errors.isEmpty()) {
                res.status(400).json({
                    errors: errors.array(),
                    message: 'не корректные данные при регистрации'
                })
            }

            const {email, password} = req.body
            const candidate = await User.findOne({email})

            if (candidate) {
                return res.status(400).json({message: ' такой email уже зарегистрирован!'})
            }

            const hashedPassword = await bcrypt.hash(password, 12)
            const user = new User({email, password: hashedPassword})

            await user.save()

            res.status(201).json({message: 'пользователь успешно создан!'})

        } catch (e) {
            res.status(500).json({message: 'Произошла ошибка, попробуйте ещё раз'})
        }
    })

router.post('/login',
    [
        check('email' , 'ВВедите корректный email').normalizeEmail().isEmail(),
        check('password', 'введите пароль').exists()
    ],
    async (req, res) => {
    try {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            res.status(400).json({
                errors: errors.array(),
                message: 'не корректные данные при входе в систему'
            })
        }

        const {email, password} = req.body
        const user = await User.findOne({email})
        if (!user) {
            return res.status(500).json('Пользователь не найден')
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.send(400).json({message: 'Не верный пароль , попробуйте снова!'})
        }

        const token = jwt.sign(
            { userId: user.id },
            config.get('jwtSecret'),
            {expiresIn: '1h'}

        )

        res.json({token, iserId: user.id})

    } catch (e) {
        res.status(500).json({message: 'Произошла ошибка, попробуйте ещё раз'})
    }
})


module.exports = router