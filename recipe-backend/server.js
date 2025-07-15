const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const { OpenAI } = require("openai");
require("dotenv").config();

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

const db = new sqlite3.Database("recipes.db");

db.serialize(() => {
	db.run(`CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    ingredients TEXT NOT NULL,
    details TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

const app = express();
const PORT = 5000;
app.get("/debug-recipes", (req, res) => {
	db.all("SELECT id, name FROM recipes LIMIT 5", [], (err, rows) => {
		if (err) {
			console.error("Debug query error:", err.message);
			res.status(500).json({ error: err.message });
			return;
		}
		console.log("First 5 recipes:", rows);
		res.json(rows);
	});
});
const cors = require("cors");
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
	res.send("Backend is working!");
});

const getNutritionFromAI = async (ingredientsArray) => {
	const prompt = `
You are a certified nutritionist using the USDA FoodData Central database.

Estimate the **total nutrition values** for the following list of ingredients (with exact gram amounts). Do not guess — use real nutritional data per gram.

Return only this JSON:
{
  "calories": number,
  "protein_g": number,
  "fat_g": number,
  "carbs_g": number
}

Total the values across all ingredients.

Ingredients:
${JSON.stringify(ingredientsArray, null, 2)}
`;

	try {
		const chat = await openai.chat.completions.create({
			model: "gpt-4",
			messages: [{ role: "user", content: prompt }],
		});

		let raw = chat.choices[0].message.content.trim();
		console.log(raw);
		raw = raw.replace(/```json|```/g, ""); // Strip markdown
		return JSON.parse(raw);
	} catch (err) {
		console.error("AI nutrition error:", err.message);
		return null;
	}
};

app.post("/save-recipe", async (req, res) => {
	const { id, name, ingredients, details } = req.body;

	console.log("Received recipe data:", { id, name, ingredients, details });

	if (
		!name ||
		!ingredients ||
		!details ||
		!details.instructions ||
		!details.ingredients
	) {
		console.log("Missing required fields");
		return res
			.status(400)
			.json({ success: false, message: "Missing required fields" });
	}

	// Use OpenAI to generate nutrition if needed
	if (
		!details.nutrition ||
		typeof details.nutrition.calories !== "number" ||
		typeof details.nutrition.protein_g !== "number" ||
		typeof details.nutrition.fat_g !== "number" ||
		typeof details.nutrition.carbs_g !== "number"
	) {
		console.log("Generating nutrition info with OpenAI...");
		const aiNutrition = await getNutritionFromAI(details.ingredients);

		if (aiNutrition) {
			details.nutrition = aiNutrition;
			console.log("Nutrition generated:", aiNutrition);
		} else {
			console.warn("Failed to generate nutrition from AI. Falling back.");
			const totalGrams = details.ingredients.reduce(
				(sum, item) => sum + (item.amount_g || 0),
				0
			);
			details.nutrition = {
				calories: Math.round(totalGrams * 2),
				protein_g: Math.round(totalGrams * 0.2),
				fat_g: Math.round(totalGrams * 0.1),
				carbs_g: Math.round(totalGrams * 0.15),
			};
		}
	}

	if (id) {
		// UPDATE
		const updateQuery = `
      UPDATE recipes 
      SET name = ?, ingredients = ?, details = ?
      WHERE id = ?
    `;
		db.run(
			updateQuery,
			[name, ingredients, JSON.stringify(details), id],
			function (err) {
				if (err) {
					console.error("DB update error:", err.message);
					return res.status(500).json({ success: false, error: err.message });
				}

				if (this.changes === 0) {
					return res
						.status(404)
						.json({ success: false, error: "Recipe not found" });
				}

				console.log("Recipe updated successfully, ID:", id);
				res.json({ success: true, id: id });
			}
		);
	} else {
		// INSERT
		const insertQuery = `
      INSERT INTO recipes (name, ingredients, details)
      VALUES (?, ?, ?)
    `;

		db.run(
			insertQuery,
			[name, ingredients, JSON.stringify(details)],
			function (err) {
				if (err) {
					console.error("DB insert error:", err.message);
					return res.status(500).json({ success: false, error: err.message });
				}

				console.log("Recipe inserted successfully, ID:", this.lastID);
				res.json({ success: true, id: this.lastID });
			}
		);
	}
});

app.get("/recipes", (req, res) => {
	db.all("SELECT * FROM recipes", [], (err, rows) => {
		if (err) {
			console.error("DB fetch error:", err.message);
			res.status(500).json({ error: err.message });
			return;
		}
		console.log("Fetched recipes:", rows.length); // Debug log
		res.json(rows);
	});
});

app.get("/ai-recipes", async (req, res) => {
	const userIngredients = req.query.ingredients;
	const flexibilityLevel = parseInt(req.query.flexibility) || 1;
	const maxExtras = parseInt(req.query.maxExtras) || 0;
	let prompt = "";

	if (!userIngredients) {
		return res.status(400).json({ error: "No ingredients provided" });
	}
	console.log("testsetset");
	console.log(userIngredients);
	if (flexibilityLevel === 1) {
		prompt = `You are a strict recipe generator. ONLY use the following ingredients: ${userIngredients}.
    Do NOT use any other ingredients, even if they are common, ingredients should ONLY be the ones provided.
	Provide atleast 3 but less than 10 recipes that meet this requirement, go as close to 10 as you can unless you cant make proper recipes that follow the listed requirements. 
    Return the recipes in this format:
    [ { "name": "Recipe Name", "ingredients": "comma,separated,list" } ]`;
	} else if (flexibilityLevel === 2) {
		prompt = `You are a recipe generator. Use the following ingredients: ${userIngredients}.
    You may include up to ${maxExtras} extra COMMON ingredients (like oil, water, salt), NO MORE THAN ${maxExtras}.
	Provide atleast 3 but less than 10 recipes that meet this requirement, go as close to 10 as you can unless you cant make proper recipes that follow the listed requirements. 
    Do NOT use specialty or uncommon ingredients.
    Return the recipes in this format:
    [ { "name": "Recipe Name", "ingredients": "comma,separated,list" } ]`;
	} else {
		prompt = `You are a creative recipe generator. Use the following ingredients: ${userIngredients}.
    You may include up to ${maxExtras} extra ingredients of any kind if helpful, NO MORE THAN ${maxExtras}.
	Provide atleast 3 but less than 10 recipes that meet this requirement, go as close to 10 as you can unless you cant make proper recipes that follow the listed requirements. 
    Make the recipes practical and creative.
    Return the recipes in this format:
    [ { "name": "Recipe Name", "ingredients": "comma,separated,list" } ]`;
	}

	try {
		const chat = await openai.chat.completions.create({
			model: "gpt-3.5-turbo",
			messages: [
				{
					role: "system",
					content:
						"You are a strict recipe generator that follows ingredient constraints exactly.",
				},
				{
					role: "user",
					content: prompt,
				},
			],
		});

		const raw = chat.choices[0].message.content;
		const recipes = JSON.parse(raw);
		res.json(recipes);
	} catch (err) {
		console.error("AI error:", err.message);
		res.status(500).json({ error: "Failed to generate AI recipes" });
	}
});

app.get("/ai-instructions", async (req, res) => {
	const recipeName = req.query.name;
	const ingredients = req.query.ingredients;

	if (!recipeName || !ingredients) {
		return res
			.status(400)
			.json({ error: "Missing recipe name or ingredients" });
	}

	const prompt = `
You are a recipe assistant.

Given a recipe name and a list of ingredients, return a JSON object with:
- "ingredients": an array of objects with "item" and "amount_g"
- "instructions": an array of clear cooking steps
- "nutrition": an object with estimated "calories", "protein_g", "fat_g", and "carbs_g"

Do not include any explanation. Only return the JSON object.

Here is the format:

{
  "ingredients": [
    { "item": "chicken", "amount_g": 500 },
    { "item": "salt", "amount_g": 5 }
  ],
  "instructions": [
    "Cut the chicken into bite-sized pieces.",
    "Season with salt.",
    "Cook in a pan over medium heat until golden brown and fully cooked."
  ],
  "nutrition": {
    "calories": 600,
    "protein_g": 55,
    "fat_g": 30,
    "carbs_g": 0
  }
}

Now return the recipe for: "${recipeName}" using these ingredients: ${ingredients}.
`;

	try {
		const chat = await openai.chat.completions.create({
			model: "gpt-3.5-turbo",
			messages: [{ role: "user", content: prompt }],
		});

		let raw = chat.choices[0].message.content.trim();

		// Clean up possible issues before parsing
		raw = raw
			.replace(/```json|```/g, "") // remove markdown code blocks
			.replace(/,\s*([\]}])/g, "$1") // trailing commas
			.replace(/[""]/g, '"'); // replace curly quotes

		let parsed;
		try {
			parsed = JSON.parse(raw);
		} catch (err) {
			console.error("JSON parse error:", err.message);
			return res.status(500).json({ error: "Invalid JSON from AI" });
		}

		res.json(parsed);
	} catch (err) {
		console.error("AI instructions error:", err.message);
		res.status(500).json({ error: "Failed to generate instructions" });
	}
});

app.get("/search", (req, res) => {
	const userIngredients = req.query.ingredients
		?.split(",")
		.map((i) => i.trim().toLowerCase());

	if (!userIngredients || userIngredients.length === 0) {
		return res.status(400).json({ error: "No ingredients provided" });
	}

	db.all("SELECT * FROM recipes", [], (err, rows) => {
		if (err) return res.status(500).json({ error: err.message });

		const matching = rows.filter((recipe) => {
			const recipeIngredients = recipe.ingredients.toLowerCase().split(",");
			return userIngredients.every((i) => recipeIngredients.includes(i));
		});

		res.json(matching);
	});
});

app.get("/recipe-instructions", (req, res) => {
	const recipeName = req.query.name;
	if (!recipeName) {
		return res.status(400).json({ error: "Missing recipe name" });
	}

	const query = `SELECT details FROM recipes WHERE name = ?`;
	db.get(query, [recipeName], (err, row) => {
		if (err) {
			console.error("DB lookup error:", err.message);
			return res.status(500).json({ error: err.message });
		}

		if (!row) {
			// Recipe not found in DB
			return res.json({ exists: false });
		}

		try {
			// Parse stored details JSON string back to an object
			const details = JSON.parse(row.details);
			return res.json({ exists: true, instructions: details });
		} catch (parseErr) {
			console.error("JSON parse error:", parseErr.message);
			return res
				.status(500)
				.json({ error: "Failed to parse instructions JSON" });
		}
	});
});

app.delete("/delete-recipe/:id", (req, res) => {
	const recipeId = req.params.id;

	if (!recipeId) {
		return res.status(400).json({ error: "Recipe ID is required" });
	}

	const query = "DELETE FROM recipes WHERE id = ?";

	db.run(query, [recipeId], function (err) {
		if (err) {
			console.error("Error deleting recipe:", err.message);
			return res.status(500).json({ error: "Failed to delete recipe" });
		}

		if (this.changes === 0) {
			return res.status(404).json({ error: "Recipe not found" });
		}

		console.log(`Recipe with ID ${recipeId} deleted successfully`);
		res.json({ success: true, message: "Recipe deleted successfully" });
	});
});

// Add a test endpoint to check database
app.get("/test-db", (req, res) => {
	db.all(
		"SELECT name FROM sqlite_master WHERE type='table'",
		[],
		(err, rows) => {
			if (err) {
				res.status(500).json({ error: err.message });
				return;
			}
			res.json({ tables: rows });
		}
	);
});

app.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}`);
});
