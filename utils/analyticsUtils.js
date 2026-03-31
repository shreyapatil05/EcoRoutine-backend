export const calculateCompletionRate = (completedDaysLength, startDate, endDate, normalizeDateFn) => {
  if (!startDate || !endDate) return 0;
  
  const start = normalizeDateFn(startDate).getTime();
  const end = normalizeDateFn(endDate).getTime();
  
  const totalPossibleDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);
  
  const rate = (completedDaysLength / totalPossibleDays) * 100;
  return Math.min(100, Math.max(0, Math.round(rate)));
};

export const calculateImpact = (userTasks) => {
  const impactSummary = {
    totalWaterSaved: 0,
    totalCO2Saved: 0,
    totalPlasticAvoided: 0
  };

  userTasks.forEach((userTask) => {
    const completions = userTask.completedDays ? userTask.completedDays.length : 0;
    
    if (completions > 0 && userTask.taskId && userTask.taskId.impactValue && userTask.taskId.impactUnit) {
      const unit = userTask.taskId.impactUnit;
      const value = userTask.taskId.impactValue * completions;

      if (unit.toLowerCase().includes("liter") || unit.toLowerCase().includes("water")) {
        impactSummary.totalWaterSaved += value;
      } else if (unit.toLowerCase().includes("gram") || unit.toLowerCase().includes("co2")) {
        impactSummary.totalCO2Saved += value;
      } else if (unit.toLowerCase().includes("plastic")) {
        impactSummary.totalPlasticAvoided += value;
      } else {
        // dynamic impact allocation fallback
        if (!impactSummary[unit]) impactSummary[unit] = 0;
        impactSummary[unit] += value;
      }
    }
  });

  return impactSummary;
};
