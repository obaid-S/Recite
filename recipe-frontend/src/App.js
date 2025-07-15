import React, { useState } from "react";
import RecipeSearch from "./RecipeSearch";
import RecipeManagement from "./RecipeManagement";
import AddRecipe from "./AddRecipeForm";
import { Button, Card } from "./components/";
import { colors } from "./tokens/colors.js";

export default function App() {
	const [activeTab, setActiveTab] = useState("add");

	return (
		<div
			style={{
				maxWidth: 800,
				margin: "40px auto",
				padding: 20,
				fontFamily: "'Inter', sans-serif",
				color: colors.text,
				backgroundColor: colors.background,
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					marginBottom: "20px",
				}}
			>
				<h1
					style={{
						color: "#1e40af",
						fontSize: "32px",
						fontWeight: "700",
						margin: "0",
						letterSpacing: "-0.5px",
					}}
				>
					Recite.
				</h1>

				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: "12px",
					}}
				>
					<Button
						variant={activeTab === "add" ? "primary" : "outline"}
						onClick={() => setActiveTab("add")}
					>
						➕ Add Recipe
					</Button>
					<Button
						variant={activeTab === "manage" ? "primary" : "outline"}
						onClick={() => setActiveTab("manage")}
					>
						📋 Manage Recipes
					</Button>
					<Button
						variant={activeTab === "search" ? "primary" : "outline"}
						onClick={() => setActiveTab("search")}
					>
						📜 Search
					</Button>
				</div>
			</div>

			<p
				style={{
					color: colors.textSecondary,
					fontSize: "14px",
					margin: "0 0 20px 0",
				}}
			>
				{activeTab === "add" &&
					"Create and save new recipes to your collection"}
				{activeTab === "manage" &&
					"View, edit, and organize your saved recipes"}
				{activeTab === "search" &&
					"Find recipes using ingredients or AI suggestions"}
			</p>

			<Card style={{ padding: 20, minHeight: 400 }}>
				{activeTab === "add" && <AddRecipe />}
				{activeTab === "manage" && <RecipeManagement />}
				{activeTab === "search" && <RecipeSearch />}
			</Card>
		</div>
	);
}
