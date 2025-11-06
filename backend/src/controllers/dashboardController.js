import { getDashboardReadModel } from '../services/dashboardReadModelService.js'

export const getDashboardMetrics = async (req, res, next) => {
  try {
    const snapshot = await getDashboardReadModel()
    res.json(snapshot)
  } catch (error) {
    next(error)
  }
}
