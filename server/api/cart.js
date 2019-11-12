const router = require('express').Router()
const {Cart, Breakfast, CartItem} = require('../db/models')
const Sequelize = require('sequelize')

module.exports = router

router.get('/', async (req, res, next) => {
  const cartSessionId = req.session.cartId
  try {
    let currentCart
    if (!cartSessionId) {
      if (req.user) {
        currentCart = await Cart.findOrCreate({
          where: {
            userId: req.user.id,
            purchased: null
          }
        })
        if (currentCart[0].id) {
          currentCart = currentCart[0]
        }
      } else {
        currentCart = await Cart.create({purchased: null})
      }
      req.session.cartId = currentCart.id
    } else {
      currentCart = await Cart.findByPk(cartSessionId)
    }
    const breakfasts = await currentCart.getBreakfasts({
      order: CartItem.createdAt
    })
    res.json(breakfasts)
  } catch (err) {
    next(err)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const currentCart = await Cart.findByPk(req.session.cartId)
    const currentBreakfast = await Breakfast.findByPk(req.body.id)
    await currentCart.addBreakfast(currentBreakfast)
    await CartItem.update(
      {
        currentPrice: currentBreakfast.price
      },
      {
        where: {
          breakfastId: req.body.id,
          cartId: req.session.cartId
        }
      }
    )
    const updatedBreakfast = await currentCart.getBreakfasts({
      where: {id: req.body.id}
    })
    res.status(201).send(updatedBreakfast[0])
  } catch (error) {
    next(error)
  }
})

router.put('/increase', async (req, res, next) => {
  try {
    await CartItem.update(
      {
        quantity: Sequelize.literal('quantity + 1')
      },
      {
        where: {
          breakfastId: req.body.id,
          cartId: req.session.cartId
        },
        returning: true,
        plain: true
      }
    )
    const currentCart = await Cart.findByPk(req.session.cartId)
    const updatedBreakfast = await currentCart.getBreakfasts({
      where: {id: req.body.id}
    })
    res.send(updatedBreakfast)
  } catch (error) {
    next(error)
  }
})

router.put('/decrease', async (req, res, next) => {
  try {
    await CartItem.update(
      {
        quantity: Sequelize.literal('quantity - 1')
      },
      {
        where: {
          breakfastId: req.body.id,
          cartId: req.session.cartId
        },
        returning: true,
        plain: true
      }
    )
    const currentCart = await Cart.findByPk(req.session.cartId)
    const updatedBreakfast = await currentCart.getBreakfasts({
      where: {id: req.body.id}
    })
    res.send(updatedBreakfast)
  } catch (error) {
    next(error)
  }
})

//what is this sending back?
router.put('/:cartId', async (req, res, next) => {
  try {
    const cartId = req.params.cartId
    await Cart.update(
      {
        purchased: new Date()
      },
      {
        where: {id: cartId}
      }
    )
    req.session.cartId = null
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const currentCart = await Cart.findByPk(req.session.cartId)
    const currentBreakfast = await Breakfast.findByPk(req.params.id)
    const deletedBreakfast = await currentCart.getBreakfasts({
      where: {id: req.body.id}
    })
    await currentCart.removeBreakfast(currentBreakfast)
    res.send(deletedBreakfast)
  } catch (error) {
    next(error)
  }
})
