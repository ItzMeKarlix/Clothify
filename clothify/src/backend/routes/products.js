const express = require("express");
const { nanoid } = require("nanoid");

module.exports = (upload, Product) => {
  const router = express.Router();

  // GET all products
  router.get("/", async (req, res) => {
    const products = await Product.find().sort({ created_at: -1 });
    res.json(products);
  });

  // POST new product (existing)
  router.post("/", upload.single("image"), async (req, res) => {
    if (req.header("x-admin-token") !== process.env.ADMIN_TOKEN)
      return res.status(401).json({ error: "Unauthorized" });

    const { title, description, price } = req.body;
    const imageUrl = req.file?.path || null;
    const product = await Product.create({
      id: nanoid(10),
      title,
      description,
      price,
      image: imageUrl,
    });

    res.json({ ok: true, product });
  });

  // ✅ PUT - update product
  router.put("/:id", upload.single("image"), async (req, res) => {
    if (req.header("x-admin-token") !== process.env.ADMIN_TOKEN)
      return res.status(401).json({ error: "Unauthorized" });

    const { title, description, price } = req.body;
    const updateData = { title, description, price };
    if (req.file) updateData.image = req.file.path;

    const updatedProduct = await Product.findOneAndUpdate(
      { id: req.params.id },
      updateData,
      { new: true }
    );

    res.json({ ok: true, product: updatedProduct });
  });

  // ✅ DELETE - remove product
  router.delete("/:id", async (req, res) => {
    if (req.header("x-admin-token") !== process.env.ADMIN_TOKEN)
      return res.status(401).json({ error: "Unauthorized" });

    await Product.findOneAndDelete({ id: req.params.id });
    res.json({ ok: true });
  });

  return router;
};
