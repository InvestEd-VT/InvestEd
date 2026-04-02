import api from './api';

export interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  completed: boolean;
  completedAt: string | null;
}

const educationService = {
  /**
   * GET /api/v1/education/modules
   */
  getModules: async (): Promise<Module[]> =>
    api.get('/education/modules').then((res) => res.data.modules),

  /**
   * GET /api/v1/education/modules/:id
   */
  getModule: async (id: string): Promise<Module> =>
    api.get(`/education/modules/${id}`).then((res) => res.data.module),

  /**
   * POST /api/v1/education/modules/:id/complete
   */
  completeModule: async (id: string) =>
    api.post(`/education/modules/${id}/complete`).then((res) => res.data.progress),
};

export default educationService;
