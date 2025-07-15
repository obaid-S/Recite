import React, { useState, useEffect } from "react";
import RecipeList from "./RecipeList";
import { Button, Card } from "./components/";
import { colors } from "./tokens/colors.js";

function RecipeSearch() {
	const [useAI, setUseAI] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const [recipes, setRecipes] = useState([]);
	const [ingredients, setIngredients] = useState("");
	const [flexibility, setFlexibility] = useState(1);
	const [extrasSlider, setExtrasSlider] = useState(1);
	const [hasSearched, setHasSearched] = useState(false);

	useEffect(() => {
		setRecipes([]);
		setError(null);
		setHasSearched(false);
	}, [useAI]);

	const handleSearch = async () => {
		if (!ingredients.trim()) {
			alert("Please enter some ingredients.");
			return;
		}

		const getMaxExtras = () => {
			if (extrasSlider === 1) return 2;
			if (extrasSlider === 2) return 5;
			return 999;
		};

		try {
			setIsLoading(true);
			setError(null);
			const endpoint = useAI ? "/ai-recipes" : "/search";
			const query = new URLSearchParams({
				ingredients,
				flexibility,
				maxExtras: getMaxExtras(),
			});
			const response = await fetch(`http://localhost:5000${endpoint}?${query}`);
			const data = await response.json();

			if (data.length === 0) {
				setError("No matching recipes found.");
			}

			setRecipes(data);
			setHasSearched(true);
		} catch (err) {
			setError("Something went wrong. Please try again later.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleKeyPress = (e) => {
		if (e.key === "Enter") {
			handleSearch();
		}
	};

	const clearSearch = () => {
		setIngredients("");
		setRecipes([]);
		setError(null);
		setHasSearched(false);
	};

	const getModeButtonStyle = (isActive) => ({
		padding: "10px 16px",
		fontSize: "14px",
		fontWeight: "500",
		border: "2px solid",
		borderRadius: "8px",
		cursor: "pointer",
		transition: "all 0.2s ease",
		backgroundColor: isActive ? "#4f46e5" : "transparent",
		borderColor: isActive ? "#4f46e5" : "#6b7280",
		color: isActive ? "#ffffff" : colors.text,
		display: "flex",
		alignItems: "center",
		gap: "6px",
		boxShadow: isActive ? "0 2px 4px rgba(79, 70, 229, 0.2)" : "none",
	});

	return (
		<div>
			<div style={{ marginBottom: "20px" }}>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						gap: "12px",
						marginBottom: "8px",
					}}
				>
					<p
						style={{
							color: colors.textSecondary,
							fontSize: "16px",
							margin: "0",
							flex: 1,
							minWidth: 0,
						}}
					>
						{useAI
							? "Get creative AI-generated recipes based on your ingredients"
							: "Search your saved recipe database"}
					</p>

					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: "12px",
							flexShrink: 0,
							minWidth: "fit-content",
						}}
					>
						<div
							style={{
								width: ingredients ? "auto" : "0",
								overflow: "hidden",
								transition: "width 0.2s ease",
							}}
						>
							{ingredients && (
								<Button
									variant="outline"
									onClick={clearSearch}
									style={{
										fontSize: "14px",
										padding: "6px 12px",
										height: "38px",
										whiteSpace: "nowrap",
										flexShrink: 0,
										marginRight: "12px",
									}}
								>
									🗑️ Clear
								</Button>
							)}
						</div>
						<button
							style={{
								...getModeButtonStyle(!useAI),
								height: "38px",
								whiteSpace: "nowrap",
								flexShrink: 0,
							}}
							onClick={() => setUseAI(false)}
						>
							📋 Database Mode
						</button>
						<button
							style={{
								...getModeButtonStyle(useAI),
								height: "38px",
								whiteSpace: "nowrap",
								flexShrink: 0,
							}}
							onClick={() => setUseAI(true)}
						>
							🔮 AI Mode
						</button>
					</div>
				</div>
			</div>

			<div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
				<input
					type="text"
					placeholder="Enter ingredients separated by commas (e.g. chicken, tomato, garlic)"
					value={ingredients}
					onChange={(e) => setIngredients(e.target.value)}
					onKeyPress={handleKeyPress}
					style={{
						flex: 1,
						padding: "12px 16px",
						fontSize: "16px",
						border: `2px solid ${colors.border}`,
						borderRadius: "8px",
						outline: "none",
						backgroundColor: colors.card,
						color: colors.text,
					}}
				/>
				<Button variant="primary" onClick={handleSearch} disabled={isLoading}>
					{isLoading ? "🔄 Searching..." : "🔍 Search"}
				</Button>
			</div>

			{useAI && (
				<Card style={{ marginBottom: "20px" }}>
					<h4
						style={{
							color: colors.text,
							fontSize: "16px",
							fontWeight: "600",
							margin: "0 0 16px 0",
						}}
					>
						🔮 AI Search Settings
					</h4>

					<div style={{ marginBottom: "16px" }}>
						<label
							style={{
								display: "block",
								color: colors.text,
								fontSize: "14px",
								fontWeight: "500",
								marginBottom: "8px",
							}}
						>
							Recipe Flexibility:
						</label>
						<select
							value={flexibility}
							onChange={(e) => setFlexibility(parseInt(e.target.value))}
							style={{
								padding: "8px 12px",
								fontSize: "14px",
								border: `2px solid ${colors.border}`,
								borderRadius: "6px",
								backgroundColor: colors.card,
								color: colors.text,
								width: "100%",
								maxWidth: "300px",
							}}
						>
							<option value={1}>Strict - Use only listed ingredients</option>
							<option value={2}>Moderate - Allow some common additions</option>
							<option value={3}>Flexible - Allow creative additions</option>
						</select>
					</div>

					{flexibility !== 1 && (
						<div>
							<label
								style={{
									display: "block",
									color: colors.text,
									fontSize: "14px",
									fontWeight: "500",
									marginBottom: "8px",
								}}
							>
								Extra Ingredients Allowed:
							</label>
							<div
								style={{ display: "flex", alignItems: "center", gap: "12px" }}
							>
								<input
									type="range"
									min="1"
									max="3"
									value={extrasSlider}
									onChange={(e) => setExtrasSlider(parseInt(e.target.value))}
									style={{ flex: 1, maxWidth: "200px" }}
								/>
								<span
									style={{
										color: colors.textSecondary,
										fontSize: "14px",
										minWidth: "100px",
									}}
								>
									{extrasSlider === 1 && "Small (1-2)"}
									{extrasSlider === 2 && "Medium (3-5)"}
									{extrasSlider === 3 && "Large (unlimited)"}
								</span>
							</div>
						</div>
					)}
				</Card>
			)}

			{hasSearched && (
				<div>
					<h3
						style={{
							color: colors.text,
							fontSize: "20px",
							fontWeight: "600",
							margin: "0 0 16px 0",
							display: "flex",
							alignItems: "center",
							gap: "8px",
						}}
					>
						{useAI ? "🔮 AI Recipe Suggestions" : "📋 Database Search Results"}
						{!isLoading && !error && (
							<span
								style={{
									color: colors.textSecondary,
									fontSize: "16px",
									fontWeight: "400",
								}}
							>
								({recipes.length} found)
							</span>
						)}
					</h3>

					{isLoading && (
						<Card>
							<div
								style={{
									textAlign: "center",
									padding: "20px",
									color: colors.textSecondary,
								}}
							>
								<div style={{ fontSize: "24px", marginBottom: "8px" }}>🔄</div>
								<p style={{ margin: "0" }}>
									{useAI
										? "Generating creative recipes..."
										: "Searching database..."}
								</p>
							</div>
						</Card>
					)}

					{error && (
						<Card>
							<div
								style={{
									textAlign: "center",
									padding: "20px",
									color: "#f44336",
								}}
							>
								<div style={{ fontSize: "24px", marginBottom: "8px" }}>❌</div>
								<p style={{ margin: "0" }}>{error}</p>
							</div>
						</Card>
					)}

					{!isLoading && !error && recipes.length === 0 && (
						<Card>
							<div
								style={{
									textAlign: "center",
									padding: "20px",
									color: colors.textSecondary,
								}}
							>
								<div style={{ fontSize: "24px", marginBottom: "8px" }}>🔍</div>
								<p style={{ margin: "0 0 8px 0" }}>
									No recipes found for those ingredients.
								</p>
								<p style={{ margin: "0", fontSize: "14px" }}>
									Try different ingredients or switch to AI mode for creative
									suggestions.
								</p>
							</div>
						</Card>
					)}

					{!isLoading && recipes.length > 0 && (
						<RecipeList recipes={recipes} source={useAI ? "ai" : "db"} />
					)}
				</div>
			)}
		</div>
	);
}

export default RecipeSearch;
