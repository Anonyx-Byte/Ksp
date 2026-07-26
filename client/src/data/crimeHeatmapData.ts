export interface HeatmapPoint {
  lat: number;
  lon: number;
  intensity: number; // 0.1 to 1.0
}

// Generate clustered data based on major cities
const generateCluster = (centerLat: number, centerLon: number, count: number, spread: number, maxIntensity: number): HeatmapPoint[] => {
  const points: HeatmapPoint[] = [];
  for (let i = 0; i < count; i++) {
    const latOffset = (Math.random() - 0.5) * spread;
    const lonOffset = (Math.random() - 0.5) * spread;
    const intensity = Math.random() * maxIntensity;
    points.push({
      lat: centerLat + latOffset,
      lon: centerLon + lonOffset,
      intensity: Math.max(0.1, intensity)
    });
  }
  return points;
};

export const crimeHeatmapData: HeatmapPoint[] = [
  ...generateCluster(12.9716, 77.5946, 200, 0.3, 1.0), // Bengaluru Urban
  ...generateCluster(12.2958, 76.6394, 80, 0.15, 0.8), // Mysuru
  ...generateCluster(12.9141, 74.8560, 60, 0.1, 0.7), // Mangaluru
  ...generateCluster(15.8497, 74.4977, 50, 0.12, 0.6), // Belagavi
  ...generateCluster(15.3647, 75.1240, 70, 0.15, 0.8), // Hubballi-Dharwad
  ...generateCluster(17.3297, 76.8343, 40, 0.1, 0.5), // Kalaburagi
  ...generateCluster(15.1394, 76.9214, 40, 0.1, 0.5), // Ballari
  ...generateCluster(16.8302, 75.7100, 30, 0.1, 0.6), // Vijayapura
  ...generateCluster(13.3409, 74.7421, 30, 0.08, 0.5), // Udupi
  ...generateCluster(15.3173, 75.7139, 100, 3.0, 0.3) // Random spread across state
];
