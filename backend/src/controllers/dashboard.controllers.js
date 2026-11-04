import { getMetricasTotales } from "../models/dashboard.models.js";

export const getDashboard = async (req, res) => {
    try {
        
        const metricas = await getMetricasTotales();

        
        return res.json({ payload: metricas });

    } catch (error) {
        console.error("Error al obtener estadísticas del dashboard:", error.message);
        return res.status(500).json({ error: "No se pudieron cargar las estadísticas." });
    }
};
