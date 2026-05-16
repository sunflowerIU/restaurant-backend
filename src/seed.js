"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seed = seed;
const category_model_1 = require("./model/category.model");
const product_model_1 = require("./model/product.model");
async function seed() {
    var _a, _b, _c, _d;
    try {
        //create categories
        const categories = await category_model_1.Category.insertMany([
            { name: "lunch", displayOrder: 1 },
            { name: "dinner", displayOrder: 2 },
            { name: "drinks", displayOrder: 3 },
            { name: "dessert", displayOrder: 4 },
        ], {
            ordered: false,
        }).catch((err) => console.log("some categories are duplicated"));
        //get id of category
        const lunchId = (_a = categories === null || categories === void 0 ? void 0 : categories.find((c) => c.name === "lunch")) === null || _a === void 0 ? void 0 : _a._id;
        const dinnerId = (_b = categories === null || categories === void 0 ? void 0 : categories.find((c) => c.name === "dinner")) === null || _b === void 0 ? void 0 : _b._id;
        const drinksId = (_c = categories === null || categories === void 0 ? void 0 : categories.find((c) => c.name === "drinks")) === null || _c === void 0 ? void 0 : _c._id;
        const dessertId = (_d = categories === null || categories === void 0 ? void 0 : categories.find((c) => c.name === "dessert")) === null || _d === void 0 ? void 0 : _d._id;
        const fakeProducts = [
            // Lunch
            {
                imageSrc: "/chicken.png",
                name: "Chicken Fried Rice",
                price: "280",
                timeToMake: 15,
                categoryId: lunchId,
            },
            {
                imageSrc: "/chowmein.png",
                name: "Veg Chowmein",
                price: "220",
                timeToMake: 12,
                categoryId: lunchId,
            },
            {
                imageSrc: "/momo.png",
                name: "Steam Chicken Momo",
                price: "180",
                timeToMake: 10,
                categoryId: lunchId,
            },
            {
                imageSrc: "/chicken.png",
                name: "Chicken Biryani",
                price: "350",
                timeToMake: 20,
                categoryId: lunchId,
            },
            {
                imageSrc: "/chowmein.png",
                name: "Buff Chowmein",
                price: "240",
                timeToMake: 14,
                categoryId: lunchId,
            },
            {
                imageSrc: "/momo.png",
                name: "Jhol Momo",
                price: "200",
                timeToMake: 12,
                categoryId: lunchId,
            },
            {
                imageSrc: "/chicken.png",
                name: "Chicken Burger",
                price: "250",
                timeToMake: 11,
                categoryId: lunchId,
            },
            {
                imageSrc: "/chowmein.png",
                name: "Mixed Chowmein",
                price: "260",
                timeToMake: 15,
                categoryId: lunchId,
            },
            {
                imageSrc: "/momo.png",
                name: "Fried Veg Momo",
                price: "190",
                timeToMake: 11,
                categoryId: lunchId,
            },
            {
                imageSrc: "/chicken.png",
                name: "Chicken Wrap",
                price: "230",
                timeToMake: 10,
                categoryId: lunchId,
            },
            // Dinner
            {
                imageSrc: "/chicken.png",
                name: "Grilled Chicken Platter",
                price: "420",
                timeToMake: 25,
                categoryId: dinnerId,
            },
            {
                imageSrc: "/chowmein.png",
                name: "Special Dinner Chowmein",
                price: "300",
                timeToMake: 18,
                categoryId: dinnerId,
            },
            {
                imageSrc: "/momo.png",
                name: "C Momo",
                price: "240",
                timeToMake: 16,
                categoryId: dinnerId,
            },
            {
                imageSrc: "/chicken.png",
                name: "Chicken Thali Set",
                price: "380",
                timeToMake: 22,
                categoryId: dinnerId,
            },
            {
                imageSrc: "/chowmein.png",
                name: "Hot Garlic Chowmein",
                price: "280",
                timeToMake: 17,
                categoryId: dinnerId,
            },
            {
                imageSrc: "/momo.png",
                name: "Kothey Momo",
                price: "220",
                timeToMake: 15,
                categoryId: dinnerId,
            },
            {
                imageSrc: "/chicken.png",
                name: "Butter Chicken with Naan",
                price: "450",
                timeToMake: 28,
                categoryId: dinnerId,
            },
            {
                imageSrc: "/chowmein.png",
                name: "Chicken Chowmein Deluxe",
                price: "320",
                timeToMake: 20,
                categoryId: dinnerId,
            },
            {
                imageSrc: "/momo.png",
                name: "Tandoori Momo",
                price: "260",
                timeToMake: 18,
                categoryId: dinnerId,
            },
            {
                imageSrc: "/chicken.png",
                name: "Roasted Chicken Bowl",
                price: "390",
                timeToMake: 21,
                categoryId: dinnerId,
            },
            // Drinks
            {
                imageSrc: "/chicken.png",
                name: "Chicken Soup",
                price: "160",
                timeToMake: 8,
                categoryId: drinksId,
            },
            {
                imageSrc: "/chowmein.png",
                name: "Masala Soda (House)",
                price: "120",
                timeToMake: 10,
                categoryId: drinksId,
            },
            {
                imageSrc: "/momo.png",
                name: "Momo Soup",
                price: "150",
                timeToMake: 9,
                categoryId: drinksId,
            },
            {
                imageSrc: "/chicken.png",
                name: "Lemon Iced Tea",
                price: "110",
                timeToMake: 5,
                categoryId: drinksId,
            },
            {
                imageSrc: "/chowmein.png",
                name: "Cold Coffee",
                price: "140",
                timeToMake: 6,
                categoryId: drinksId,
            },
            {
                imageSrc: "/momo.png",
                name: "Peach Mojito",
                price: "130",
                timeToMake: 7,
                categoryId: drinksId,
            },
            {
                imageSrc: "/chicken.png",
                name: "Fresh Lime Soda",
                price: "100",
                timeToMake: 4,
                categoryId: drinksId,
            },
            {
                imageSrc: "/chowmein.png",
                name: "Strawberry Shake",
                price: "170",
                timeToMake: 8,
                categoryId: drinksId,
            },
            {
                imageSrc: "/momo.png",
                name: "Mint Cooler",
                price: "125",
                timeToMake: 5,
                categoryId: drinksId,
            },
            {
                imageSrc: "/chicken.png",
                name: "Chocolate Milkshake",
                price: "180",
                timeToMake: 8,
                categoryId: drinksId,
            },
            // Dessert
            {
                imageSrc: "/chicken.png",
                name: "Chocolate Brownie",
                price: "160",
                timeToMake: 12,
                categoryId: dessertId,
            },
            {
                imageSrc: "/chowmein.png",
                name: "Vanilla Ice Cream",
                price: "120",
                timeToMake: 5,
                categoryId: dessertId,
            },
            {
                imageSrc: "/momo.png",
                name: "Gulab Jamun",
                price: "140",
                timeToMake: 7,
                categoryId: dessertId,
            },
            {
                imageSrc: "/chicken.png",
                name: "Fruit Custard",
                price: "150",
                timeToMake: 10,
                categoryId: dessertId,
            },
            {
                imageSrc: "/chowmein.png",
                name: "Cheese Cake Slice",
                price: "200",
                timeToMake: 9,
                categoryId: dessertId,
            },
            {
                imageSrc: "/momo.png",
                name: "Mango Sundae",
                price: "180",
                timeToMake: 6,
                categoryId: dessertId,
            },
            {
                imageSrc: "/chicken.png",
                name: "Oreo Shake Dessert",
                price: "190",
                timeToMake: 8,
                categoryId: dessertId,
            },
            {
                imageSrc: "/chowmein.png",
                name: "Caramel Pudding",
                price: "170",
                timeToMake: 11,
                categoryId: dessertId,
            },
            {
                imageSrc: "/momo.png",
                name: "Ice Cream Brownie",
                price: "220",
                timeToMake: 10,
                categoryId: dessertId,
            },
            {
                imageSrc: "/chicken.png",
                name: "Strawberry Cake",
                price: "210",
                timeToMake: 9,
                categoryId: dessertId,
            },
        ];
        console.log("created categories");
        await product_model_1.Product.insertMany(fakeProducts).catch((err) => console.log(err));
        console.log("created products");
        process.exit(0);
    }
    catch (error) {
        console.log(error);
        process.exit(1);
    }
}
// seed();
