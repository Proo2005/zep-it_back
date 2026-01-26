import fetch from "node-fetch";

/**
 * @desc Create product via EscuelaJS API
 * @route POST /api/products/create
 */
export const createProduct = async (req, res) => {
  try {
    const { title, price, description, categoryId, images } = req.body;

    // Basic validation
    if (
      !title ||
      !price ||
      !description ||
      !categoryId ||
      !images ||
      !Array.isArray(images)
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const response = await fetch(
      "https://api.escuelajs.co/api/v1/products/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          price,
          description,
          categoryId,
          images,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(400).json(data);
    }

    res.status(201).json(data);
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
