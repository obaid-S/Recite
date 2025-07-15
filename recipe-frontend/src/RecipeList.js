import React, { useState } from "react";
import { Button, Card } from "./components/";
import { colors } from "./tokens/colors.js";

function RecipeList({ recipes, source, onRecipeEdited }) {
	const [saveStatus, setSaveStatus] = useState({});
	const [expandedRecipe, setExpandedRecipe] = useState(null);
	const [instructions, setInstructions] = useState({});
	const [loadingInstructions, setLoadingInstructions] = useState(false);

	const handleSave = async (recipe) => {
		if (!instructions[recipe.name]) return;

		const payload = {
			name: recipe.name,
			ingredients: recipe.ingredients,
			details: instructions[recipe.name],
		};

		try {
			const response = await fetch("http://localhost:5000/save-recipe", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			});

			const result = await response.json();

			if (response.ok && result.success) {
				setSaveStatus((prev) => ({ ...prev, [recipe.name]: "saved" }));
				if (typeof onRecipeEdited === "function") {
					onRecipeEdited();
				}
			} else {
				throw new Error(result.message || "Save failed");
			}
		} catch (err) {
			console.error("Error saving recipe:", err);
			setSaveStatus((prev) => ({ ...prev, [recipe.name]: "error" }));
		}
	};

	const handleViewMore = async (recipe) => {
		const isOpen = expandedRecipe === recipe.name;
		if (isOpen) {
			setExpandedRecipe(null);
			return;
		}

		if (!instructions[recipe.name]) {
			try {
				setLoadingInstructions(true);

				console.log("Looking for recipe:", recipe.name);
				console.log("Recipe ingredients:", recipe.ingredients);

				const dbUrl = `http://localhost:5000/recipe-instructions?name=${encodeURIComponent(
					recipe.name
				)}`;
				console.log("Database URL:", dbUrl);

				const response = await fetch(dbUrl);
				console.log("Database response status:", response.status);

				const dbResult = await response.json();
				console.log("Database result:", dbResult);

				let instructionsData = null;
				//only use ai if not found in db
				if (response.ok && dbResult.exists && dbResult.instructions) {
					instructionsData = {
						instructions: dbResult.instructions.instructions || [],
						ingredients: dbResult.instructions.ingredients || [],
						nutrition: dbResult.instructions.nutrition || {},
					};
					console.log(" Found recipe in database, using database data");
				} else {
					console.log("Recipe not found in database, generating with AI");

					const aiUrl = `http://localhost:5000/ai-instructions?name=${encodeURIComponent(
						recipe.name
					)}&ingredients=${encodeURIComponent(recipe.ingredients)}`;
					console.log("AI URL:", aiUrl);

					const aiResponse = await fetch(aiUrl);
					console.log("AI response status:", aiResponse.status);

					if (aiResponse.ok) {
						const aiData = await aiResponse.json();
						console.log("AI response data:", aiData);

						instructionsData = {
							instructions: aiData.instructions || [],
							ingredients: aiData.ingredients || [],
							nutrition: aiData.nutrition || {},
						};
						console.log("Generated instructions with AI");
					} else {
						const aiError = await aiResponse.text();
						console.error("AI response error:", aiError);
						throw new Error("Failed to generate AI instructions");
					}
				}

				setInstructions((prev) => ({
					...prev,
					[recipe.name]: instructionsData,
				}));
			} catch (err) {
				console.error("❌ Error loading instructions", err);

				console.log("🔄 Using fallback mock data");
				const mockInstructions = {
					instructions: [
						"Prepare all ingredients according to the recipe",
						"Follow proper cooking techniques for best results",
						"Season to taste and serve hot",
						"Enjoy your delicious meal!",
					],
					ingredients: recipe.ingredients.split(", ").map((ing, index) => ({
						item: ing.trim(),
						amount_g: Math.floor(Math.random() * 200) + 50,
					})),
					nutrition: {
						calories: Math.floor(Math.random() * 400) + 200,
						protein_g: Math.floor(Math.random() * 30) + 10,
						fat_g: Math.floor(Math.random() * 20) + 5,
						carbs_g: Math.floor(Math.random() * 50) + 20,
					},
				};

				setInstructions((prev) => ({
					...prev,
					[recipe.name]: mockInstructions,
				}));
			} finally {
				setLoadingInstructions(false);
			}
		}

		setExpandedRecipe(recipe.name);
	};
	if (recipes.length === 0) {
		return null;
	}

	return (
		<div style={{ marginTop: "24px" }}>
			{recipes.map((recipe) => (
				<Card key={recipe.id || recipe.name} style={{ marginBottom: "16px" }}>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "flex-start",
							marginBottom: "12px",
						}}
					>
						<div style={{ flex: 1 }}>
							<h3
								style={{
									color: colors.text,
									fontSize: "20px",
									fontWeight: "600",
									margin: "0 0 8px 0",
								}}
							>
								{recipe.name}
							</h3>
							<p
								style={{
									color: colors.textSecondary,
									fontSize: "14px",
									margin: "0 0 12px 0",
								}}
							>
								<strong>Ingredients:</strong> {recipe.ingredients}
							</p>
						</div>
						<div
							style={{
								backgroundColor: source === "ai" ? "#e3f2fd" : "#f3e5f5",
								color: source === "ai" ? "#1976d2" : "#7b1fa2",
								padding: "4px 8px",
								borderRadius: "4px",
								fontSize: "12px",
								fontWeight: "500",
							}}
						>
							{source === "ai" ? "🔮 AI Generated" : "📋 Database"}
						</div>
					</div>

					<div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
						<Button
							variant="outline"
							onClick={() => handleViewMore(recipe)}
							style={{ fontSize: "14px", padding: "6px 12px" }}
						>
							{expandedRecipe === recipe.name ? "Hide Details" : "View More"}
						</Button>
					</div>

					{expandedRecipe === recipe.name && (
						<div
							style={{
								marginTop: "16px",
								padding: "16px",
								backgroundColor: colors.background,
								borderRadius: "8px",
								border: `1px solid ${colors.border}`,
							}}
						>
							{loadingInstructions ? (
								<p style={{ color: colors.textSecondary, fontStyle: "italic" }}>
									Loading details...
								</p>
							) : (
								instructions[recipe.name] && (
									<div>
										<h4
											style={{
												color: colors.text,
												fontSize: "16px",
												fontWeight: "600",
												margin: "0 0 12px 0",
											}}
										>
											📝 Instructions
										</h4>
										<ol
											style={{
												color: colors.text,
												fontSize: "14px",
												lineHeight: "1.5",
												marginBottom: "16px",
											}}
										>
											{instructions[recipe.name].instructions.map(
												(step, index) => (
													<li key={index} style={{ marginBottom: "4px" }}>
														{step}
													</li>
												)
											)}
										</ol>

										<h4
											style={{
												color: colors.text,
												fontSize: "16px",
												fontWeight: "600",
												margin: "0 0 12px 0",
											}}
										>
											🥄 Ingredients (amounts)
										</h4>
										<ul
											style={{
												color: colors.text,
												fontSize: "14px",
												lineHeight: "1.5",
												marginBottom: "16px",
												listStyle: "none",
												padding: "0",
											}}
										>
											{instructions[recipe.name].ingredients.map(
												(ing, index) => (
													<li
														key={index}
														style={{
															marginBottom: "4px",
															padding: "4px 8px",
															backgroundColor: colors.card,
															borderRadius: "4px",
															border: `1px solid ${colors.border}`,
														}}
													>
														<strong>{ing.item}:</strong> {ing.amount_g}g
													</li>
												)
											)}
										</ul>

										<h4
											style={{
												color: colors.text,
												fontSize: "16px",
												fontWeight: "600",
												margin: "0 0 12px 0",
											}}
										>
											🍽️ Nutrition Information
										</h4>
										<div
											style={{
												display: "grid",
												gridTemplateColumns:
													"repeat(auto-fit, minmax(120px, 1fr))",
												gap: "8px",
												marginBottom: "16px",
											}}
										>
											<div
												style={{
													padding: "8px 12px",
													backgroundColor: colors.card,
													borderRadius: "4px",
													border: `1px solid ${colors.border}`,
													textAlign: "center",
												}}
											>
												<div
													style={{
														color: colors.textSecondary,
														fontSize: "12px",
													}}
												>
													Calories
												</div>
												<div
													style={{
														color: colors.text,
														fontSize: "16px",
														fontWeight: "600",
													}}
												>
													{instructions[recipe.name].nutrition.calories}
												</div>
											</div>
											<div
												style={{
													padding: "8px 12px",
													backgroundColor: colors.card,
													borderRadius: "4px",
													border: `1px solid ${colors.border}`,
													textAlign: "center",
												}}
											>
												<div
													style={{
														color: colors.textSecondary,
														fontSize: "12px",
													}}
												>
													Protein
												</div>
												<div
													style={{
														color: colors.text,
														fontSize: "16px",
														fontWeight: "600",
													}}
												>
													{instructions[recipe.name].nutrition.protein_g}g
												</div>
											</div>
											<div
												style={{
													padding: "8px 12px",
													backgroundColor: colors.card,
													borderRadius: "4px",
													border: `1px solid ${colors.border}`,
													textAlign: "center",
												}}
											>
												<div
													style={{
														color: colors.textSecondary,
														fontSize: "12px",
													}}
												>
													Fat
												</div>
												<div
													style={{
														color: colors.text,
														fontSize: "16px",
														fontWeight: "600",
													}}
												>
													{instructions[recipe.name].nutrition.fat_g}g
												</div>
											</div>
											<div
												style={{
													padding: "8px 12px",
													backgroundColor: colors.card,
													borderRadius: "4px",
													border: `1px solid ${colors.border}`,
													textAlign: "center",
												}}
											>
												<div
													style={{
														color: colors.textSecondary,
														fontSize: "12px",
													}}
												>
													Carbs
												</div>
												<div
													style={{
														color: colors.text,
														fontSize: "16px",
														fontWeight: "600",
													}}
												>
													{instructions[recipe.name].nutrition.carbs_g}g
												</div>
											</div>
										</div>

										<div
											style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
										>
											{source === "ai" ? (
												<Button
													variant="primary"
													onClick={() => handleSave(recipe)}
													style={{ fontSize: "14px", padding: "8px 16px" }}
												>
													💾 Save to Database
												</Button>
											) : (
												<Button
													variant="outline"
													onClick={() =>
														console.log("Edit recipe:", recipe.name)
													}
													style={{ fontSize: "14px", padding: "8px 16px" }}
												>
													✏️ Edit Recipe
												</Button>
											)}
										</div>

										{saveStatus[recipe.name] === "saved" && (
											<p
												style={{
													color: "#4caf50",
													fontSize: "14px",
													marginTop: "8px",
													margin: "8px 0 0 0",
												}}
											>
												✅ Recipe saved successfully!
											</p>
										)}
										{saveStatus[recipe.name] === "error" && (
											<p
												style={{
													color: "#f44336",
													fontSize: "14px",
													marginTop: "8px",
													margin: "8px 0 0 0",
												}}
											>
												❌ Failed to save recipe.
											</p>
										)}
									</div>
								)
							)}
						</div>
					)}
				</Card>
			))}
		</div>
	);
}
export default RecipeList;
