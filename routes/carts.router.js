const { Router } = require("express")

const {
  populate,
  create,
  deleteId,
  deleteProducts,
  getById,
  findById,
  deleteAll,
  purchase,
  removeProductFromCart
} = require ("../controllers/cart.controller.js")

const router = Router();

router.get('/', (req, res) => {
  res.render('carts');
});

router.get("/:cid", populate);
router.post("/", create);
router.delete("/:id", deleteId, removeProductFromCart);
router.delete("/:cid/products/:pid", deleteProducts);
router.put("/:cid", getById);
router.put('/:cid/products/:pid', findById);
router.delete("/:cid", deleteAll);
router.get("/:cid/purchase", purchase);

module.exports = router;