import Task from "../models/Task.js";

export const getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find() || [];
    res.status(200).json({
      success: true,
      message: "Tasks fetched successfully",
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};

export const createCustomTask = async (req, res, next) => {
  try {
    const { title, description, days, ecoScore } = req.body;
    
    // 1. Combine title and description and convert to lowercase
    const textData = `${title || ""} ${description || ""}`.toLowerCase();
    
    // Default fallback values
    let impactName = "Positive Impact";
    let impactValue = (ecoScore || 10) * 10;
    let impactUnit = "points";

    // Keyword defining sets
    const waterKeywords = ["water", "tap", "shower", "bath", "wash", "brushing", "leak"];
    const plasticKeywords = ["plastic", "bag", "bottle", "recycle", "waste", "trash", "garbage"];
    const energyKeywords = ["energy", "appliance", "charger", "device", "plug"];
    const co2Keywords = ["walk", "cycle", "bike", "car", "drive", "fuel", "travel", "electricity", "light", "fan", "ac", "power", "switch off"];
    const natureKeywords = ["plant", "tree", "garden", "nature", "green"];
    const foodKeywords = ["food", "leftover", "waste food", "meal"];

    // 2. and 3. Array-based matching and Priority implementation
    if (waterKeywords.some(word => textData.includes(word))) {
      impactName = "Water Saved";
      impactValue = 25;
      impactUnit = "liters";
    } else if (plasticKeywords.some(word => textData.includes(word))) {
      impactName = "Plastic Avoided";
      impactValue = 50;
      impactUnit = "grams";
    } else if (energyKeywords.some(word => textData.includes(word))) {
      impactName = "Energy Saved";
      impactValue = 0.5;
      impactUnit = "kWh";
    } else if (co2Keywords.some(word => textData.includes(word))) {
      impactName = "CO2 Reduced";
      impactValue = 300;
      impactUnit = "grams";
    } else if (natureKeywords.some(word => textData.includes(word))) {
      impactName = "CO2 Absorbed";
      impactValue = 30;
      impactUnit = "grams";
    } else if (foodKeywords.some(word => textData.includes(word))) {
      impactName = "Methane Reduced";
      impactValue = 400;
      impactUnit = "grams";
    }

    // Temporary debug logs for classification verification
    console.log("Task:", title);
    console.log("Detected Impact:", impactName);

    const task = await Task.create({
      title,
      description,
      ecoScore: ecoScore || 10,
      impact: impactName.toLowerCase().split(' ')[0], // Backward compatibility
      impactName: impactName,
      impactValue: impactValue,
      impactUnit: impactUnit,
    });

    // Ensure Response Consistency (handled natively by returning the task document schema)
    res.status(201).json({
      success: true,
      message: "Custom task created successfully",
      data: task
    });
  } catch (error) {
    next(error);
  }
};