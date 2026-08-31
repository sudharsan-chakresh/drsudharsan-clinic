import { query } from "./db";

export async function initDrugMaster() {
  await query(`
    CREATE TABLE IF NOT EXISTS drugs (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT,
      form TEXT,
      strength TEXT,
      common_usage TEXT,
      deleted_at TIMESTAMP DEFAULT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
}

export async function seedDrugs() {
  const result = await query("SELECT COUNT(*) AS c FROM drugs");
  if (parseInt(result.rows[0].c) > 0) return;

  const drugs = [
    // Analgesics & Antipyretics
    ["Paracetamol", "Analgesic", "Syrup", "120mg/5ml", "Fever, pain relief"],
    ["Paracetamol", "Analgesic", "Tablet", "500mg", "Fever, pain relief"],
    ["Ibuprofen", "NSAID", "Syrup", "100mg/5ml", "Fever, inflammation"],
    ["Ibuprofen", "NSAID", "Tablet", "200mg", "Fever, inflammation"],

    // Antibiotics
    ["Amoxicillin", "Antibiotic", "Powder for Suspension", "125mg/5ml", "Bacterial infections"],
    ["Amoxicillin", "Antibiotic", "Capsule", "250mg", "Bacterial infections"],
    ["Amoxicillin + Clavulanic Acid", "Antibiotic", "Syrup", "228.5mg/5ml", "Resistant infections"],
    ["Cefixime", "Antibiotic (Cephalosporin)", "Powder for Suspension", "100mg/5ml", "UTI, respiratory infections"],
    ["Azithromycin", "Antibiotic (Macrolide)", "Powder for Suspension", "200mg/5ml", "Respiratory infections"],
    ["Cotrimoxazole", "Antibiotic", "Syrup", "200/40mg/5ml", "UTI, respiratory infections"],

    // Antihistamines
    ["Cetirizine", "Antihistamine", "Syrup", "5mg/5ml", "Allergies, rhinitis"],
    ["Levocetirizine", "Antihistamine", "Syrup", "2.5mg/5ml", "Allergic rhinitis"],
    ["Chlorpheniramine", "Antihistamine", "Syrup", "2mg/5ml", "Cold, allergies"],

    // Cough & Cold
    ["Dextromethorphan", "Antitussive", "Syrup", "15mg/5ml", "Dry cough"],
    ["Guaifenesin", "Expectorant", "Syrup", "100mg/5ml", "Wet cough"],
    ["Ambroxol", "Mucolytic", "Syrup", "15mg/5ml", "Productive cough"],

    // Gastrointestinal
    ["Ondansetron", "Antiemetic", "Syrup", "2mg/5ml", "Vomiting"],
    ["Domperidone", "Prokinetic", "Syrup", "1mg/ml", "Vomiting, GERD"],
    ["Oral Rehydration Salts", "Electrolyte", "Powder", "WHO formula", "Dehydration"],
    ["Zinc Sulfate", "Supplement", "Syrup", "20mg/5ml", "Diarrhea"],
    ["Lactobacillus", "Probiotic", "Powder", "1 billion CFU", "Diarrhea, gut health"],
    ["Simethicone", "Antiflatulent", "Drops", "40mg/ml", "Colic, gas"],

    // Asthma & Respiratory
    ["Salbutamol", "Bronchodilator", "Syrup", "2mg/5ml", "Asthma, bronchospasm"],
    ["Salbutamol", "Bronchodilator", "Inhaler", "100mcg/dose", "Asthma"],
    ["Montelukast", "Leukotriene Antagonist", "Tablet", "4mg", "Asthma, allergies"],
    ["Budesonide", "Corticosteroid", "Inhaler", "100mcg/dose", "Asthma"],

    // Skin
    ["Calamine", "Antipruritic", "Lotion", "8%", "Itching, rashes"],
    ["Clotrimazole", "Antifungal", "Cream", "1%", "Fungal infections"],
    ["Mupirocin", "Antibiotic (Topical)", "Ointment", "2%", "Skin infections"],
    ["Hydrocortisone", "Corticosteroid", "Cream", "1%", "Eczema, dermatitis"],

    // Vitamins & Supplements
    ["Vitamin D3", "Supplement", "Drops", "400 IU/drop", "Rickets prevention"],
    ["Vitamin A", "Supplement", "Capsule", "100000 IU", "Vitamin A deficiency"],
    ["Iron Supplement", "Supplement", "Syrup", "25mg elemental iron/ml", "Anemia"],
    ["Calcium", "Supplement", "Syrup", "250mg/5ml", "Calcium deficiency"],
    ["Multivitamin", "Supplement", "Syrup", "Multiple", "General supplementation"],

    // Eye & Ear
    ["Chloramphenicol", "Antibiotic (Eye)", "Eye Drops", "0.5%", "Conjunctivitis"],
    ["Ofloxacin", "Antibiotic (Eye)", "Eye Drops", "0.3%", "Eye infections"],
    ["Ciprofloxacin", "Antibiotic (Ear)", "Ear Drops", "0.3%", "Ear infections"],

    // Anthelmintics
    ["Albendazole", "Anthelmintic", "Suspension", "200mg/5ml", "Intestinal worms"],
    ["Mebendazole", "Anthelmintic", "Syrup", "100mg/5ml", "Intestinal worms"],
  ];

  for (const drug of drugs) {
    await query(
      "INSERT INTO drugs (name, category, form, strength, common_usage) VALUES ($1, $2, $3, $4, $5)",
      drug
    );
  }
  console.log(`Seeded ${drugs.length} drugs`);
}
