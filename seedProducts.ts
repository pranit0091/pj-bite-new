// import mongoose from "mongoose";
// import * as dotenv from "dotenv";
// import * as path from "path";

// dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// const MONGODB_URI = process.env.MONGODB_URI;
// if (!MONGODB_URI) throw new Error("MONGODB_URI is not defined in .env.local");

// // From your MongoDB export:
// const VENDOR_ID = "69dca8ed740a005678cab10b";   // ← your vendorId
// const CATEGORY_ID = "69ee0e41a3d3d7f440baea19"; // ← your category _id (dry fruits)
// const products = [
//   {
//     name: "Raw Almonds",
//     slug: "raw-almonds",
//     tagline: "Nature's perfect snack",
//     description: "Premium quality raw almonds sourced directly from organic farms. Rich in healthy fats, protein, and essential nutrients.",
//     price: 499,
//     originalPrice: 599,
//     stock: 100,
//     isFeatured: true,
//     claims: ["No Added Sugar", "No Preservatives", "Packed with Goodness", "With Natural Farming"],
//     heroHighlights: ["Rich in Vitamin E", "Heart Healthy", "Keto Friendly"],
//     ingredients: "100% Raw Almonds",
//     nutrition: "Calories: 576kcal, Protein: 21g, Fat: 49g, Carbs: 22g per 100g",
//     benefits: "Rich in Vitamin E, Supports Brain Health, Keto Friendly",
//     images: ["https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=800"],
//     variants: [
//       { name: "250g", price: 299, stock: 50 },
//       { name: "500g", price: 499, stock: 80 },
//       { name: "1kg", price: 899, stock: 30 },
//     ],
//   },
//   {
//     name: "Organic Cashews",
//     slug: "organic-cashews",
//     tagline: "Creamy, crunchy, and wholesome",
//     description: "Hand-picked organic cashews from the finest farms. A buttery, rich snack packed with minerals and healthy fats.",
//     price: 649,
//     originalPrice: 799,
//     stock: 80,
//     isFeatured: true,
//     claims: ["No Added Sugar", "No Preservatives", "Packed with Goodness", "With Natural Farming"],
//     heroHighlights: ["High in Magnesium", "Immunity Booster", "Naturally Gluten Free"],
//     ingredients: "100% Organic Cashews",
//     nutrition: "Calories: 553kcal, Protein: 18g, Fat: 44g, Carbs: 30g per 100g",
//     benefits: "Supports Bone Health, Rich in Zinc, Good for Heart",
//     images: ["https://unsplash.com/s/photos/cashew"],
//     variants: [
//       { name: "250g", price: 399, stock: 40 },
//       { name: "500g", price: 649, stock: 60 },
//       { name: "1kg", price: 1199, stock: 20 },
//     ],
//   },
//   {
//     name: "Mixed Trail Nuts",
//     slug: "mixed-trail-nuts",
//     tagline: "The perfect energy mix",
//     description: "A delightful blend of almonds, cashews, walnuts, and raisins. Perfect for on-the-go snacking and energy boosts.",
//     price: 549,
//     originalPrice: 649,
//     stock: 120,
//     isFeatured: false,
//     claims: ["No Added Sugar", "No Preservatives", "Packed with Goodness", "With Natural Farming"],
//     heroHighlights: ["Energy Booster", "Antioxidant Rich", "High Protein"],
//     ingredients: "Almonds, Cashews, Walnuts, Raisins",
//     nutrition: "Calories: 540kcal, Protein: 16g, Fat: 42g, Carbs: 28g per 100g",
//     benefits: "Sustained Energy, Brain Health, Antioxidant Rich",
//     images: ["https://images.unsplash.com/photo-1543158181-1274e5362710?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWl4ZWQlMjBudXRzfGVufDB8fDB8fHww"],
//     variants: [
//       { name: "200g", price: 299, stock: 60 },
//       { name: "400g", price: 549, stock: 40 },
//     ],
//   },
//   {
//     name: "Dried Apricots",
//     slug: "dried-apricots",
//     tagline: "Sunshine in every bite",
//     description: "Naturally sun-dried apricots with no added sugar or sulphites. Sweet, chewy, and packed with iron and fibre.",
//     price: 399,
//     originalPrice: 479,
//     stock: 90,
//     isFeatured: false,
//     claims: ["No Added Sugar", "No Preservatives", "Packed with Goodness", "With Natural Farming"],
//     heroHighlights: ["High in Iron", "Natural Sweetness", "Rich in Fibre"],
//     ingredients: "100% Natural Dried Apricots",
//     nutrition: "Calories: 241kcal, Protein: 3.4g, Fat: 0.5g, Carbs: 63g per 100g",
//     benefits: "Supports Digestion, Rich in Iron, Good for Skin",
//     images: ["https://images.unsplash.com/photo-1595412017587-b7f3117dff54?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8ZHJpZWQlMjBmcnVpdHxlbnwwfHwwfHx8MA%3D%3D"],
//     variants: [
//       { name: "250g", price: 249, stock: 50 },
//       { name: "500g", price: 399, stock: 40 },
//     ],
//   },
//   {
//     name: "Roasted Pumpkin Seeds",
//     slug: "roasted-pumpkin-seeds",
//     tagline: "Small seeds, big nutrition",
//     description: "Lightly roasted pumpkin seeds with a satisfying crunch. A powerhouse of zinc, magnesium, and plant-based protein.",
//     price: 299,
//     originalPrice: 349,
//     stock: 150,
//     isFeatured: false,
//     claims: ["No Added Sugar", "No Preservatives", "Packed with Goodness", "With Natural Farming"],
//     heroHighlights: ["High in Zinc", "Plant Protein", "Sleep Enhancer"],
//     ingredients: "Pumpkin Seeds, Rock Salt (trace)",
//     nutrition: "Calories: 559kcal, Protein: 30g, Fat: 49g, Carbs: 11g per 100g",
//     benefits: "Supports Immunity, Improves Sleep Quality, Rich in Antioxidants",
//     images: ["https://images.unsplash.com/photo-1631206753348-db44968fd440?w=800"],
//     variants: [
//       { name: "150g", price: 199, stock: 70 },
//       { name: "300g", price: 299, stock: 80 },
//     ],
//   },
//   {
//     name: "Medjool Dates",
//     slug: "medjool-dates",
//     tagline: "The king of dates",
//     description: "Plump, caramel-like Medjool dates imported from premium farms. A natural sweetener and energy-dense superfood.",
//     price: 799,
//     originalPrice: 999,
//     stock: 60,
//     isFeatured: true,
//     claims: ["No Added Sugar", "No Preservatives", "Packed with Goodness", "With Natural Farming"],
//     heroHighlights: ["Natural Sweetener", "High Energy", "Rich in Potassium"],
//     ingredients: "100% Premium Medjool Dates",
//     nutrition: "Calories: 277kcal, Protein: 1.8g, Fat: 0.2g, Carbs: 75g per 100g",
//     benefits: "Natural Energy Boost, Supports Bone Health, Good for Digestion",
//     images: ["https://images.unsplash.com/photo-1601379327928-bedfaf9da2d0?w=800"],
//     variants: [
//       { name: "500g", price: 499, stock: 30 },
//       { name: "1kg", price: 799, stock: 30 },
//     ],
//   },
//   {
//     name: "Black Raisins",
//     slug: "black-raisins",
//     tagline: "Nature's candy",
//     description: "Plump, juicy black raisins dried naturally without any added oil or sugar. A great source of iron and natural antioxidants.",
//     price: 249,
//     originalPrice: 299,
//     stock: 200,
//     isFeatured: false,
//     claims: ["No Added Sugar", "No Preservatives", "Packed with Goodness", "With Natural Farming"],
//     heroHighlights: ["Iron Rich", "Natural Energy", "Good for Hair"],
//     ingredients: "100% Natural Black Raisins",
//     nutrition: "Calories: 299kcal, Protein: 3.1g, Fat: 0.5g, Carbs: 79g per 100g",
//     benefits: "Boosts Haemoglobin, Improves Hair Health, Natural Antioxidants",
//     images: ["https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?w=800"],
//     variants: [
//       { name: "250g", price: 149, stock: 100 },
//       { name: "500g", price: 249, stock: 100 },
//     ],
//   },
//   {
//     name: "Chia Seeds",
//     slug: "chia-seeds",
//     tagline: "Tiny but mighty",
//     description: "Premium grade chia seeds loaded with omega-3 fatty acids, fibre, and plant protein. Perfect for smoothies and puddings.",
//     price: 349,
//     originalPrice: 399,
//     stock: 110,
//     isFeatured: false,
//     claims: ["No Added Sugar", "No Preservatives", "Packed with Goodness", "With Natural Farming"],
//     heroHighlights: ["Omega-3 Rich", "High Fibre", "Weight Management"],
//     ingredients: "100% Raw Chia Seeds",
//     nutrition: "Calories: 486kcal, Protein: 17g, Fat: 31g, Carbs: 42g per 100g",
//     benefits: "Supports Weight Loss, Improves Digestion, Heart Healthy",
//     images: ["https://images.unsplash.com/photo-1514896856000-91cb6de818e0?w=800"],
//     variants: [
//       { name: "200g", price: 199, stock: 60 },
//       { name: "400g", price: 349, stock: 50 },
//     ],
//   },
// ];

// async function seed() {
//   await mongoose.connect(MONGODB_URI);
//   console.log("✅ Connected to MongoDB");

//   const ProductModel =
//     mongoose.models.Product ||
//     (await import("./models/Product")).default;

//   // Clear existing seed products to avoid duplicates on re-run
//   await ProductModel.deleteMany({
//     slug: { $in: products.map((p) => p.slug) },
//   });
//   console.log("🗑️  Cleared existing seed products");

//   const docs = products.map((p) => ({
//     ...p,
//     vendorId: new mongoose.Types.ObjectId(VENDOR_ID),
//     categoryId: new mongoose.Types.ObjectId(CATEGORY_ID),
//   }));

//   await ProductModel.insertMany(docs);
//   console.log(`🌱 Seeded ${docs.length} products successfully`);

//   await mongoose.disconnect();
//   console.log("✅ Done");
// }

// seed().catch((err) => {
//   console.error("❌ Seed failed:", err);
//   process.exit(1);
// });
