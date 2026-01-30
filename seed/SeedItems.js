import mongoose from "mongoose";
import dotenv from "dotenv";
import Item from "../models/Item.js";

dotenv.config();

/**
 * Map UI / logical categories -> DB enum categories
 */
const CATEGORY_MAP = {
  chicken_meat_fish: "grocery_and_kitchen",
  dairy_bread_eggs: "grocery_and_kitchen",

  snacks_and_munchies: "snacks_and_drinks",
  cold_drinks_and_juices: "snacks_and_drinks",

  beauty_and_personal_care: "beauty_and_personal_care",

  pet_care: "household_essential",
  baby_care: "household_essential",
  cleaning_essentials: "household_essential",
  home_and_kitchen: "household_essential",
  toys_and_games: "household_essential"
};

/**
 * Items by sub-category
 */
const CATEGORY_ITEMS = {
  chicken_meat_fish: [
    "raw chicken", "chicken breast", "chicken wings", "mutton curry cut",
    "mutton keema", "fish fillet", "prawns", "salmon fish",
    "chicken sausage", "chicken salami"
  ],

  pet_care: [
    "dog food", "cat food", "dog treats", "cat treats",
    "pet shampoo", "dog collar", "pet grooming brush",
    "dog toys", "cat litter", "pet vitamins"
  ],

  baby_care: [
    "baby diapers", "baby wipes", "baby shampoo", "baby lotion",
    "baby feeding bottle", "baby cereal", "baby soap",
    "baby oil", "baby towel", "baby bath tub"
  ],

  beauty_and_personal_care: [
    "lipstick", "foundation makeup", "eyeliner", "mascara",
    "compact powder", "makeup brush", "nail polish",
    "face cream", "hair serum", "perfume"
  ],

  dairy_bread_eggs: [
    "milk packet", "brown bread", "white bread", "eggs tray",
    "butter", "paneer", "cheese block",
    "curd", "yogurt cup", "cream carton"
  ],

  snacks_and_munchies: [
    "potato chips", "nachos", "popcorn", "namkeen mixture",
    "biscuits", "cookies", "chocolate bar",
    "energy bar", "wafer biscuits", "salted peanuts"
  ],

  cold_drinks_and_juices: [
    "soft drink bottle", "fruit juice", "energy drink",
    "mineral water", "cold coffee", "iced tea",
    "coconut water", "mango drink", "soda bottle", "lassi"
  ],

  cleaning_essentials: [
    "floor cleaner", "toilet cleaner", "dishwashing liquid",
    "laundry detergent", "scrubber", "garbage bags",
    "disinfectant spray", "broom", "mop", "air freshener"
  ],

  home_and_kitchen: [
    "pressure cooker", "frying pan", "kitchen knife",
    "dinner plates", "water bottle", "storage container",
    "gas lighter", "spice rack", "tea kettle", "cutting board"
  ],

  toys_and_games: [
    "toy car", "teddy bear", "puzzle game", "board game",
    "action figure", "remote control car", "doll",
    "building blocks", "soft toy", "learning toy"
  ]
};

const SHOP = {
  shopName: "Matri Stores",
  shopGstId: "83029130213",
  shopkeeperEmail: "rajesh@gmail.com"
};

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // optional safety: avoid duplicates
    await Item.deleteMany({ shopkeeperEmail: SHOP.shopkeeperEmail });

    const items = [];

    for (const [subCategory, names] of Object.entries(CATEGORY_ITEMS)) {
      const enumCategory = CATEGORY_MAP[subCategory];

      for (const name of names) {
        items.push({
          ...SHOP,
          category: enumCategory,      // ✅ enum-safe
          subCategory,                 // ✅ optional but powerful
          itemName: name,
          quantity: Math.floor(Math.random() * 200) + 20,
          amount: Math.floor(Math.random() * 900) + 100
        });
      }
    }

    await Item.insertMany(items);
    console.log(`✅ Seeded ${items.length} items successfully`);
    process.exit();
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

seed();
