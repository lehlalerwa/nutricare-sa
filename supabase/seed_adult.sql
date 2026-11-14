-- NUTRICARE SA: STARTER ADULT REFERENCE DATA
-- These entries are migrated from the project's existing adult.csv file.
-- They are starter content only. Review and validate every value and source
-- against current evidence and local protocols before clinical use.

CREATE UNIQUE INDEX IF NOT EXISTS adult_recommendations_condition_unique
ON public.adult_recommendations (condition);

INSERT INTO public.adult_recommendations
(condition, description, energy_kcal_kg_day, protein_g_kg_day,
 fat_percent_energy, carbohydrate_percent_energy, notes, source_reference, display_order)
VALUES
('Chronic Kidney Disease (Stage 3-4)', '', '30–35', '0.6–0.8', '30%', '50–60%',
 'Limit phosphorus and potassium if elevated.', 'Krause’s Food & the Nutrition Care Process, 15th Ed.', 1),
('Diabetes Mellitus Type 2', '', '25–30', '0.8–1.0', '25–35%', '45–60%',
 'Monitor blood glucose and include fiber.', 'ADA Clinical Practice Guidelines', 2),
('HIV/AIDS', '', '30–35', '1.2–2.0', '30–35%', '45–60%',
 'Include micronutrient support; increase protein in weight loss.', 'WHO Nutritional Care for HIV-infected Individuals', 3),
('Cancer (Undergoing Chemotherapy)', '', '25–35', '1.2–1.5', '25–35%', '45–55%',
 'Manage nausea and altered taste; support appetite.', 'ESPEN Guidelines on Nutrition in Cancer Patients', 4),
('Chronic Obstructive Pulmonary Disease (COPD)', '', '30–35', '1.2–1.5', '30–35%', '45–55%',
 'Monitor for weight loss and energy needs in advanced disease.', 'ASPEN Guidelines for COPD', 5),
('Liver Cirrhosis', '', '30–35', '1.2–1.5', '25–30%', '50–60%',
 'Monitor sodium and fluid status; provide B-vitamins.', 'ESPEN Guidelines on Liver Disease', 6),
('Heart Failure', '', '25–30', '1.1–1.4', '25–35%', '50–60%',
 'Monitor fluid balance; small, frequent meals if fatigue.', 'ESC Guidelines for Heart Failure 2021', 7),
('Pressure Ulcers', '', '30–40', '1.25–1.5', '30–35%', '50–55%',
 'Ensure adequate protein for wound healing; supplement with zinc/vitamin C if needed.', 'NPUAP Pressure Ulcer Treatment Guidelines', 8),
('Obesity', '', '20–25', '0.8–1.0', '20–30%', '50–60%',
 'Focus on calorie control; aim for gradual weight loss.', 'South African Food-Based Dietary Guidelines', 9),
('Underweight/Malnutrition', '', '30–40', '1.0–1.5', '25–30%', '50–60%',
 'Nutrient-dense meals; consider oral nutrition supplements.', 'WHO Guidelines for Nutritional Rehabilitation', 10),
('Acute Pancreatitis', '', '25–30 (mild), 30–35 (moderate/severe)', '1.2–1.5', '25–35%', '50–55%',
 'Low fat diet; increase protein if severe inflammation.', 'ASPEN Clinical Guidelines for Pancreatitis', 11),
('Burns (Major >20% TBSA)', '', '30–50', '2.0–2.5', '30–35%', '50–55%',
 'High energy and protein needs; early enteral nutrition preferred.', 'Krause’s Food & the Nutrition Care Process, 15th Ed.', 12)
ON CONFLICT (condition) DO UPDATE SET
 description = EXCLUDED.description,
 energy_kcal_kg_day = EXCLUDED.energy_kcal_kg_day,
 protein_g_kg_day = EXCLUDED.protein_g_kg_day,
 fat_percent_energy = EXCLUDED.fat_percent_energy,
 carbohydrate_percent_energy = EXCLUDED.carbohydrate_percent_energy,
 notes = EXCLUDED.notes,
 source_reference = EXCLUDED.source_reference,
 display_order = EXCLUDED.display_order;
