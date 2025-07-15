import React from "react";
import { Button, Input } from "./components";
import { colors, shadows } from "./tokens/colors.js";

function RecipeEditPopup({ editForm, setEditForm, onSave, onCancel, isOpen }) {
	if (!isOpen || !editForm) return null;

	const updateEditForm = (field, value) => {
		setEditForm((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const updateEditFormDetails = (field, value) => {
		setEditForm((prev) => ({
			...prev,
			details: {
				...prev.details,
				[field]: value,
			},
		}));
	};

	// syncs ingredients from both parts so main ingredeints isnt exluded from ingredient list
	const syncMainIngredientsWithDetails = (newMainIngredients) => {
		const mainIngredientsArray = newMainIngredients
			.split(",")
			.map((item) => item.trim())
			.filter((item) => item.length > 0)
			.map((item) => item.toLowerCase());

		setEditForm((prev) => {
			const updatedForm = {
				...prev,
				ingredients: newMainIngredients,
			};

			if (mainIngredientsArray.length > 0) {
				const existingDetailedIngredients = prev.details.ingredients || [];
				const updatedDetailedIngredients = [];

				mainIngredientsArray.forEach((mainIngredient) => {
					const existing = existingDetailedIngredients.find(
						(detail) => detail.item.toLowerCase() === mainIngredient
					);
					if (existing) {
						updatedDetailedIngredients.push(existing);
					} else {
						updatedDetailedIngredients.push({
							item: mainIngredient,
							amount_g: 0,
						});
					}
				});

				existingDetailedIngredients.forEach((detail) => {
					const isInMainIngredients = mainIngredientsArray.includes(
						detail.item.toLowerCase()
					);
					if (
						!isInMainIngredients &&
						!updatedDetailedIngredients.find(
							(updated) =>
								updated.item.toLowerCase() === detail.item.toLowerCase()
						)
					) {
						updatedDetailedIngredients.push(detail);
					}
				});

				updatedForm.details = {
					...prev.details,
					ingredients: updatedDetailedIngredients,
				};
			}

			return updatedForm;
		});
	};

	const addInstructionStep = () => {
		updateEditFormDetails("instructions", [
			...editForm.details.instructions,
			"",
		]);
	};

	const removeInstructionStep = (index) => {
		const newInstructions = editForm.details.instructions.filter(
			(_, i) => i !== index
		);
		updateEditFormDetails("instructions", newInstructions);
	};

	const updateInstructionStep = (index, value) => {
		const newInstructions = [...editForm.details.instructions];
		newInstructions[index] = value;
		updateEditFormDetails("instructions", newInstructions);
	};

	const addIngredient = () => {
		updateEditFormDetails("ingredients", [
			...editForm.details.ingredients,
			{ item: "", amount_g: 0 },
		]);
	};

	const removeIngredient = (index) => {
		const ingredientToRemove = editForm.details.ingredients[index];
		const newIngredients = editForm.details.ingredients.filter(
			(_, i) => i !== index
		);

		updateEditFormDetails("ingredients", newIngredients);

		if (ingredientToRemove && ingredientToRemove.item) {
			const mainIngredientsArray = editForm.ingredients
				.split(",")
				.map((item) => item.trim())
				.filter(
					(item) => item.toLowerCase() !== ingredientToRemove.item.toLowerCase()
				);

			updateEditForm("ingredients", mainIngredientsArray.join(", "));
		}
	};

	const updateIngredient = (index, field, value) => {
		const newIngredients = [...editForm.details.ingredients];
		const oldItem = newIngredients[index].item;
		newIngredients[index] = { ...newIngredients[index], [field]: value };
		updateEditFormDetails("ingredients", newIngredients);

		if (field === "item" && oldItem) {
			const mainIngredientsArray = editForm.ingredients
				.split(",")
				.map((item) => item.trim())
				.map((item) =>
					item.toLowerCase() === oldItem.toLowerCase() ? value : item
				)
				.filter((item) => item);

			updateEditForm("ingredients", mainIngredientsArray.join(", "));
		}
	};

	const isMainIngredient = (ingredientName) => {
		const mainIngredientsArray = editForm.ingredients
			.split(",")
			.map((item) => item.trim().toLowerCase())
			.filter((item) => item);
		return mainIngredientsArray.includes(ingredientName.toLowerCase());
	};

	return (
		<div
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				backgroundColor: "rgba(0, 0, 0, 0.5)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				zIndex: 1000,
				padding: "20px",
			}}
		>
			<div
				style={{
					backgroundColor: colors.surface,
					borderRadius: "12px",
					width: "100%",
					maxWidth: "700px",
					maxHeight: "90vh",
					overflowY: "auto",
					boxShadow: shadows.xl,
				}}
			>
				<div
					style={{
						padding: "24px",
						borderBottom: `1px solid ${colors.border}`,
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
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
						Edit Recipe
					</h2>
					<Button variant="ghost" onClick={onCancel}>
						✕
					</Button>
				</div>

				<div style={{ padding: "24px" }}>
					<Input
						label="Recipe Name"
						value={editForm.name}
						onChange={(e) => updateEditForm("name", e.target.value)}
						placeholder="Recipe name"
						required
					/>

					<div style={{ marginBottom: "24px" }}>
						<label
							style={{
								display: "block",
								marginBottom: "12px",
								fontWeight: "500",
								color: colors.text,
								fontSize: "16px",
							}}
						>
							Main Ingredients
						</label>
						<input
							value={editForm.ingredients}
							onChange={(e) => {
								updateEditForm("ingredients", e.target.value);
							}}
							onBlur={(e) => {
								syncMainIngredientsWithDetails(e.target.value);
							}}
							placeholder="Main ingredients (comma separated)"
							style={{
								width: "100%",
								padding: "12px 16px",
								fontSize: "16px",
								border: `2px solid ${colors.border}`,
								borderRadius: "8px",
								outline: "none",
								backgroundColor: colors.background,
								color: colors.text,
							}}
						/>
						<p
							style={{
								fontSize: "12px",
								color: colors.textSecondary,
								margin: "4px 0 0 0",
							}}
						>
							Changes here will sync with ingredients section below when you
							finish typing
						</p>
					</div>

					<div style={{ marginBottom: "24px" }}>
						<label
							style={{
								display: "block",
								marginBottom: "12px",
								fontWeight: "500",
								color: colors.text,
								fontSize: "16px",
							}}
						>
							Instructions
						</label>
						{editForm.details.instructions.map((instruction, index) => (
							<div
								key={index}
								style={{
									display: "flex",
									gap: "12px",
									marginBottom: "12px",
									alignItems: "flex-start",
								}}
							>
								<span
									style={{
										backgroundColor: colors.primary,
										color: "white",
										borderRadius: "50%",
										width: "24px",
										height: "24px",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										fontSize: "12px",
										fontWeight: "600",
										marginTop: "12px",
										flexShrink: 0,
									}}
								>
									{index + 1}
								</span>
								<input
									value={instruction}
									onChange={(e) => updateInstructionStep(index, e.target.value)}
									placeholder={`Step ${index + 1} instructions`}
									style={{
										flex: 1,
										padding: "12px 16px",
										fontSize: "16px",
										border: `2px solid ${colors.border}`,
										borderRadius: "8px",
										outline: "none",
									}}
								/>
								<Button
									variant="danger"
									size="sm"
									onClick={() => removeInstructionStep(index)}
								>
									×
								</Button>
							</div>
						))}
						<Button onClick={addInstructionStep} variant="outline" size="sm">
							+ Add Step
						</Button>
					</div>

					<div style={{ marginBottom: "24px" }}>
						<label
							style={{
								display: "block",
								marginBottom: "12px",
								fontWeight: "500",
								color: colors.text,
								fontSize: "16px",
							}}
						>
							Ingredients & Amounts
						</label>
						<p
							style={{
								fontSize: "12px",
								color: colors.textSecondary,
								margin: "0 0 12px 0",
							}}
						>
							Blue border = main ingredient, Gray border = additional ingredient
						</p>
						{editForm.details.ingredients.map((ingredient, index) => {
							const isMain = isMainIngredient(ingredient.item);
							return (
								<div
									key={index}
									style={{
										display: "flex",
										gap: "12px",
										marginBottom: "12px",
										alignItems: "center",
										backgroundColor: isMain
											? colors.background
											: colors.surface,
										padding: "12px",
										borderRadius: "8px",
										border: `2px solid ${
											isMain ? colors.primary : colors.border
										}`,
									}}
								>
									<input
										value={ingredient.item}
										onChange={(e) =>
											updateIngredient(index, "item", e.target.value)
										}
										placeholder="Ingredient name"
										style={{
											flex: 1,
											padding: "8px 12px",
											fontSize: "14px",
											border: `1px solid ${colors.border}`,
											borderRadius: "6px",
											outline: "none",
											backgroundColor: isMain
												? colors.background
												: colors.surface,
										}}
									/>
									<input
										value={ingredient.amount_g}
										onChange={(e) =>
											updateIngredient(
												index,
												"amount_g",
												parseFloat(e.target.value) || 0
											)
										}
										placeholder="Amount (g)"
										type="number"
										style={{
											width: "100px",
											padding: "8px 12px",
											fontSize: "14px",
											border: `1px solid ${colors.border}`,
											borderRadius: "6px",
											outline: "none",
										}}
									/>
									<Button
										variant="danger"
										size="sm"
										onClick={() => removeIngredient(index)}
									>
										Remove
									</Button>
								</div>
							);
						})}
						<Button onClick={addIngredient} variant="outline" size="sm">
							+ Add Ingredient
						</Button>
					</div>

					<div style={{ marginBottom: "24px" }}>
						<label
							style={{
								display: "block",
								marginBottom: "12px",
								fontWeight: "500",
								color: colors.text,
								fontSize: "16px",
							}}
						>
							Nutrition Information
						</label>
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
								gap: "16px",
							}}
						>
							<div>
								<label
									style={{
										display: "block",
										marginBottom: "6px",
										fontSize: "14px",
										color: colors.textSecondary,
									}}
								>
									Calories
								</label>
								<input
									value={editForm.details.nutrition.calories || ""}
									onChange={(e) =>
										updateEditFormDetails("nutrition", {
											...editForm.details.nutrition,
											calories: parseInt(e.target.value) || 0,
										})
									}
									placeholder="Calories"
									type="number"
									style={{
										width: "100%",
										padding: "8px 12px",
										fontSize: "14px",
										border: `1px solid ${colors.border}`,
										borderRadius: "6px",
										outline: "none",
									}}
								/>
							</div>
							<div>
								<label
									style={{
										display: "block",
										marginBottom: "6px",
										fontSize: "14px",
										color: colors.textSecondary,
									}}
								>
									Protein (g)
								</label>
								<input
									value={editForm.details.nutrition.protein_g || ""}
									onChange={(e) =>
										updateEditFormDetails("nutrition", {
											...editForm.details.nutrition,
											protein_g: parseInt(e.target.value) || 0,
										})
									}
									placeholder="Protein"
									type="number"
									style={{
										width: "100%",
										padding: "8px 12px",
										fontSize: "14px",
										border: `1px solid ${colors.border}`,
										borderRadius: "6px",
										outline: "none",
									}}
								/>
							</div>
							<div>
								<label
									style={{
										display: "block",
										marginBottom: "6px",
										fontSize: "14px",
										color: colors.textSecondary,
									}}
								>
									Fat (g)
								</label>
								<input
									value={editForm.details.nutrition.fat_g || ""}
									onChange={(e) =>
										updateEditFormDetails("nutrition", {
											...editForm.details.nutrition,
											fat_g: parseInt(e.target.value) || 0,
										})
									}
									placeholder="Fat"
									type="number"
									style={{
										width: "100%",
										padding: "8px 12px",
										fontSize: "14px",
										border: `1px solid ${colors.border}`,
										borderRadius: "6px",
										outline: "none",
									}}
								/>
							</div>
							<div>
								<label
									style={{
										display: "block",
										marginBottom: "6px",
										fontSize: "14px",
										color: colors.textSecondary,
									}}
								>
									Carbs (g)
								</label>
								<input
									value={editForm.details.nutrition.carbs_g || ""}
									onChange={(e) =>
										updateEditFormDetails("nutrition", {
											...editForm.details.nutrition,
											carbs_g: parseInt(e.target.value) || 0,
										})
									}
									placeholder="Carbs"
									type="number"
									style={{
										width: "100%",
										padding: "8px 12px",
										fontSize: "14px",
										border: `1px solid ${colors.border}`,
										borderRadius: "6px",
										outline: "none",
									}}
								/>
							</div>
						</div>
					</div>
				</div>

				<div
					style={{
						padding: "24px",
						borderTop: `1px solid ${colors.border}`,
						display: "flex",
						gap: "12px",
						justifyContent: "flex-end",
					}}
				>
					<Button variant="secondary" onClick={onCancel}>
						Cancel
					</Button>
					<Button variant="success" onClick={onSave}>
						Save Changes
					</Button>
				</div>
			</div>
		</div>
	);
}

export default RecipeEditPopup;
