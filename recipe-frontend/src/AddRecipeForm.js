import React, { useState } from "react";
import { Button, Card } from "./components/";
import { colors } from "./tokens/colors.js";

export default function AddRecipeForm({ onClose }) {
	const [name, setName] = useState("");
	const [mainIngredients, setMainIngredients] = useState([]);
	const [steps, setSteps] = useState([""]);
	const [manualIngredients, setManualIngredients] = useState([
		{ item: "", amount_g: "" },
	]);
	const [nutrition, setNutrition] = useState({
		calories: "",
		protein_g: "",
		fat_g: "",
		carbs_g: "",
	});
	const [message, setMessage] = useState("");
	const [measurements, setMeasurements] = useState({});
	const [ingredientInput, setIngredientInput] = useState("");

	const ingredientList = [
		//puts main and manual ing tgt
		//fixes issue with manual ingredient being removed but leaving main ingredient
		//and the oppos
		...mainIngredients.map((ingredient) => ({
			item: ingredient,
			amount_g: measurements[ingredient] || "",
			isMainIngredient: true,
		})),
		...manualIngredients,
	];

	const addMainIngredient = () => {
		const item = ingredientInput.trim().toLowerCase();
		if (!item || mainIngredients.includes(item)) return;

		const updated = [...mainIngredients, item];
		setMainIngredients(updated);
		setMeasurements((prev) => ({
			...prev,
			[item]: prev[item] || "",
		}));
		setIngredientInput("");
	};

	const removeMainIngredient = (item) => {
		const updated = mainIngredients.filter((i) => i !== item);
		setMainIngredients(updated);
		setMeasurements((prev) => {
			const copy = { ...prev };
			delete copy[item];
			return copy;
		});
	};

	const addStep = () => setSteps([...steps, ""]);

	const addIngredient = () => {
		setManualIngredients([
			...manualIngredients,
			{ item: "", amount_g: "", isMainIngredient: false },
		]);
	};

	const updateIngredientAmount = (index, amount) => {
		const ingredient = ingredientList[index];
		if (ingredient.isMainIngredient) {
			setMeasurements((prev) => ({
				...prev,
				[ingredient.item]: amount,
			}));
		} else {
			const copy = [...manualIngredients];
			const manualIndex = index - mainIngredients.length;
			copy[manualIndex].amount_g = amount;
			setManualIngredients(copy);
		}
	};

	const updateIngredientItem = (index, item) => {
		const manualIndex = index - mainIngredients.length;
		if (manualIndex >= 0) {
			const copy = [...manualIngredients];
			copy[manualIndex].item = item;
			setManualIngredients(copy);
		}
	};

	const removeIngredient = (index) => {
		const ingredient = ingredientList[index];
		if (ingredient.isMainIngredient) {
			removeMainIngredient(ingredient.item);
		} else {
			const manualIndex = index - mainIngredients.length;
			const copy = [...manualIngredients];
			copy.splice(manualIndex, 1);
			setManualIngredients(copy);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		//sometimes really long delays so added this
		setMessage("💾 Saving recipe...");

		try {
			const ingredientsStructured = ingredientList
				.filter((i) => i.item?.trim() && i.amount_g)
				.map((i) => ({
					item: i.item.trim(),
					amount_g: parseFloat(i.amount_g || measurements[i.item] || 0),
				}));

			const stepsFiltered = steps.filter((s) => s?.trim());

			const hasNutrition = Object.values(nutrition).some((val) => val !== "");
			const nutritionComplete = hasNutrition
				? {
						calories: parseInt(nutrition.calories) || 0,
						protein_g: parseInt(nutrition.protein_g) || 0,
						fat_g: parseInt(nutrition.fat_g) || 0,
						carbs_g: parseInt(nutrition.carbs_g) || 0,
				  }
				: null;

			const payload = {
				name: name.trim(),
				ingredients: mainIngredients.join(", "),
				details: {
					ingredients: ingredientsStructured,
					instructions: stepsFiltered,
					nutrition: nutritionComplete,
				},
			};

			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 10000);

			const res = await fetch("http://localhost:5000/save-recipe", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
				signal: controller.signal,
			});

			clearTimeout(timeoutId);

			if (!res.ok) {
				throw new Error(`HTTP error! status: ${res.status}`);
			}

			const data = await res.json();

			if (data.success) {
				setMessage("✅ Recipe saved!");
				setName("");
				setMainIngredients([]);
				setSteps([""]);
				setManualIngredients([{ item: "", amount_g: "" }]);
				setNutrition({ calories: "", protein_g: "", fat_g: "", carbs_g: "" });
				setMeasurements({});
			} else {
				setMessage(`❌ Failed to save: ${data.message || "Unknown error"}`);
			}
		} catch (error) {
			if (error.name === "AbortError") {
				setMessage("❌ Request timed out. Please try again.");
			} else {
				setMessage(`❌ Failed to save: ${error.message}`);
			}
			console.error("Save error:", error);
		}
	};

	const inputStyle = {
		padding: "12px 16px",
		fontSize: "16px",
		border: `2px solid ${colors.border}`,
		borderRadius: "8px",
		outline: "none",
		backgroundColor: colors.card,
		color: colors.text,
		width: "100%",
		boxSizing: "border-box",
	};

	const sectionStyle = {
		marginBottom: "24px",
	};

	const labelStyle = {
		display: "block",
		color: colors.text,
		fontSize: "16px",
		fontWeight: "600",
		marginBottom: "12px",
	};

	return (
		<div style={{ maxWidth: "100%", overflow: "hidden" }}>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: "24px",
				}}
			>
				<h2
					style={{
						color: colors.text,
						fontSize: "24px",
						fontWeight: "600",
						margin: "0",
					}}
				>
					➕ Add New Recipe
				</h2>
				{onClose && (
					<Button variant="ghost" onClick={onClose} size="sm">
						✖️
					</Button>
				)}
			</div>

			<form onSubmit={handleSubmit}>
				<div style={sectionStyle}>
					<label style={labelStyle}>Recipe Name</label>
					<input
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="Enter recipe name"
						required
						style={inputStyle}
					/>
				</div>

				<div style={sectionStyle}>
					<label style={labelStyle}>Main Ingredients</label>
					<div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
						<input
							value={ingredientInput}
							onChange={(e) => setIngredientInput(e.target.value)}
							placeholder="Add main ingredient"
							style={{ ...inputStyle, flex: 1 }}
							onKeyPress={(e) =>
								e.key === "Enter" && (e.preventDefault(), addMainIngredient())
							}
						/>
						<Button type="button" onClick={addMainIngredient} variant="outline">
							Add
						</Button>
					</div>
					<div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
						{mainIngredients.map((ingredient, index) => (
							<span
								key={index}
								style={{
									display: "inline-flex",
									alignItems: "center",
									backgroundColor: colors.primary,
									color: "white",
									padding: "6px 12px",
									borderRadius: "20px",
									fontSize: "14px",
									fontWeight: "500",
								}}
							>
								{ingredient}
								<button
									type="button"
									onClick={() => removeMainIngredient(ingredient)}
									style={{
										marginLeft: "8px",
										background: "none",
										border: "none",
										color: "white",
										cursor: "pointer",
										fontSize: "16px",
										fontWeight: "bold",
									}}
								>
									×
								</button>
							</span>
						))}
					</div>
				</div>

				<div style={sectionStyle}>
					<label style={labelStyle}>Instructions</label>
					{steps.map((step, i) => (
						<div key={i} style={{ marginBottom: "12px" }}>
							<input
								value={step}
								onChange={(e) => {
									const copy = [...steps];
									copy[i] = e.target.value;
									setSteps(copy);
								}}
								placeholder={`Step ${i + 1}`}
								style={inputStyle}
							/>
						</div>
					))}
					<Button type="button" onClick={addStep} variant="outline">
						+ Add Step
					</Button>
				</div>

				<div style={sectionStyle}>
					<label style={labelStyle}>Ingredients & Measurements</label>
					{ingredientList.map((ing, i) => (
						<Card
							key={i}
							style={{
								padding: "12px",
								marginBottom: "12px",
								backgroundColor: ing.isMainIngredient
									? colors.background
									: colors.card,
								border: ing.isMainIngredient
									? `2px solid ${colors.primary}`
									: `1px solid ${colors.border}`,
							}}
						>
							<div
								style={{
									display: "flex",
									gap: "12px",
									alignItems: "center",
									flexWrap: "wrap",
								}}
							>
								<input
									value={ing.item}
									onChange={(e) => updateIngredientItem(i, e.target.value)}
									placeholder="Ingredient"
									disabled={ing.isMainIngredient}
									style={{
										...inputStyle,
										flex: 1,
										minWidth: "200px",
										backgroundColor: ing.isMainIngredient
											? colors.background
											: colors.card,
										color: ing.isMainIngredient
											? colors.textSecondary
											: colors.text,
									}}
								/>
								<input
									value={
										ing.isMainIngredient
											? measurements[ing.item] || ""
											: ing.amount_g
									}
									onChange={(e) => updateIngredientAmount(i, e.target.value)}
									placeholder="Grams"
									type="number"
									style={{
										...inputStyle,
										width: "120px",
										minWidth: "120px",
									}}
								/>
								<Button
									type="button"
									onClick={() => removeIngredient(i)}
									variant="danger"
									size="sm"
								>
									Remove
								</Button>
							</div>
						</Card>
					))}
					<Button type="button" onClick={addIngredient} variant="outline">
						+ Add Manual Ingredient
					</Button>
				</div>

				<div style={sectionStyle}>
					<label style={labelStyle}>Nutrition Information (Optional)</label>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
							gap: "12px",
						}}
					>
						<input
							placeholder="Calories"
							type="number"
							value={nutrition.calories}
							onChange={(e) =>
								setNutrition({ ...nutrition, calories: e.target.value })
							}
							style={inputStyle}
						/>
						<input
							placeholder="Protein (g)"
							type="number"
							value={nutrition.protein_g}
							onChange={(e) =>
								setNutrition({ ...nutrition, protein_g: e.target.value })
							}
							style={inputStyle}
						/>
						<input
							placeholder="Fat (g)"
							type="number"
							value={nutrition.fat_g}
							onChange={(e) =>
								setNutrition({ ...nutrition, fat_g: e.target.value })
							}
							style={inputStyle}
						/>
						<input
							placeholder="Carbs (g)"
							type="number"
							value={nutrition.carbs_g}
							onChange={(e) =>
								setNutrition({ ...nutrition, carbs_g: e.target.value })
							}
							style={inputStyle}
						/>
					</div>
				</div>

				<div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
					<Button type="submit" variant="success">
						💾 Save Recipe
					</Button>
					{message && (
						<span
							style={{
								color: message.includes("✅") ? colors.success : colors.danger,
								fontSize: "14px",
								fontWeight: "500",
							}}
						>
							{message}
						</span>
					)}
				</div>
			</form>
		</div>
	);
}
