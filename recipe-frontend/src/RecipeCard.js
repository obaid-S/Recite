import { Button, Card, Tag } from "./components/";
import { colors } from "./tokens/colors.js";

function RecipeCard({ recipe, onEdit, onDelete }) {
	let details;
	try {
		details =
			typeof recipe.details === "string"
				? JSON.parse(recipe.details)
				: recipe.details;
	} catch (err) {
		details = { ingredients: [], instructions: [], nutrition: {} };
	}

	return (
		<Card style={{ marginBottom: "20px" }}>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "flex-start",
					marginBottom: "16px",
				}}
			>
				<div>
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
							margin: "0",
						}}
					>
						Created: {new Date(recipe.created_at).toLocaleDateString()}
					</p>
				</div>
				<div style={{ display: "flex", gap: "8px" }}>
					<Button variant="outline" size="sm" onClick={onEdit}>
						✏️ Edit
					</Button>
					<Button variant="danger" size="sm" onClick={onDelete}>
						🗑️ Delete
					</Button>
				</div>
			</div>

			<div style={{ marginBottom: "16px" }}>
				<h4
					style={{
						color: colors.text,
						fontSize: "16px",
						fontWeight: "500",
						margin: "0 0 8px 0",
					}}
				>
					Main Ingredients
				</h4>
				<div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
					{recipe.ingredients.split(", ").map((ingredient, index) => (
						<Tag key={index}>{ingredient}</Tag>
					))}
				</div>
			</div>

			{details.instructions && details.instructions.length > 0 && (
				<div style={{ marginBottom: "16px" }}>
					<h4
						style={{
							color: colors.text,
							fontSize: "16px",
							fontWeight: "500",
							margin: "0 0 12px 0",
						}}
					>
						Instructions
					</h4>
					<ol style={{ paddingLeft: "20px", margin: "0" }}>
						{details.instructions.map((instruction, index) => (
							<li
								key={index}
								style={{
									color: colors.text,
									marginBottom: "8px",
									lineHeight: "1.5",
								}}
							>
								{instruction}
							</li>
						))}
					</ol>
				</div>
			)}

			{details.ingredients && details.ingredients.length > 0 && (
				<div style={{ marginBottom: "16px" }}>
					<h4
						style={{
							color: colors.text,
							fontSize: "16px",
							fontWeight: "500",
							margin: "0 0 12px 0",
						}}
					>
						Detailed Ingredients
					</h4>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
							gap: "8px",
						}}
					>
						{details.ingredients.map((ingredient, index) => (
							<div
								key={index}
								style={{
									backgroundColor: colors.background,
									padding: "8px 12px",
									borderRadius: "6px",
									fontSize: "14px",
									color: colors.text,
								}}
							>
								<strong>{ingredient.item}</strong>: {ingredient.amount_g}g
							</div>
						))}
					</div>
				</div>
			)}

			{details.nutrition &&
				Object.values(details.nutrition).some((val) => val > 0) && (
					<div>
						<h4
							style={{
								color: colors.text,
								fontSize: "16px",
								fontWeight: "500",
								margin: "0 0 12px 0",
							}}
						>
							Nutrition Information
						</h4>
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
								gap: "12px",
							}}
						>
							<div
								style={{
									backgroundColor: colors.background,
									padding: "12px",
									borderRadius: "8px",
									textAlign: "center",
								}}
							>
								<div
									style={{
										fontSize: "18px",
										fontWeight: "600",
										color: colors.text,
									}}
								>
									{details.nutrition.calories || 0}
								</div>
								<div
									style={{
										fontSize: "12px",
										color: colors.textSecondary,
										textTransform: "uppercase",
										fontWeight: "500",
									}}
								>
									Calories
								</div>
							</div>
							<div
								style={{
									backgroundColor: colors.background,
									padding: "12px",
									borderRadius: "8px",
									textAlign: "center",
								}}
							>
								<div
									style={{
										fontSize: "18px",
										fontWeight: "600",
										color: colors.text,
									}}
								>
									{details.nutrition.protein_g || 0}g
								</div>
								<div
									style={{
										fontSize: "12px",
										color: colors.textSecondary,
										textTransform: "uppercase",
										fontWeight: "500",
									}}
								>
									Protein
								</div>
							</div>
							<div
								style={{
									backgroundColor: colors.background,
									padding: "12px",
									borderRadius: "8px",
									textAlign: "center",
								}}
							>
								<div
									style={{
										fontSize: "18px",
										fontWeight: "600",
										color: colors.text,
									}}
								>
									{details.nutrition.fat_g || 0}g
								</div>
								<div
									style={{
										fontSize: "12px",
										color: colors.textSecondary,
										textTransform: "uppercase",
										fontWeight: "500",
									}}
								>
									Fat
								</div>
							</div>
							<div
								style={{
									backgroundColor: colors.background,
									padding: "12px",
									borderRadius: "8px",
									textAlign: "center",
								}}
							>
								<div
									style={{
										fontSize: "18px",
										fontWeight: "600",
										color: colors.text,
									}}
								>
									{details.nutrition.carbs_g || 0}g
								</div>
								<div
									style={{
										fontSize: "12px",
										color: colors.textSecondary,
										textTransform: "uppercase",
										fontWeight: "500",
									}}
								>
									Carbs
								</div>
							</div>
						</div>
					</div>
				)}
		</Card>
	);
}

export default RecipeCard;
