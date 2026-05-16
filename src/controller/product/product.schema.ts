import z from "zod";

const priceSchema = z.preprocess(
  (val) => {
    // 1. Convert input to a number if it's a string
    const parsed = parseFloat(String(val));

    // 2. If it's not a number, let Zod handle the error
    if (Number.isNaN(parsed)) return val;

    // 3. Force 2 decimal places (111 -> "111.00", 111.87 -> "111.87")
    return parsed.toFixed(2);
  },
  z.string().refine((val) => parseFloat(val) > 0, {
    message: "Price must be greater than 0",
  }),
);

export const CreateProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: priceSchema,
  categoryId: z.string().min(1, "category is required"),
  imageSrc: z.string(),
  isAvailable: z.coerce.boolean().default(true),
  timeToMake: z.number(),
});

export const CreateCategorySchema = z.object({
  name: z.string().min(1, "Category is required").toLowerCase(),
  isActive: z.boolean().optional(),
});
